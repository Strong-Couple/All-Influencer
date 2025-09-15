import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { JwtCookieService, JwtPayload } from '../../../common/services/jwt-cookie.service';
import { RefreshSessionService } from '../../../common/services/refresh-session.service';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import { OAuthUser } from '../strategies/google.strategy';
import { AuthProvider, User, UserIdentity } from '@prisma/client';
import { Response } from 'express';

export interface IntegrationResult {
  user: User;
  isNewUser: boolean;
  isNewIdentity: boolean;
  requiresEmailVerification: boolean;
}

/**
 * OAuth 계정 통합 서비스
 * 소셜 로그인 시 계정 매칭/생성/연결 로직 처리
 */
@Injectable()
export class OAuthIntegrationService {
  private readonly logger = new Logger(OAuthIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtCookieService: JwtCookieService,
    private readonly refreshSessionService: RefreshSessionService,
    private readonly encryptionUtil: EncryptionUtil,
  ) {}

  /**
   * OAuth 사용자 정보로 계정 통합 처리
   * @param oauthUser OAuth 프로필 정보
   * @param isLinking 기존 로그인 사용자의 계정 연결 여부
   * @param currentUserId 계정 연결시 현재 사용자 ID
   */
  async integrateUser(
    oauthUser: OAuthUser,
    isLinking = false,
    currentUserId?: string,
  ): Promise<IntegrationResult> {
    this.logger.debug(
      `Integrating ${oauthUser.provider} user: ${oauthUser.providerId}`,
    );

    // 1. 기존 OAuth 연동 정보 확인
    const existingIdentity = await this.findExistingIdentity(
      oauthUser.provider,
      oauthUser.providerId,
    );

    if (existingIdentity) {
      // 이미 연동된 계정이 있음
      if (isLinking && existingIdentity.userId !== currentUserId) {
        throw new ConflictException(
          `This ${oauthUser.provider} account is already linked to another user`,
        );
      }

      // 기존 사용자로 로그인
      const user = await this.updateUserFromOAuth(existingIdentity.userId, oauthUser);
      await this.updateIdentityTokens(existingIdentity.id, oauthUser);

      return {
        user,
        isNewUser: false,
        isNewIdentity: false,
        requiresEmailVerification: false,
      };
    }

    // 2. 계정 연결 모드인 경우
    if (isLinking && currentUserId) {
      return await this.linkAccountToExistingUser(currentUserId, oauthUser);
    }

    // 3. 새로운 OAuth 로그인 - 이메일 기반 매칭 시도
    if (oauthUser.email) {
      const existingUser = await this.findUserByEmail(oauthUser.email);
      
      if (existingUser) {
        // 동일 이메일의 기존 사용자에게 OAuth 계정 연결
        return await this.linkAccountToExistingUser(existingUser.id, oauthUser);
      }
    }

    // 4. 완전히 새로운 사용자 생성
    return await this.createNewUserWithOAuth(oauthUser);
  }

  /**
   * OAuth 로그인 완료 후 JWT 토큰 발급 및 쿠키 설정
   */
  async completeOAuthLogin(
    user: User,
    response: Response,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    // JWT 페이로드 생성
    const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email || undefined,
      role: user.role,
    };

    // Access/Refresh 토큰 생성
    const tokens = this.jwtCookieService.generateTokenPair(jwtPayload);

    // Refresh 세션 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14일 후

    await this.refreshSessionService.createSession({
      userId: user.id,
      jti: tokens.jti,
      expiresAt,
      userAgent,
      ipAddress,
    });

