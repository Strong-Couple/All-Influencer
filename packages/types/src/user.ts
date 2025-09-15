import { z } from 'zod';
import { IdSchema, TimestampSchema } from './common';

export const UserRoleSchema = z.enum(['admin', 'influencer', 'brand', 'user']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['active', 'inactive', 'suspended']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserSchema = z.object({
  id: IdSchema,
  email: z.string().email(),
  username: z.string().min(3).max(50),
  displayName: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
}).merge(TimestampSchema);

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8).max(128),
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
}).partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type Login = z.infer<typeof LoginSchema>;

export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
});
export type AuthToken = z.infer<typeof AuthTokenSchema>;

