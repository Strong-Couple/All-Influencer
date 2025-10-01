import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsUrl, MaxLength, MinLength, IsObject } from 'class-validator';

export class UpdateInfluencerResumeDto {
  @ApiProperty({
    description: '한 줄 소개',
    required: false,
    maxLength: 100,
    example: '테크 리뷰 전문 인플루언서입니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  headline?: string;

  @ApiProperty({
    description: '자기소개',
    required: false,
    maxLength: 1000,
    example: '안녕하세요! 5년간 테크 리뷰를 해온 인플루언서입니다...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({
    description: '보유 기술/관심 키워드',
    required: false,
    type: [String],
    example: ['스마트폰', '노트북', '가전제품', 'IT 트렌드'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  skills?: string[];

  @ApiProperty({
    description: '포트폴리오 링크',
    required: false,
    type: [String],
    example: ['https://youtube.com/c/mytech', 'https://instagram.com/mytech'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  portfolioUrls?: string[];

  @ApiProperty({
    description: '자유 양식 이력서 (JSON 형태)',
    required: false,
    type: 'object',
    example: {
      education: [
        { school: '서울대학교', major: '컴퓨터과학과', degree: '학사', year: '2020' }
      ],
      career: [
        { company: 'ABC회사', position: '마케터', period: '2020-2022' }
      ],
      certifications: [
        { name: '정보처리기사', issuer: '한국산업인력공단', year: '2020' }
      ]
    },
  })
  @IsOptional()
  @IsObject()
  resumeJson?: any;
}

export class CreateScrapDto {
  @ApiProperty({
    description: '스크랩할 공고 ID',
    example: 'clxxxxx',
  })
  @IsString()
  @MinLength(1)
  jobPostId: string;
}
