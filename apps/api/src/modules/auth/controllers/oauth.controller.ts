import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Logger,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OAuthIntegrationService } from '../services/oauth-integration.service';
import { OAuthUser } from '../strategies/google.strategy';

/**
 * OAuth 인증 컨트롤러
 * 소셜 로그인 시작 및 콜백 처리
 */
@ApiTags('OAuth Authentication')
@Controller('auth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(
    private readonly oauthIntegrationService: OAuthIntegrationService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== GOOGLE OAUTH ====================

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Google 로그인 페이지로 리다이렉트' })
  async googleAuth(): Promise<void> {
    // Passport가 자동으로 Google 로그인 페이지로 리다이렉트
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 콜백 처리' })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('error') error?: string,
  ): Promise<void> {
    return this.handleOAuthCallback(req, res, 'google', error);
  }

  // ==================== KAKAO OAUTH ====================

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Kakao 로그인 페이지로 리다이렉트' })
  async kakaoAuth(): Promise<void> {
    // Passport가 자동으로 Kakao 로그인 페이지로 리다이렉트
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth 콜백 처리' })
  async kakaoCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('error') error?: string,
  ): Promise<void> {
    return this.handleOAuthCallback(req, res, 'kakao', error);
  }

  // ==================== NAVER OAUTH ====================

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver OAuth 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Naver 로그인 페이지로 리다이렉트' })
  async naverAuth(): Promise<void> {
    // Passport가 자동으로 Naver 로그인 페이지로 리다이렉트
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver OAuth 콜백 처리' })
  async naverCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('error') error?: string,
  ): Promise<void> {
    return this.handleOAuthCallback(req, res, 'naver', error);
  }

  // ==================== 공통 콜백 처리 ====================

  /**
   * OAuth 콜백 공통 처리 로직
   */
  private async handleOAuthCallback(
    req: Request,
    res: Response,
    provider: string,
    error?: string,
  ): Promise<void> {
    try {
      // OAuth 에러 확인
      if (error) {
        this.logger.warn(`${provider} OAuth error: ${error}`);
        return this.redirectToFailure(res, `${provider}_error`);
      }

      // Passport에서 설정한 사용자 정보 가져오기
      const oauthUser = req.user as OAuthUser;
      if (!oauthUser) {
        this.logger.error(`No user data from ${provider} OAuth`);
        return this.redirectToFailure(res, 'no_user_data');
      }

      // 계정 통합 처리
      const result = await this.oauthIntegrationService.integrateUser(oauthUser);

      // JWT 토큰 발급 및 쿠키 설정
      await this.oauthIntegrationService.completeOAuthLogin(
        result.user,
        res,
        req.headers['user-agent'],
        req.ip,
      );

      // 성공 페이지로 리다이렉트
      const successUrl = this.configService.get('OAUTH_REDIRECT_SUCCESS');
      const queryParams = new URLSearchParams({
        provider,
        new_user: result.isNewUser.toString(),
        new_identity: result.isNewIdentity.toString(),
        needs_email: result.requiresEmailVerification.toString(),
      });

      this.logger.debug(
        `${provider} OAuth success for user ${result.user.id} (new: ${result.isNewUser})`,
      );

      res.redirect(`${successUrl}?${queryParams.toString()}`);
    } catch (error) {
      this.logger.error(`${provider} OAuth callback error:`, error);
      return this.redirectToFailure(res, 'integration_failed');
    }
  }

  /**
   * 실패 페이지로 리다이렉트
   */
  private redirectToFailure(res: Response, reason: string): void {
    const failureUrl = this.configService.get('OAUTH_REDIRECT_FAILURE');
    res.redirect(`${failureUrl}?error=${reason}`);
  }
}
