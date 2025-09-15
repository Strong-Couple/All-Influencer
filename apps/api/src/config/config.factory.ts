import { parseEnv, CommonEnvSchema } from '@all-influencer/utils';

export const configFactory = () => {
  const config = parseEnv({
    ...CommonEnvSchema,
    API_PORT: CommonEnvSchema.PORT,
    DATABASE_HOST: CommonEnvSchema.DATABASE_URL.optional(),
  });

  return {
    port: config.API_PORT || 3001,
    nodeEnv: config.NODE_ENV,
    corsOrigin: config.CORS_ORIGIN,
    jwtSecret: config.JWT_SECRET,
    database: {
      url: config.DATABASE_HOST,
    },
  };
};

