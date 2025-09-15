import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 사용자 정보를 가져오는 데코레이터
 * JWT 가드를 통해 인증된 사용자 정보를 파라미터로 주입
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 특정 필드만 반환하는 경우
    if (data) {
      return user?.[data];
    }

    return user;
  },
);