import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/database/prisma.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT 인증 전략
 * 쿠키에서 JWT 토큰을 추출하여 사용자 인증
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. 쿠키에서 추출 (우선순위)
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        // 2. Authorization 헤더에서 추출 (API 클라이언트용)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // request 객체도 validate에 전달
    });
  }

  /**
   * JWT 토큰 검증 후 호출되는 함수
   * @param request Express 요청 객체
   * @param payload JWT 페이로드
   */
  async validate(request: Request, payload: JwtPayload) {
    try {
      // 사용자 존재 및 상태 확인
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          status: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`User not found for JWT payload: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      if (user.status !== 'ACTIVE') {
        this.logger.warn(`Inactive user attempted access: ${user.id}`);
        throw new UnauthorizedException('Account is not active');
      }

      // 요청 정보 로깅 (디버그용)
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(
          `JWT validated for user ${user.id} (${user.email}) - ${request.method} ${request.url}`,
        );
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('JWT validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}