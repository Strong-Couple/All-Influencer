import { User, UserRole, UserStatus } from '@prisma/client';

// 사용자 생성 데이터 인터페이스
export interface CreateUserData {
  email?: string;
  passwordHash?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  status?: UserStatus;
  bio?: string;
  website?: string;
}

// 사용자 업데이트 데이터 인터페이스
export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  displayName?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
  bio?: string;
  website?: string;
  lastLoginAt?: Date;
}

// 사용자 응답 DTO
export interface UserResponseDto {
  id: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// 페이지네이션 인터페이스
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 검색 필터 인터페이스
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}
