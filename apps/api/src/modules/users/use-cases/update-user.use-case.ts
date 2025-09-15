import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
// import { UsersRepository, UpdateUserData } from '../repositories/users.repository'; // 임시 비활성화

export interface UpdateUserRequest {
  username?: string;
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

    // 사용자명 중복 확인 (변경하는 경우)
    if (request.username && request.username !== existingUser.username) {
      const usernameExists = await this.usersRepository.existsByUsername(request.username);
      if (usernameExists) {
        throw new ConflictException('이미 사용중인 사용자명입니다.');
      }
    }

    // 웹사이트 URL 검증
    if (request.website && !this.isValidUrl(request.website)) {
      throw new BadRequestException('올바른 웹사이트 URL을 입력해주세요.');
    }

    // 업데이트할 데이터 준비
    const updateData: UpdateUserData = {};
    
    if (request.username !== undefined) updateData.username = request.username;
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

