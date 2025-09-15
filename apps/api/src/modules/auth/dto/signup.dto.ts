import { IsEmail, IsString, IsEnum, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class SignUpDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: '이메일 주소' 
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({ 
    example: 'username123', 
    description: '사용자명' 
  })
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @MinLength(3, { message: '사용자명은 최소 3자 이상이어야 합니다.' })
  @MaxLength(50, { message: '사용자명은 최대 50자까지 가능합니다.' })
  username: string;

  @ApiProperty({ 
    example: '홍길동', 
    description: '표시 이름' 
  })
  @IsString({ message: '표시 이름은 문자열이어야 합니다.' })
  @MinLength(1, { message: '표시 이름은 필수입니다.' })
  @MaxLength(100, { message: '표시 이름은 최대 100자까지 가능합니다.' })
  displayName: string;

  @ApiProperty({ 
    example: 'SecurePass123!', 
    description: '비밀번호 (최소 8자, 영문/숫자/특수문자 포함)' 
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(128, { message: '비밀번호는 최대 128자까지 가능합니다.' })
  password: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.INFLUENCER, 
    description: '사용자 역할' 
  })
  @IsEnum(UserRole, { message: '올바른 사용자 역할을 선택해주세요.' })
  role: UserRole;

  @ApiPropertyOptional({ 
    example: 'https://example.com/avatar.jpg', 
    description: '프로필 이미지 URL' 
  })
  @IsOptional()
  @IsString({ message: '프로필 이미지 URL은 문자열이어야 합니다.' })
  avatar?: string;

  @ApiPropertyOptional({ 
    example: '안녕하세요! 새로운 인플루언서입니다.', 
    description: '자기소개' 
  })
  @IsOptional()
  @IsString({ message: '자기소개는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '자기소개는 최대 500자까지 가능합니다.' })
  bio?: string;

  @ApiPropertyOptional({ 
    example: 'https://example.com', 
    description: '웹사이트 URL' 
  })
  @IsOptional()
  @IsString({ message: '웹사이트 URL은 문자열이어야 합니다.' })
  website?: string;
}

