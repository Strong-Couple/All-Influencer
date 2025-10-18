import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersRepository } from '../repositories/users.repository';

export interface GetUsersRequest {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(request: GetUsersRequest = {}) {
    // 입력값 검증 및 기본값 설정
    const { page = 1, limit = 10, role, status, search } = request;

    if (page < 1) {
      throw new Error('페이지는 1 이상이어야 합니다.');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('제한값은 1~100 사이여야 합니다.');
    }

    const filters = { role, status, search: search?.trim() };
    const pagination = { page, limit };

    return this.usersRepository.findMany(filters, pagination);
  }
}

