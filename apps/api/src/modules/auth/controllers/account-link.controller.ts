import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Req,
  Res,
  Param,
  Logger,
  Query,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { OAuthIntegrationService } from '../services/oauth-integration.service';
import { PrismaService } from '../../../common/database/prisma.service';
import { OAuthUser } from '../strategies/google.strategy';
import { AuthProvider } from '@prisma/client';

/**
 * 계정 연결 관리 컨트롤러
 * 로그인 상태에서 추가 소셜 계정 연결/해제
 */
@ApiTags('Account Linking')
@Controller('auth/link')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountLinkController {
  private readonly logger = new Logger(AccountLinkController.name);

  constructor(
    private readonly oauthIntegrationService: OAuthIntegrationService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== 계정 연결 시작 ====================

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google 계정 연결 시작' })
  @ApiResponse({ status: 302, description: 'Google 로그인 페이지로 리다이렉트' })
  async linkGoogle(@CurrentUser() user: any, @Req() req: Request): Promise<void> {
    // 현재 사용자 ID를 세션에 저장 (계정 연결용)
    // TODO: Implement proper session management
    // req.session = req.session || {};
    // (req.session as any).linkingUserId = user.id;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google 계정 연결 콜백 처리' })
  async linkGoogleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.handleLinkCallback(req, res, 'google');
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao 계정 연결 시작' })
  async linkKakao(@CurrentUser() user: any, @Req() req: Request): Promise<void> {
    // TODO: Implement proper session management
    // req.session = req.session || {};
    // (req.session as any).linkingUserId = user.id;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao 계정 연결 콜백 처리' })
  async linkKakaoCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.handleLinkCallback(req, res, 'kakao');
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver 계정 연결 시작' })
  async linkNaver(@CurrentUser() user: any, @Req() req: Request): Promise<void> {
    // TODO: Implement proper session management
    // req.session = req.session || {};
    // (req.session as any).linkingUserId = user.id;
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver 계정 연결 콜백 처리' })
  async linkNaverCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.handleLinkCallback(req, res, 'naver');
  }

  // ==================== 계정 연결 해제 ====================

  @Delete(':provider')
  @ApiOperation({ summary: '연결된 소셜 계정 해제' })
  @ApiParam({
    name: 'provider',
    enum: ['google', 'kakao', 'naver'],
    description: '해제할 소셜 프로바이더',
  })
  @ApiResponse({ status: 200, description: '계정 연결 해제 성공' })
  @ApiResponse({ status: 400, description: '마지막 인증 수단은 해제할 수 없음' })
  async unlinkAccount(
    @CurrentUser() user: any,
    @Param('provider') provider: string,
  ): Promise<{ success: boolean; message: string }> {
    // 프로바이더 유효성 검사
    const validProviders = ['google', 'kakao', 'naver'];
    if (!validProviders.includes(provider.toLowerCase())) {
      throw new BadRequestException('Invalid provider');
    }

    const authProvider = provider.toUpperCase() as AuthProvider;

    // 사용자의 연결된 계정 수 확인
    const identityCount = await this.prisma.userIdentity.count({
      where: { userId: user.id },
    });

    // 패스워드 계정 여부 확인
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    const hasPassword = !!userRecord?.passwordHash;
    const totalAuthMethods = identityCount + (hasPassword ? 1 : 0);

    // 최소 1개의 인증 수단은 유지해야 함
    if (totalAuthMethods <= 1) {
      throw new ForbiddenException(
        'Cannot unlink the last authentication method. Please set a password first.',
      );
    }

    // 해당 프로바이더 연결 해제
    const result = await this.prisma.userIdentity.deleteMany({
      where: {
        userId: user.id,
        provider: authProvider,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException('No linked account found for this provider');
    }

    this.logger.debug(`Unlinked ${provider} account for user ${user.id}`);

    return {
      success: true,
      message: `${provider} account has been successfully unlinked`,
    };
  }

  // ==================== 연결된 계정 목록 ====================

  @Get('')
  @ApiOperation({ summary: '연결된 소셜 계정 목록 조회' })
  @ApiResponse({ status: 200, description: '연결된 계정 목록' })
  async getLinkedAccounts(@CurrentUser() user: any) {
    const identities = await this.prisma.userIdentity.findMany({
      where: { userId: user.id },
      select: {
        provider: true,
        email: true,
        linkedAt: true,
        updatedAt: true,
      },
      orderBy: { linkedAt: 'desc' },
    });

    // 패스워드 계정 여부도 포함
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, email: true },
    });

    return {
      identities: identities.map((identity) => ({
        provider: identity.provider.toLowerCase(),
        email: identity.email,
        linkedAt: identity.linkedAt,
        lastUpdated: identity.updatedAt,
      })),
      hasPassword: !!userRecord?.passwordHash,
      primaryEmail: userRecord?.email,
      totalAuthMethods: identities.length + (userRecord?.passwordHash ? 1 : 0),
    };
  }

  // ==================== 공통 연결 콜백 처리 ====================

  private async handleLinkCallback(
    req: Request,
    res: Response,
    provider: string,
  ): Promise<void> {
    try {
      // 세션에서 연결할 사용자 ID 가져오기
      // TODO: Implement proper session management
      const linkingUserId = null; // (req.session as any)?.linkingUserId;
      if (!linkingUserId) {
        throw new BadRequestException('No linking session found');
      }

      // OAuth 사용자 정보 가져오기
      const oauthUser = req.user as OAuthUser;
      if (!oauthUser) {
        throw new BadRequestException('No OAuth user data');
      }

      // 계정 연결 처리
      const result = await this.oauthIntegrationService.integrateUser(
        oauthUser,
        true, // 연결 모드
        linkingUserId,
      );

      // 세션 정리
      // TODO: Implement proper session management
      // delete (req.session as any).linkingUserId;

      // 성공 페이지로 리다이렉트
      const successUrl = this.configService.get('OAUTH_REDIRECT_SUCCESS');
      const queryParams = new URLSearchParams({
        action: 'link',
        provider,
        success: 'true',
      });

      this.logger.debug(`${provider} account linked to user ${linkingUserId}`);

      res.redirect(`${successUrl}?${queryParams.toString()}`);
    } catch (error) {
      this.logger.error(`${provider} account linking error:`, error);

      const failureUrl = this.configService.get('OAUTH_REDIRECT_FAILURE');
      const errorMessage = (error instanceof Error ? error.message : 'Unknown error') || 'linking_failed';
      res.redirect(`${failureUrl}?error=${errorMessage}&action=link&provider=${provider}`);
    }
  }
}
