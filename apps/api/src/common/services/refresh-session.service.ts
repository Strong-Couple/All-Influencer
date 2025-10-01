import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RefreshSession } from '@prisma/client';
import { EncryptionUtil } from '../utils/encryption.util';

export interface CreateSessionOptions {
  userId: string;
  jti: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Refresh 토큰 세션 관리 서비스
 * 쿠키 기반 JWT Refresh 토큰의 생명주기 관리
 */
@Injectable()
export class RefreshSessionService {
  private readonly logger = new Logger(RefreshSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionUtil: EncryptionUtil,
  ) {}

  /**
   * 새로운 Refresh 세션 생성
   */
  async createSession(options: CreateSessionOptions): Promise<RefreshSession> {
    const { userId, jti, expiresAt, userAgent, ipAddress } = options;

    const session = await this.prisma.refreshSession.create({
      data: {
        userId,
        jti,
        expiresAt,
        uaHash: userAgent ? this.encryptionUtil.hash(userAgent) : null,
        ipHash: ipAddress ? this.encryptionUtil.hash(ipAddress) : null,
      },
    });

    this.logger.debug(`Created refresh session ${jti} for user ${userId}`);
    return session;
  }

  /**
   * JTI로 세션 조회 및 검증
   */
  async validateSession(
    jti: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<RefreshSession> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { jti },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 만료 확인
    if (session.expiresAt < new Date()) {
      await this.deleteSession(jti);
      throw new UnauthorizedException('Refresh token expired');
    }

    // 사용자 상태 확인
    if (session.user.status !== 'ACTIVE') {
      await this.deleteSession(jti);
      throw new UnauthorizedException('User account is not active');
    }

    // 추가 보안 검증 (선택적)
    if (userAgent && session.uaHash) {
      const userAgentHash = this.encryptionUtil.hash(userAgent);
      if (userAgentHash !== session.uaHash) {
        this.logger.warn(`User-Agent mismatch for session ${jti}`);
        // 보안상 세션을 무효화할 수도 있음
      }
    }

    if (ipAddress && session.ipHash) {
      const ipHash = this.encryptionUtil.hash(ipAddress);
      if (ipHash !== session.ipHash) {
        this.logger.warn(`IP address changed for session ${jti}`);
        // IP 변경은 일반적이므로 로그만 남김
      }
    }

    return session;
  }

  /**
   * 세션 삭제 (단일)
   */
  async deleteSession(jti: string): Promise<void> {
    try {
      await this.prisma.refreshSession.delete({
        where: { jti },
      });
      this.logger.debug(`Deleted refresh session ${jti}`);
    } catch (error) {
      // 세션이 이미 없을 수도 있음
      this.logger.debug(`Failed to delete session ${jti}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * 사용자의 모든 세션 삭제 (로그아웃 모든 기기)
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    const result = await this.prisma.refreshSession.deleteMany({
      where: { userId },
    });

    this.logger.debug(`Deleted ${result.count} sessions for user ${userId}`);
    return result.count;
  }

  /**
   * 만료된 세션들 정리 (Cron Job용)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.refreshSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      this.logger.debug(`Cleaned up ${result.count} expired sessions`);
    }

    return result.count;
  }

  /**
   * 사용자의 활성 세션 수 조회
   */
  async getUserSessionCount(userId: string): Promise<number> {
    return this.prisma.refreshSession.count({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * 세션 로테이션 (기존 삭제 후 새로 생성)
   */
  async rotateSession(
    oldJti: string,
    newOptions: CreateSessionOptions,
  ): Promise<RefreshSession> {
    // 트랜잭션으로 원자적 처리
    return this.prisma.$transaction(async (tx) => {
      // 기존 세션 삭제
      await tx.refreshSession.delete({
        where: { jti: oldJti },
      });

      // 새 세션 생성
      const newSession = await tx.refreshSession.create({
        data: {
          userId: newOptions.userId,
          jti: newOptions.jti,
          expiresAt: newOptions.expiresAt,
          uaHash: newOptions.userAgent ? this.encryptionUtil.hash(newOptions.userAgent) : null,
          ipHash: newOptions.ipAddress ? this.encryptionUtil.hash(newOptions.ipAddress) : null,
        },
      });

      this.logger.debug(`Rotated session ${oldJti} -> ${newOptions.jti}`);
      return newSession;
    });
  }
}
