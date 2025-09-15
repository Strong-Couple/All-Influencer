import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export const ConfigSchema = z.object({
  database: z.object({
    host: z.string(),
    port: z.number().int().positive(),
    username: z.string(),
    password: z.string(),
    database: z.string(),
  }),
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string(),
  }),
  api: z.object({
    port: z.number().int().positive(),
    prefix: z.string(),
  }),
  cors: z.object({
    origin: z.union([z.string(), z.array(z.string())]),
    credentials: z.boolean(),
  }),
});
export type Config = z.infer<typeof ConfigSchema>;

