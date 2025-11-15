/**
 * 웹 앱용 API 클라이언트 설정
 * 
 * httpOnly 쿠키 기반 인증을 사용하므로, SDK의 기본 인스턴스를 사용합니다.
 * 필요시 baseURL만 환경 변수로 설정합니다.
 */

import { apiClient as sdkApiClient, AllInfluencerApiClient } from '@all-influencer/sdk';

// 환경 변수로 baseURL이 설정되어 있으면 새 인스턴스 생성, 아니면 SDK 기본 인스턴스 사용
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// baseURL이 기본값과 다르면 새 인스턴스 생성
export const apiClient = 
  baseURL === 'http://localhost:3001/api/v1'
    ? sdkApiClient
    : new AllInfluencerApiClient({
        baseURL,
        timeout: 10000,
      });

// httpOnly 쿠키를 사용하므로 localStorage는 사용하지 않습니다.
// 토큰은 서버에서 httpOnly 쿠키로 관리되며, 클라이언트에서는 접근할 수 없습니다.

export default apiClient;

