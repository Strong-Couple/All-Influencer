import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthService } from './local.service';
import { JwtCookieService } from '../../../common/services/jwt-cookie.service';
import { RefreshSessionService } from '../../../common/services/refresh-session.service';
import { LocalSignupDto } from './dto/signup.dto';
import { LocalLoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@ApiTags('Local Auth')
@Controller('auth/local')
@UseGuards(ThrottlerGuard)
export class LocalAuthController {
  private readonly logger = new Logger(LocalAuthController.name);

  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly jwtCookieService: JwtCookieService,
    private readonly refreshSessionService: RefreshSessionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 분당 5회 제한
  @ApiOperation({ 
    summary: '플랫폼 자체 회원가입',
    description: '이메일과 비밀번호로 플랫폼에 직접 가입합니다. OAuth 계정이 이미 있는 경우 통합됩니다.',
  })
  @ApiBody({ type: LocalSignupDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공. JWT 쿠키가 설정됩니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '회원가입이 완료되었습니다.' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 가입된 이메일',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '이미 가입된 이메일입니다.' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
      },
    },
  })
  async signup(
    @Body() signupDto: LocalSignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.localAuthService.signup(signupDto);
      
      // JWT 토큰 생성 및 쿠키 설정
      const payload = this.localAuthService.createJwtPayload(result.user);
      
      // Access Token 생성
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      });

      // Refresh Token 생성
      const refreshToken = this.jwtService.sign(
        { sub: result.user.id },
        { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '14d') }
      );

      // Refresh Session 저장
      const jti = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.refreshSessionService.createSession({
        userId: result.user.id,
        jti,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일
      });

      // HttpOnly 쿠키로 토큰 설정
      this.jwtCookieService.setTokenCookies(response, { accessToken, refreshToken, jti });

      this.logger.log(`Local signup successful: ${result.user.email}`);

      return {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: result.user,
      };
    } catch (error) {
      this.logger.error(`Local signup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      response.status((error as any).status || HttpStatus.BAD_REQUEST);
      return {
        success: false,
        message: (error instanceof Error ? error.message : 'Unknown error') || '회원가입 처리 중 오류가 발생했습니다.',
      };
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 분당 10회 제한
  @ApiOperation({
    summary: '플랫폼 자체 로그인',
    description: '이메일과 비밀번호로 로그인합니다. 성공 시 JWT 쿠키가 설정됩니다.',
  })
  @ApiBody({ type: LocalLoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공. JWT 쿠키가 설정됩니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '로그인되었습니다.' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            role: { type: 'string' },
            avatar: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
      },
    },
  })
  async login(
    @Body() loginDto: LocalLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.localAuthService.login(loginDto);
      
      // JWT 토큰 생성 및 쿠키 설정
      const payload = this.localAuthService.createJwtPayload(result.user);
      
      // Access Token 생성
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      });

      // Refresh Token 생성
      const refreshToken = this.jwtService.sign(
        { sub: result.user.id },
        { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '14d') }
      );

      // Refresh Session 저장
      const jti = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.refreshSessionService.createSession({
        userId: result.user.id,
        jti,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일
      });

      // HttpOnly 쿠키로 토큰 설정
      this.jwtCookieService.setTokenCookies(response, { accessToken, refreshToken, jti });

      this.logger.log(`Local login successful: ${result.user.email}`);

      return {
        success: true,
        message: '로그인되었습니다.',
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          role: result.user.role,
          avatar: result.user.avatar,
        },
      };
    } catch (error) {
      this.logger.error(`Local login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      response.status((error as any).status || HttpStatus.UNAUTHORIZED);
      return {
        success: false,
        message: (error instanceof Error ? error.message : 'Unknown error') || '로그인 처리 중 오류가 발생했습니다.',
      };
    }
  }
}
