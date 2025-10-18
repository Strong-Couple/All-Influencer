import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersRepository } from '../repositories/users.repository';
import { UpdateUserData } from '../interfaces/user.interface';

export interface UpdateUserRequest {
  displayName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  role?: UserRole;
  status?: UserStatus;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string, request: UpdateUserRequest) {
    // 사용자 존재 확인
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다. ID: ${id}`);
    }

    // 업데이트할 데이터 준비
    const updateData: any /* UpdateUserData */ = {};
    
    if (request.displayName !== undefined) updateData.displayName = request.displayName;
    if (request.avatar !== undefined) updateData.avatar = request.avatar;
    if (request.bio !== undefined) updateData.bio = request.bio;
    if (request.website !== undefined) updateData.website = request.website;
    if (request.role !== undefined) updateData.role = request.role;
    if (request.status !== undefined) updateData.status = request.status;

    return this.usersRepository.update(id, updateData);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

