import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Core Modules
import { PrismaModule } from '../../common/database/prisma.module';

// Controllers
import { AuthController } from './auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { AccountLinkController } from './controllers/account-link.controller';
import { LocalAuthController } from './local/local.controller';

// Services
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { OAuthIntegrationService } from './services/oauth-integration.service';
import { LocalAuthService } from './local/local.service';

// Common Services
import { JwtCookieService } from '../../common/services/jwt-cookie.service';
import { RefreshSessionService } from '../../common/services/refresh-session.service';
import { EncryptionUtil } from '../../common/utils/encryption.util';

// Guards & Strategies
import { JwtAuthGuard, RolesGuard } from './guards';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    OAuthController,
    AccountLinkController,
    LocalAuthController,
  ],
  providers: [
    // Core Services
    AuthService,
    TokenService,
    OAuthIntegrationService,
    LocalAuthService,
    
    // Common Services
    JwtCookieService,
    RefreshSessionService,
    EncryptionUtil,
    
    // Guards
    JwtAuthGuard,
    RolesGuard,
    
    // Strategies
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
  ],
  exports: [
    AuthService,
    TokenService,
    OAuthIntegrationService,
    LocalAuthService,
    JwtCookieService,
    RefreshSessionService,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}

