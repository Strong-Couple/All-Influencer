import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtCookieService } from '../../../common/services/jwt-cookie.service';
import { PrismaService } from '../../../common/database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT 쿠키 기반 인증 가드
 * httpOnly 쿠키에서 JWT 토큰을 추출하여 인증 처리
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtCookieService: JwtCookieService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  /**
   * 인증이 필요한지 확인
   * @Public() 데코레이터가 있는 경우 인증 생략
   */
  canActivate(context: ExecutionContext) {
    // @Public() 데코레이터 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * 인증 에러 처리
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    if (err || !user) {
      const errorMessage = err?.message || info?.message || 'Unauthorized';
      
      this.logger.debug(
        `JWT authentication failed: ${errorMessage} for ${request.method} ${request.url}`,
      );
      
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    return user;
  }

  /**
   * 쿠키에서 JWT 토큰 추출
   */
  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies?.access_token;

    if (accessToken) {
      // Authorization 헤더에 설정하여 passport-jwt가 처리할 수 있도록
      request.headers.authorization = `Bearer ${accessToken}`;
    }

    return request;
  }
}