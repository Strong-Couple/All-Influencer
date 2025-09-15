import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/database';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string; // user ID
  jti: string; // JWT ID
  type: 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Access Token 생성
   */
  generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Refresh Token 생성 및 저장
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const jti = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후

    // 기존 Refresh Token 정리 (사용자당 최대 5개 유지)
    await this.cleanupUserRefreshTokens(userId);

    // 새로운 Refresh Token 저장
    await this.prismaService.refreshToken.create({
      data: {
        userId,
        jti,
        expiresAt,
      },
    });

    const payload: RefreshTokenPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Access Token 검증
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      this.logger.warn(`Invalid access token: ${error.message}`);
      throw new Error('Invalid access token');
    }
  }

  /**
   * Refresh Token 검증 및 화이트리스트 확인
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);
      
      // 화이트리스트에서 토큰 확인
      const refreshToken = await this.prismaService.refreshToken.findUnique({
        where: { jti: payload.jti },
      });

      if (!refreshToken) {
        throw new Error('Refresh token not found in whitelist');
      }

      if (refreshToken.expiresAt < new Date()) {
        // 만료된 토큰 삭제
        await this.prismaService.refreshToken.delete({
          where: { jti: payload.jti },
        });
        throw new Error('Refresh token expired');
      }

      return payload;
    } catch (error) {
      this.logger.warn(`Invalid refresh token: ${error.message}`);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Refresh Token 무효화 (로그아웃)
   */
  async revokeRefreshToken(jti: string): Promise<void> {
    try {
      await this.prismaService.refreshToken.delete({
        where: { jti },
      });
      this.logger.log(`Refresh token revoked: ${jti}`);
    } catch (error) {
      this.logger.warn(`Failed to revoke refresh token: ${error.message}`);
    }
  }

  /**
   * 사용자의 모든 Refresh Token 무효화
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    try {
      await this.prismaService.refreshToken.deleteMany({
        where: { userId },
      });
      this.logger.log(`All refresh tokens revoked for user: ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to revoke user refresh tokens: ${error.message}`);
    }
  }

  /**
   * 토큰 회전 (새로운 Access + Refresh Token 발급)
   */
  async rotateTokens(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    
    // 기존 Refresh Token 무효화
    await this.revokeRefreshToken(payload.jti);

    // 사용자 정보 조회
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('User not found or inactive');
    }

    // 새로운 토큰 발급
    const newAccessToken = this.generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60, // 15분
    };
  }

  /**
   * 사용자의 오래된 Refresh Token 정리
   */
  private async cleanupUserRefreshTokens(userId: string) {
    const tokens = await this.prismaService.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 최신 4개를 제외한 나머지 삭제
    if (tokens.length >= 5) {
      const tokensToDelete = tokens.slice(4);
      const jtiToDelete = tokensToDelete.map(token => token.jti);
      
      await this.prismaService.refreshToken.deleteMany({
        where: { jti: { in: jtiToDelete } },
      });
    }

    // 만료된 토큰 정리
    await this.prismaService.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });
  }

  /**
   * 만료된 Refresh Token 정리 (크론 작업용)
   */
  async cleanupExpiredRefreshTokens() {
    try {
      const result = await this.prismaService.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      
      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`);
    }
  }
}

