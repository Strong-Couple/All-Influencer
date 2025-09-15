import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * 역할 기반 접근 제어 데코레이터
 * 특정 역할을 가진 사용자만 접근할 수 있도록 제한
 * 
 * @example
 * ```typescript
 * @Roles('ADMIN')
 * @Get('admin-only')
 * adminOnlyMethod() {}
 * 
 * @Roles('INFLUENCER', 'ADVERTISER')
 * @Get('user-content')
 * userContentMethod() {}
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);