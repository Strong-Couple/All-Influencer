import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { JwtCookieService } from '../src/common/services/jwt-cookie.service';
import { RefreshSessionService } from '../src/common/services/refresh-session.service';

describe('OAuth Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtCookieService: JwtCookieService;
  let refreshSessionService: RefreshSessionService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtCookieService = moduleFixture.get<JwtCookieService>(JwtCookieService);
    refreshSessionService = moduleFixture.get<RefreshSessionService>(RefreshSessionService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 테스트 데이터 정리
    await prismaService.refreshSession.deleteMany();
    await prismaService.userIdentity.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('OAuth 로그인 플로우', () => {
    it('GET /auth/google - Google OAuth 로그인 시작', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/google')
        .expect(302);

      // Google OAuth URL로 리다이렉트 확인
      expect(response.headers.location).toMatch(/accounts\.google\.com\/oauth/);
    });

    it('GET /auth/kakao - Kakao OAuth 로그인 시작', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/kakao')
        .expect(302);

      // Kakao OAuth URL로 리다이렉트 확인
      expect(response.headers.location).toMatch(/kauth\.kakao\.com/);
    });

    it('GET /auth/naver - Naver OAuth 로그인 시작', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/naver')
        .expect(302);

      // Naver OAuth URL로 리다이렉트 확인
      expect(response.headers.location).toMatch(/nid\.naver\.com/);
    });
  });

  describe('OAuth 콜백 처리', () => {
    // 실제 OAuth 콜백 테스트는 외부 서비스 의존성으로 인해 모킹 필요
    it('OAuth 콜백 실패 시 에러 페이지로 리다이렉트', async () => {
      // OAuth 에러가 있는 경우를 시뮬레이션
      const response = await request(app.getHttpServer())
        .get('/auth/google/callback?error=access_denied')
        .expect(302);

      expect(response.headers.location).toMatch(/\/auth\/failure/);
    });
  });

  describe('계정 연결 관리', () => {
    let authCookie: string;
    let testUser: any;

    beforeEach(async () => {
      // 테스트 사용자 생성
      testUser = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          passwordHash: 'hashed-password',
          role: 'INFLUENCER',
          status: 'ACTIVE',
        },
      });

      // 인증 토큰 생성
      const tokens = jwtCookieService.generateTokenPair({
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      // Refresh 세션 생성
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      await refreshSessionService.createSession({
        userId: testUser.id,
        jti: tokens.jti,
        expiresAt,
      });

      authCookie = `access_token=${tokens.accessToken}`;
    });

    it('GET /auth/link - 연결된 계정 목록 조회', async () => {
      // Google 계정 연결
      await prismaService.userIdentity.create({
        data: {
          userId: testUser.id,
          provider: 'GOOGLE',
          providerUserId: 'google123',
          email: 'test@gmail.com',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/link')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.identities).toHaveLength(1);
      expect(response.body.identities[0].provider).toBe('google');
      expect(response.body.hasPassword).toBe(true);
      expect(response.body.totalAuthMethods).toBe(2);
    });

    it('DELETE /auth/link/:provider - 계정 연결 해제', async () => {
      // Google 계정 연결
      await prismaService.userIdentity.create({
        data: {
          userId: testUser.id,
          provider: 'GOOGLE',
          providerUserId: 'google123',
          email: 'test@gmail.com',
        },
      });

      const response = await request(app.getHttpServer())
        .delete('/auth/link/google')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully unlinked');

      // 실제로 연결이 해제되었는지 확인
      const identity = await prismaService.userIdentity.findUnique({
        where: {
          provider_providerUserId: {
            provider: 'GOOGLE',
            providerUserId: 'google123',
          },
        },
      });
      expect(identity).toBeNull();
    });

    it('DELETE /auth/link/:provider - 마지막 인증 방법 해제 시 오류', async () => {
      // 패스워드 제거 (OAuth만 남김)
      await prismaService.user.update({
        where: { id: testUser.id },
        data: { passwordHash: null },
      });

      // Google 계정만 연결
      await prismaService.userIdentity.create({
        data: {
          userId: testUser.id,
          provider: 'GOOGLE',
          providerUserId: 'google123',
          email: 'test@gmail.com',
        },
      });

      const response = await request(app.getHttpServer())
        .delete('/auth/link/google')
        .set('Cookie', authCookie)
        .expect(403);

      expect(response.body.message).toContain('Cannot unlink the last authentication method');
    });

    it('DELETE /auth/link/:provider - 잘못된 프로바이더', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/link/invalid-provider')
        .set('Cookie', authCookie)
        .expect(400);

      expect(response.body.message).toBe('Invalid provider');
    });

    it('DELETE /auth/link/:provider - 연결되지 않은 계정 해제 시도', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/link/google')
        .set('Cookie', authCookie)
        .expect(400);

      expect(response.body.message).toBe('No linked account found for this provider');
    });
  });

  describe('JWT 쿠키 인증', () => {
    let testUser: any;
    let authCookie: string;

    beforeEach(async () => {
      // 테스트 사용자 생성
      testUser = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'INFLUENCER',
          status: 'ACTIVE',
        },
      });

      // OAuth 계정 연결
      await prismaService.userIdentity.create({
        data: {
          userId: testUser.id,
          provider: 'GOOGLE',
          providerUserId: 'google123',
          email: 'test@gmail.com',
        },
      });

      // 인증 토큰 생성
      const tokens = jwtCookieService.generateTokenPair({
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      authCookie = `access_token=${tokens.accessToken}`;
    });

    it('GET /auth/me - 현재 사용자 정보 조회 (OAuth 포함)', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.linkedAccounts).toHaveLength(1);
      expect(response.body.user.linkedAccounts[0].provider).toBe('google');
      expect(response.body.user.authMethods.oauth).toBe(true);
      expect(response.body.user.authMethods.providers).toContain('google');
    });

    it('GET /auth/me - 인증되지 않은 요청', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      expect(response.body.message).toContain('Invalid or expired authentication token');
    });
  });

  describe('토큰 관리', () => {
    let testUser: any;
    let refreshCookie: string;
    let jti: string;

    beforeEach(async () => {
      // 테스트 사용자 생성
      testUser = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'INFLUENCER',
          status: 'ACTIVE',
        },
      });

      // 토큰 생성
      const tokens = jwtCookieService.generateTokenPair({
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      jti = tokens.jti;
      refreshCookie = `refresh_token=${tokens.refreshToken}`;

      // Refresh 세션 생성
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      await refreshSessionService.createSession({
        userId: testUser.id,
        jti,
        expiresAt,
      });
    });

    it('POST /auth/refresh - 토큰 갱신', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tokens refreshed successfully');

      // 새로운 토큰이 쿠키로 설정되었는지 확인
      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();
      expect(setCookieHeaders.some((cookie: string) => cookie.includes('access_token'))).toBe(true);
    });

    it('POST /auth/refresh - 유효하지 않은 Refresh 토큰', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('POST /auth/refresh - Refresh 토큰 없음', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);

      expect(response.body.message).toBe('Refresh token not found');
    });
  });
});
