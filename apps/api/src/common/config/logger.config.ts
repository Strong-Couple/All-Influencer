import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';

export interface LoggerConfig {
  level: string;
  transport?: any;
  timestamp: () => string;
  redact: string[];
}

export function createLoggerConfig(configService: ConfigService): LoggerConfig {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const logLevel = configService.get('LOG_LEVEL', 'info');

  const config: LoggerConfig = {
    level: logLevel,
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    redact: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
    ],
  };

  // 개발환경에서는 pretty print 사용
  if (nodeEnv === 'development') {
    config.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  }

  return config;
}

