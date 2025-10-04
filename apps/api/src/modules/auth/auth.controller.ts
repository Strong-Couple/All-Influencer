import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// Services
import { AuthService } from './auth.service';
import { JwtCookieService, RefreshPayload } from '../../common/services/jwt-cookie.service';
import { RefreshSessionService } from '../../common/services/refresh-session.service';

// Guards & Decorators
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

// DTOs
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * 인증 컨트롤러
 * JWT 쿠키 기반 인증 + 기존 패스워드 로그인
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtCookieService: JwtCookieService,
    private readonly refreshSessionService: RefreshSessionService,
  ) {}

  // ==================== 패스워드 기반 인증 ====================

  @Public()
  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: '회원가입 (패스워드)' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async signup(
    @Body() signupDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.signUp(signupDto);

    // JWT 토큰 발급 및 쿠키 설정
    const tokens = this.jwtCookieService.generateTokenPair({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Refresh 세션 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await this.refreshSessionService.createSession({
      userId: result.user.id,
      jti: tokens.jti,
      expiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // 쿠키 설정
    this.jwtCookieService.setTokenCookies(res, tokens);

    this.logger.debug(`User signup successful: ${result.user.id}`);

    return {
      user: result.user,
      accessToken: '', // 쿠키로 전송
      refreshToken: '', // 쿠키로 전송
      expiresIn: 900, // 15분
    };
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인 (패스워드)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);

    // JWT 토큰 발급 및 쿠키 설정
    const tokens = this.jwtCookieService.generateTokenPair({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Refresh 세션 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await this.refreshSessionService.createSession({
      userId: result.user.id,
      jti: tokens.jti,
      expiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // 쿠키 설정
    this.jwtCookieService.setTokenCookies(res, tokens);

    // 마지막 로그인 시간 업데이트
    await this.authService.updateLastLogin(result.user.id);

    this.logger.debug(`User login successful: ${result.user.id}`);

    return {
      user: result.user,
      accessToken: '', // 쿠키로 전송
      refreshToken: '', // 쿠키로 전송
      expiresIn: 900, // 15분
    };
  }

  // ==================== 토큰 관리 ====================

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access 토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh 토큰' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // Refresh 토큰 검증
      const payload = this.jwtCookieService.verifyToken(refreshToken) as RefreshPayload;
      
      // 세션 검증
      const session = await this.refreshSessionService.validateSession(
        payload.jti,
        req.headers['user-agent'],
        req.ip,
      );

      // 사용자 정보 조회
      const user = await this.authService.findUserById(session.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 새 토큰 생성
      const newTokens = this.jwtCookieService.generateTokenPair({
        sub: session.userId,
        email: user.email,
        role: user.role,
      });

      // 세션 로테이션 (기존 삭제 후 새로 생성)
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 14);

      await this.refreshSessionService.rotateSession(payload.jti, {
        userId: session.userId,
        jti: newTokens.jti,
        expiresAt: newExpiresAt,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      // 새 쿠키 설정
      this.jwtCookieService.setTokenCookies(res, newTokens);

      this.logger.debug(`Token refreshed for user ${session.userId}`);

      return {
        success: true,
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      this.logger.debug(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      try {
        // Refresh 토큰 페이로드 추출
        const payload = this.jwtCookieService.decodeToken(refreshToken) as RefreshPayload;
        
        if (payload?.jti) {
          // 세션 삭제
          await this.refreshSessionService.deleteSession(payload.jti);
        }
      } catch (error) {
        this.logger.debug(`Error during logout cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 쿠키 삭제
    this.jwtCookieService.clearTokenCookies(res);

    this.logger.debug(`User logout successful: ${user.id}`);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 기기에서 로그아웃' })
  @ApiResponse({ status: 200, description: '전체 로그아웃 성공' })
  async logoutAll(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string; sessionCount: number }> {
    // 모든 Refresh 세션 삭제
    const deletedCount = await this.refreshSessionService.deleteAllUserSessions(user.id);

    // 현재 기기 쿠키도 삭제
    this.jwtCookieService.clearTokenCookies(res);

    this.logger.debug(`All sessions logged out for user ${user.id}: ${deletedCount} sessions`);

    return {
      success: true,
      message: 'Logged out from all devices successfully',
      sessionCount: deletedCount,
    };
  }

  // ==================== 사용자 정보 ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  async getProfile(@CurrentUser() user: any) {
    // 연결된 OAuth 계정 정보도 포함
    const fullUser = await this.authService.getUserWithIdentities(user.id);

    return {
      success: true,
      user: fullUser,
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '활성 세션 목록 조회' })
  @ApiResponse({ status: 200, description: '세션 목록 조회 성공' })
  async getSessions(@CurrentUser() user: any) {
    const sessionCount = await this.refreshSessionService.getUserSessionCount(user.id);

    return {
      success: true,
      activeSessionCount: sessionCount,
      message: `${sessionCount} active session(s) found`,
    };
  }
}