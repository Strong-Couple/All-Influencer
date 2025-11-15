import { authApi } from '@all-influencer/sdk';

import type { AuthUser } from '../types/api';
import { unwrapApiResponse } from '../types/api';

interface AuthMeResponse {
  success?: boolean;
  user?: AuthUser;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const raw = await authApi.getMe();
    const payload = unwrapApiResponse<AuthMeResponse>(raw);
    return payload.user ?? null;
  } catch (error: any) {
    // 401 에러는 로그인하지 않은 상태에서 정상적인 응답이므로 조용히 처리
    if (error?.response?.status === 401) {
      return null;
    }
    // 다른 에러는 개발 환경에서만 로그
    if (process.env.NODE_ENV !== 'production') {
      console.debug('fetchCurrentUser error', error);
    }
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('logout error', error);
    }
    throw error;
  }
}

