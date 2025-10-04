import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LocalSignupDto {
  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자, 최대 50자)',
    example: 'securePassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  @MaxLength(50, { message: '비밀번호는 50자를 초과할 수 없습니다.' })
  password: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: ['INFLUENCER', 'ADVERTISER'],
    example: 'INFLUENCER',
  })
  @IsEnum(['INFLUENCER', 'ADVERTISER'], {
    message: '역할은 INFLUENCER 또는 ADVERTISER만 선택 가능합니다.',
  })
  role: 'INFLUENCER' | 'ADVERTISER';

  @ApiProperty({
    description: '표시 이름',
    example: '홍길동',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 50자를 초과할 수 없습니다.' })
  displayName: string;
}
