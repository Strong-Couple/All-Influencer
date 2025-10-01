import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './common/database';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MyPageModule } from './modules/my-page/my-page.module';
import { JwtAuthGuard } from './modules/auth/guards';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { configFactory } from './config/config.factory';
import { createSecurityConfig } from './common/config/security.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configFactory],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const securityConfig = createSecurityConfig(configService);
        return [securityConfig.rateLimit.global];
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MyPageModule,
  ],
  controllers: [],
  providers: [
    // 글로벌 가드 설정
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');
  }
}
