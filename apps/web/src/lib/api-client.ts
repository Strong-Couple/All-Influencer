/**
 * 웹 앱용 API 클라이언트 설정
 */

import { AllInfluencerApiClient } from '@all-influencer/sdk';

// 클라이언트 인스턴스 생성
export const apiClient = new AllInfluencerApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
});

// 브라우저 환경에서 localStorage에서 토큰 자동 복원
if (typeof window !== 'undefined') {
  const tokens = localStorage.getItem('auth-tokens');
  if (tokens) {
    try {
      const parsedTokens = JSON.parse(tokens);
      apiClient.setTokens(parsedTokens);
    } catch (error) {
      console.warn('토큰 복원 실패:', error);
      localStorage.removeItem('auth-tokens');
    }
  }
}

// 토큰 저장/제거 헬퍼 함수들
export const authStorage = {
  saveTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-tokens', JSON.stringify(tokens));
      apiClient.setTokens(tokens);
    }
  },

  getTokens: () => {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('auth-tokens');
      return tokens ? JSON.parse(tokens) : null;
    }
    return null;
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-tokens');
      apiClient.clearTokens();
    }
  },

  isAuthenticated: () => {
    const tokens = authStorage.getTokens();
    return !!(tokens?.accessToken);
  },
};

export default apiClient;

