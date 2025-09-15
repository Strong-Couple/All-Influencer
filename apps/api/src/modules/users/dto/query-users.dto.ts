import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class QueryUsersDto {
  @ApiPropertyOptional({ example: 1, description: '페이지 번호' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지는 정수여야 합니다.' })
  @Min(1, { message: '페이지는 1 이상이어야 합니다.' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: '페이지당 항목 수' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '제한값은 정수여야 합니다.' })
  @Min(1, { message: '제한값은 1 이상이어야 합니다.' })
  @Max(100, { message: '제한값은 100 이하여야 합니다.' })
  limit?: number = 10;

  @ApiPropertyOptional({ enum: UserRole, description: '사용자 역할로 필터링' })
  @IsOptional()
  @IsEnum(UserRole, { message: '올바른 사용자 역할을 선택해주세요.' })
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, description: '사용자 상태로 필터링' })
  @IsOptional()
  @IsEnum(UserStatus, { message: '올바른 사용자 상태를 선택해주세요.' })
  status?: UserStatus;

  @ApiPropertyOptional({ example: 'john', description: '검색 키워드 (사용자명, 표시 이름, 이메일)' })
  @IsOptional()
  @IsString({ message: '검색 키워드는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  search?: string;
}
