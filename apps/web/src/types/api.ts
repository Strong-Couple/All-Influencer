export type UserRole = 'ADMIN' | 'ADVERTISER' | 'INFLUENCER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
  error?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
}

export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
}

export interface UserListItem {
  id: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export function unwrapApiResponse<T>(payload: ApiResponse<T> | T | undefined | null): T {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return (payload as ApiResponse<T>).data;
  }

  if (payload == null) {
    throw new Error('API 응답이 비어 있습니다.');
  }

  return payload as T;
}

