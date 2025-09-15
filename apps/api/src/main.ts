import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { createSecurityConfig } from './common/config/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const securityConfig = createSecurityConfig(configService);

  // 보안 설정
  app.use(helmet({
    contentSecurityPolicy: securityConfig.helmet.contentSecurityPolicy,
    crossOriginEmbedderPolicy: securityConfig.helmet.crossOriginEmbedderPolicy,
  }));
  app.use(compression());
  app.use(cookieParser());

  // CORS 설정
  app.enableCors(securityConfig.cors);

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
      validationError: {
        target: false,
        value: false,
      },
    })
  );

  // 글로벌 필터 및 인터셉터 설정
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // API 프리픽스
  app.setGlobalPrefix('api/v1');

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('All Influencer API')
    .setDescription('인플루언서 플랫폼 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', '인증 및 권한')
    .addTag('users', '사용자 관리')
    .addTag('job-posts', '구인 공고')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // OpenAPI JSON을 별도 엔드포인트로 제공
  const server = app.getHttpAdapter();
  server.get('/api-json', (req, res) => {
    res.json(document);
  });

  const port = configService.get('PORT', 3001);
  const nodeEnv = configService.get('NODE_ENV', 'development');
  
  await app.listen(port);

  logger.log(`🚀 서버가 http://localhost:${port} 에서 실행중입니다`);
  logger.log(`📖 API 문서: http://localhost:${port}/api/docs`);
  logger.log(`🔗 OpenAPI JSON: http://localhost:${port}/api-json`);
  logger.log(`🌍 환경: ${nodeEnv}`);
  logger.log(`🛡️  CORS 허용 도메인: ${securityConfig.cors.origin}`);
  
  if (nodeEnv === 'development') {
    logger.log(`💡 개발 모드에서 실행 중입니다.`);
  }
}

bootstrap();
