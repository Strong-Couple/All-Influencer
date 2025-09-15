import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
  };
  rateLimit: {
    global: {
      ttl: number;
      limit: number;
    };
    auth: {
      ttl: number;
      limit: number;
    };
  };
}

export function createSecurityConfig(configService: ConfigService): SecurityConfig {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');

  return {
    cors: {
      origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(url => url.trim()),
      credentials: true,
    },
    helmet: {
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    },
    rateLimit: {
      global: {
        ttl: 60 * 1000, // 1분
        limit: 100, // 분당 100회
      },
      auth: {
        ttl: 60 * 1000, // 1분
        limit: 5, // 분당 5회 (로그인, 회원가입)
      },
    },
  };
}