    // 쿠키 설정
    this.jwtCookieService.setTokenCookies(response, tokens);

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.debug(`OAuth login completed for user ${user.id}`);
  }

  /**
   * 기존 OAuth 연동 정보 조회
   */
  private async findExistingIdentity(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserIdentity | null> {
    return this.prisma.userIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: providerId,
        },
      },
    });
  }

  /**
   * 이메일로 사용자 조회
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 기존 사용자에게 OAuth 계정 연결
   */
  private async linkAccountToExistingUser(
    userId: string,
    oauthUser: OAuthUser,
  ): Promise<IntegrationResult> {
    // 사용자 정보 업데이트 (비어있는 필드만)
    const user = await this.updateUserFromOAuth(userId, oauthUser);

    // OAuth 연동 정보 생성
    await this.createIdentity(userId, oauthUser);

    this.logger.debug(
      `Linked ${oauthUser.provider} account to existing user ${userId}`,
    );

    return {
      user,
      isNewUser: false,
      isNewIdentity: true,
      requiresEmailVerification: false,
    };
  }

  /**
   * 새로운 사용자 생성 (OAuth 기반)
   */
  private async createNewUserWithOAuth(
    oauthUser: OAuthUser,
  ): Promise<IntegrationResult> {
    const requiresEmailVerification = !oauthUser.email;

    // 새 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email: oauthUser.email,
        displayName: oauthUser.name || `${oauthUser.provider} User`,
        avatar: oauthUser.avatar,
        role: 'INFLUENCER', // 기본값
        status: 'ACTIVE',
      },
    });

    // OAuth 연동 정보 생성
    await this.createIdentity(user.id, oauthUser);

    this.logger.debug(`Created new user ${user.id} from ${oauthUser.provider}`);

    return {
      user,
      isNewUser: true,
      isNewIdentity: true,
      requiresEmailVerification,
    };
  }

  /**
   * OAuth 정보로 사용자 정보 업데이트 (비어있는 필드만)
   */
  private async updateUserFromOAuth(
    userId: string,
    oauthUser: OAuthUser,
  ): Promise<User> {
    const updateData: any = {};

    // 비어있는 필드만 업데이트
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new BadRequestException('User not found');
    }

    if (!currentUser.displayName && oauthUser.name) {
      updateData.displayName = oauthUser.name;
    }

    if (!currentUser.avatar && oauthUser.avatar) {
      updateData.avatar = oauthUser.avatar;
    }

    if (!currentUser.email && oauthUser.email) {
      // 이메일 중복 확인
      const emailExists = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });
      
      if (!emailExists) {
        updateData.email = oauthUser.email;
      }
    }

    // 업데이트할 데이터가 있으면 업데이트
    if (Object.keys(updateData).length > 0) {
      return this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    return currentUser;
  }

  /**
   * OAuth 연동 정보 생성
   */
  private async createIdentity(
    userId: string,
    oauthUser: OAuthUser,
  ): Promise<UserIdentity> {
    const accessTokenEnc = oauthUser.rawProfile.accessToken
      ? this.encryptionUtil.encrypt(oauthUser.rawProfile.accessToken)
      : null;

    const refreshTokenEnc = oauthUser.rawProfile.refreshToken
      ? this.encryptionUtil.encrypt(oauthUser.rawProfile.refreshToken)
      : null;

    return this.prisma.userIdentity.create({
      data: {
        userId,
        provider: oauthUser.provider,
        providerUserId: oauthUser.providerId,
        email: oauthUser.email,
        accessTokenEnc,
        refreshTokenEnc,
        rawData: oauthUser.rawProfile,
      },
    });
  }

  /**
   * OAuth 연동 정보의 토큰 업데이트
   */
  private async updateIdentityTokens(
    identityId: string,
    oauthUser: OAuthUser,
  ): Promise<void> {
    const updateData: any = {};

    if (oauthUser.rawProfile.accessToken) {
      updateData.accessTokenEnc = this.encryptionUtil.encrypt(
        oauthUser.rawProfile.accessToken,
      );
    }

    if (oauthUser.rawProfile.refreshToken) {
      updateData.refreshTokenEnc = this.encryptionUtil.encrypt(
        oauthUser.rawProfile.refreshToken,
      );
    }

    // 원본 프로필 데이터 업데이트
    updateData.rawData = oauthUser.rawProfile;
    updateData.updatedAt = new Date();

    await this.prisma.userIdentity.update({
      where: { id: identityId },
      data: updateData,
    });
  }
}
