import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { OAuthIntegrationService } from './oauth-integration.service';
import { PrismaService } from '../../../common/database/prisma.service';
import { JwtCookieService } from '../../../common/services/jwt-cookie.service';
import { RefreshSessionService } from '../../../common/services/refresh-session.service';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import { AuthProvider } from '@prisma/client';
import { OAuthUser } from '../strategies/google.strategy';

describe('OAuthIntegrationService', () => {
  let service: OAuthIntegrationService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtCookieService: jest.Mocked<JwtCookieService>;
  let refreshSessionService: jest.Mocked<RefreshSessionService>;
  let encryptionUtil: jest.Mocked<EncryptionUtil>;

  const mockOAuthUser: OAuthUser = {
    provider: 'GOOGLE',
    providerId: 'google123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    rawProfile: {
      id: 'google123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  };

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'INFLUENCER' as const,
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      userIdentity: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockJwtCookieService = {
      generateTokenPair: jest.fn(),
      setTokenCookies: jest.fn(),
    };

    const mockRefreshSessionService = {
      createSession: jest.fn(),
    };

    const mockEncryptionUtil = {
      encrypt: jest.fn(),
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthIntegrationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtCookieService, useValue: mockJwtCookieService },
        { provide: RefreshSessionService, useValue: mockRefreshSessionService },
        { provide: EncryptionUtil, useValue: mockEncryptionUtil },
      ],
    }).compile();

    service = module.get<OAuthIntegrationService>(OAuthIntegrationService);
    prismaService = module.get(PrismaService);
    jwtCookieService = module.get(JwtCookieService);
    refreshSessionService = module.get(RefreshSessionService);
    encryptionUtil = module.get(EncryptionUtil);
  });

  describe('integrateUser', () => {
    it('기존 OAuth 연동이 있는 경우 해당 사용자로 로그인', async () => {
      // Arrange
      const existingIdentity = {
        id: 'identity1',
        userId: 'user1',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google123',
      };

      prismaService.userIdentity.findUnique.mockResolvedValue(existingIdentity);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.userIdentity.update.mockResolvedValue(existingIdentity);

      // Act
      const result = await service.integrateUser(mockOAuthUser);

      // Assert
      expect(result.isNewUser).toBe(false);
      expect(result.isNewIdentity).toBe(false);
      expect(result.user).toEqual(mockUser);
      expect(prismaService.userIdentity.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerUserId: {
            provider: 'GOOGLE',
            providerUserId: 'google123',
          },
        },
      });
    });

    it('동일 이메일의 기존 사용자가 있으면 OAuth 계정 연결', async () => {
      // Arrange
      prismaService.userIdentity.findUnique.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.userIdentity.create.mockResolvedValue({
        id: 'identity1',
        userId: 'user1',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google123',
        email: 'test@example.com',
        linkedAt: new Date(),
        updatedAt: new Date(),
      });

      encryptionUtil.encrypt.mockReturnValue('encrypted-token');

      // Act
      const result = await service.integrateUser(mockOAuthUser);

      // Assert
      expect(result.isNewUser).toBe(false);
      expect(result.isNewIdentity).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(prismaService.userIdentity.create).toHaveBeenCalled();
    });

    it('새로운 사용자 생성 (OAuth 기반)', async () => {
      // Arrange
      prismaService.userIdentity.findUnique.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.userIdentity.create.mockResolvedValue({
        id: 'identity1',
        userId: 'user1',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google123',
        email: 'test@example.com',
        linkedAt: new Date(),
        updatedAt: new Date(),
      });

      encryptionUtil.encrypt.mockReturnValue('encrypted-token');

      // Act
      const result = await service.integrateUser(mockOAuthUser);

      // Assert
      expect(result.isNewUser).toBe(true);
      expect(result.isNewIdentity).toBe(true);
      expect(result.requiresEmailVerification).toBe(false);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          displayName: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
          role: 'INFLUENCER',
          status: 'ACTIVE',
        },
      });
    });

    it('계정 연결 모드에서 이미 연결된 계정인 경우 오류 발생', async () => {
      // Arrange
      const existingIdentity = {
        id: 'identity1',
        userId: 'other-user',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google123',
      };

      prismaService.userIdentity.findUnique.mockResolvedValue(existingIdentity);

      // Act & Assert
      await expect(
        service.integrateUser(mockOAuthUser, true, 'current-user')
      ).rejects.toThrow(ConflictException);
    });

    it('이메일이 없는 OAuth 사용자의 경우 이메일 확인 필요 플래그 설정', async () => {
      // Arrange
      const oauthUserWithoutEmail = {
        ...mockOAuthUser,
        email: undefined,
      };

      prismaService.userIdentity.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: null,
      });
      prismaService.userIdentity.create.mockResolvedValue({
        id: 'identity1',
        userId: 'user1',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google123',
        email: null,
        linkedAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.integrateUser(oauthUserWithoutEmail);

      // Assert
      expect(result.requiresEmailVerification).toBe(true);
    });
  });

  describe('completeOAuthLogin', () => {
    it('JWT 토큰 발급 및 세션 생성', async () => {
      // Arrange
      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        jti: 'jwt-id',
      };

      jwtCookieService.generateTokenPair.mockReturnValue(mockTokens);
      refreshSessionService.createSession.mockResolvedValue({} as any);
      prismaService.user.update.mockResolvedValue(mockUser);

      // Act
      await service.completeOAuthLogin(
        mockUser,
        mockResponse,
        'test-user-agent',
        '127.0.0.1'
      );

      // Assert
      expect(jwtCookieService.generateTokenPair).toHaveBeenCalledWith({
        sub: 'user1',
        email: 'test@example.com',
        role: 'INFLUENCER',
      });

      expect(refreshSessionService.createSession).toHaveBeenCalledWith({
        userId: 'user1',
        jti: 'jwt-id',
        expiresAt: expect.any(Date),
        userAgent: 'test-user-agent',
        ipAddress: '127.0.0.1',
      });

      expect(jwtCookieService.setTokenCookies).toHaveBeenCalledWith(
        mockResponse,
        mockTokens
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });
  });
});
