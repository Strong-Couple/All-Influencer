import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import {
  // CreateUserUseCase, // 임시 비활성화
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from './use-cases';

export interface CreateUserRequest {
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  website?: string;
}

export interface UpdateUserRequest {
  username?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

@Injectable()
export class UsersService {
  constructor(
    // private readonly createUserUseCase: CreateUserUseCase, // 임시 비활성화
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  async findAll(query: GetUsersQuery) {
    return this.getUsersUseCase.execute(query);
  }

  async findOne(id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  async create(createUserDto: CreateUserRequest) {
    // return this.createUserUseCase.execute(createUserDto); // 임시 비활성화
    throw new Error('Method not implemented yet');
  }

  async update(id: string, updateUserDto: UpdateUserRequest) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async remove(id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}
