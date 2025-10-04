import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';
import { 
  CreateUserData, 
  UpdateUserData, 
  UserFilters, 
  PaginationOptions,
  PaginatedResponse,
  UserResponseDto 
} from '../interfaces/user.interface';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사용자 생성
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error) {
      this.logger.error(`Failed to create user: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by ID: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 사용자 목록 조회 (페이지네이션 및 필터링)
   */
  async findMany(
    filters: UserFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResponse<UserResponseDto>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const { role, status, search } = filters;

      const where: Prisma.UserWhereInput = {};

      if (role) where.role = role;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { displayName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            role: true,
            status: true,
            bio: true,
            website: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find users: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(`Failed to update user: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   */
  async delete(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete user: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 사용자 존재 여부 확인
   */
  async exists(id: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      this.logger.error(`Failed to check user existence: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to update last login: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * 오류 메시지 추출 헬퍼
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
