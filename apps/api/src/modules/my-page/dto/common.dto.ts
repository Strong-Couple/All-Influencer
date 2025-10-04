import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: '커서 기반 페이지네이션 커서',
    required: false,
    example: 'cursor_string_here',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: '한 페이지에 보여줄 항목 수',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class ApplicationFilterDto extends PaginationDto {
  @ApiProperty({
    description: '지원서 상태 필터',
    required: false,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
}

export class JobPostFilterDto extends PaginationDto {
  @ApiProperty({
    description: '공고 상태 필터',
    required: false,
    enum: ['OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'],
    example: 'OPEN',
  })
  @IsOptional()
  @IsString()
  status?: 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
}
