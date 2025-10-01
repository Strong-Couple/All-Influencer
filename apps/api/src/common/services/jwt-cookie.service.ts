import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: string; // user id
  jti: string; // JWT ID for token rotation
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  jti: string;
}

/**
 * JWT 쿠키 기반 인증 서비스
 * httpOnly, Secure 쿠키로 Access/Refresh 토큰 관리
 */
@Injectable()
export class JwtCookieService {
  private readonly logger = new Logger(JwtCookieService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Access/Refresh 토큰 쌍 생성
   */
  generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair {
    const jti = uuidv4();

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshPayload: Omit<RefreshPayload, 'iat' | 'exp'> = {
      sub: payload.sub,
      jti,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '14d'),
    });

    return {
      accessToken,
      refreshToken,
      jti,
    };
  }

  /**
   * 쿠키에 토큰 설정
   */
  setTokenCookies(response: Response, tokens: TokenPair): void {
    const isSecure = this.configService.get('COOKIE_SECURE', 'false') === 'true';
    const domain = this.configService.get('COOKIE_DOMAIN');

    const commonOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as const,
      domain: domain || undefined,
    };

    // Access Token 쿠키 (15분)
    response.cookie('access_token', tokens.accessToken, {
      ...commonOptions,
      maxAge: 15 * 60 * 1000, // 15분
      path: '/',
    });

    // Refresh Token 쿠키 (14일, 더 엄격한 sameSite)
    response.cookie('refresh_token', tokens.refreshToken, {
      ...commonOptions,
      sameSite: 'strict' as const,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
      path: '/auth', // 인증 관련 경로에서만 전송
    });

    this.logger.debug(`Tokens set in cookies for user ${tokens.jti}`);
  }

  /**
   * 쿠키에서 토큰 제거 (로그아웃)
   */
  clearTokenCookies(response: Response): void {
    const domain = this.configService.get('COOKIE_DOMAIN');

    const clearOptions = {
      httpOnly: true,
      secure: this.configService.get('COOKIE_SECURE', 'false') === 'true',
      domain: domain || undefined,
      expires: new Date(0), // 즉시 만료
    };

    response.cookie('access_token', '', {
      ...clearOptions,
      path: '/',
    });

    response.cookie('refresh_token', '', {
      ...clearOptions,
      path: '/auth',
    });

    this.logger.debug('Token cookies cleared');
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token: string): JwtPayload | RefreshPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.debug('Token verification failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * 토큰에서 페이로드 추출 (검증 없이)
   */
  decodeToken(token: string): JwtPayload | RefreshPayload | null {
    try {
      return this.jwtService.decode(token) as JwtPayload | RefreshPayload;
    } catch (error) {
      this.logger.debug('Token decode failed', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}
