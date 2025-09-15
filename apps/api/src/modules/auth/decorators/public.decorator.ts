import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 공개 접근 허용 데코레이터
 * JWT 인증을 생략하고 누구나 접근 가능하게 설정
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('public-endpoint')
 * publicMethod() {}
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);