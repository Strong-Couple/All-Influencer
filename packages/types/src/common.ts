import { z } from 'zod';

// 공통 타입 정의
export const IdSchema = z.string().uuid();
export type Id = z.infer<typeof IdSchema>;

export const TimestampSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Timestamp = z.infer<typeof TimestampSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().int(),
  timestamp: z.string(),
  path: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

