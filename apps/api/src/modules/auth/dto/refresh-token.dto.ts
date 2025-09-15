import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ 
    description: 'Refresh 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  @IsString({ message: 'Refresh 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'Refresh 토큰은 필수입니다.' })
  refreshToken: string;
}

