import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty({ example: 'clkv6r3ds0000qt6k5l7u8m1h', description: '사용자 ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'username123', description: '사용자명' })
  username: string;

  @ApiProperty({ example: '홍길동', description: '표시 이름' })
  displayName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: '프로필 이미지', required: false })
  avatar?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.INFLUENCER, description: '사용자 역할' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: '사용자 상태' })
  status: UserStatus;

  @ApiProperty({ example: '안녕하세요!', description: '자기소개', required: false })
  bio?: string;

  @ApiProperty({ example: 'https://example.com', description: '웹사이트 URL', required: false })
  website?: string;

  @ApiProperty({ description: '계정 생성일' })
  createdAt: Date;

  @ApiProperty({ description: '마지막 수정일' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto, description: '사용자 정보' })
  user: AuthUserDto;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'Access 토큰 (15분 유효)' 
  })
  accessToken: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'Refresh 토큰 (7일 유효)' 
  })
  refreshToken: string;

  @ApiProperty({ example: 900, description: 'Access 토큰 만료 시간 (초)' })
  expiresIn: number;
}

export class RefreshResponseDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: '새로운 Access 토큰' 
  })
  accessToken: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: '새로운 Refresh 토큰' 
  })
  refreshToken: string;

  @ApiProperty({ example: 900, description: 'Access 토큰 만료 시간 (초)' })
  expiresIn: number;
}

