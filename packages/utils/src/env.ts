import { z } from 'zod';

/**
 * 환경 변수 파싱 및 검증 유틸리티
 */

export const parseEnv = <T extends Record<string, z.ZodTypeAny>>(
  schema: T,
  env: Record<string, string | undefined> = process.env
): z.infer<z.ZodObject<T>> => {
  const zodSchema = z.object(schema);
  
  try {
    return zodSchema.parse(env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
};

export const getEnvString = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

export const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

export const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  
  return value.toLowerCase() === 'true';
};

export const getEnvArray = (key: string, separator = ',', defaultValue?: string[]): string[] => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  
  return value.split(separator).map(item => item.trim()).filter(Boolean);
};

export const getEnvUrl = (key: string, defaultValue?: string): string => {
  const value = getEnvString(key, defaultValue);
  
  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`Environment variable ${key} must be a valid URL`);
  }
};

// 일반적인 환경 변수 스키마 예제
export const CommonEnvSchema = {
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
};

