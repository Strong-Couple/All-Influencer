'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

/**
 * OAuth 실패 처리 페이지
 * 로그인 실패 시 오류 메시지와 재시도 옵션 제공
 */
export default function AuthFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{
    error?: string;
    provider?: string;
    action?: string;
  }>({});

  useEffect(() => {
    // URL 파라미터에서 오류 정보 추출
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');
    const action = searchParams.get('action') || 'login';

    setErrorInfo({ error, provider, action });
  }, [searchParams]);

  const getProviderDisplayName = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'google': return 'Google';
      case 'kakao': return '카카오';
      case 'naver': return '네이버';
      default: return '소셜 계정';
    }
  };

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return '사용자가 권한 승인을 거부했습니다.';
      case 'google_error':
      case 'kakao_error':
      case 'naver_error':
        return `${getProviderDisplayName(errorInfo.provider)} 로그인 중 오류가 발생했습니다.`;
      case 'no_user_data':
        return '소셜 계정에서 사용자 정보를 가져올 수 없습니다.';
      case 'integration_failed':
        return '계정 통합 처리 중 오류가 발생했습니다.';
      case 'linking_failed':
        return '계정 연결 중 오류가 발생했습니다.';
      case 'account_already_linked':
        return '이미 다른 계정에 연결된 소셜 계정입니다.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  };

  const getErrorSolution = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return [
          '소셜 로그인을 위해서는 권한 승인이 필요합니다.',
          '다시 로그인을 시도하고 권한을 허용해주세요.',
        ];
      case 'google_error':
      case 'kakao_error':
      case 'naver_error':
        return [
          '일시적인 서비스 오류일 수 있습니다.',
          '잠시 후 다시 시도하거나 다른 소셜 계정을 이용해보세요.',
        ];
      case 'no_user_data':
        return [
          '소셜 계정의 프로필 정보가 제한되어 있을 수 있습니다.',
          '계정 설정에서 프로필 공개 설정을 확인해주세요.',
        ];
      case 'account_already_linked':
        return [
          '해당 소셜 계정은 이미 다른 사용자에게 연결되어 있습니다.',
          '다른 소셜 계정을 사용하거나 고객센터에 문의해주세요.',
        ];
      default:
        return [
          '네트워크 상태를 확인해주세요.',
          '문제가 지속되면 고객센터에 문의해주세요.',
        ];
    }
  };

  const handleRetry = () => {
    if (errorInfo.action === 'link') {
      // 계정 연결 재시도
      router.push('/settings/accounts');
    } else {
      // 로그인 재시도
      router.push('/auth/login');
    }
  };

  const isRetryable = !['account_already_linked', 'access_denied'].includes(errorInfo.error || '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 오류 아이콘 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {errorInfo.action === 'link' ? '계정 연결 실패' : '로그인 실패'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {getProviderDisplayName(errorInfo.provider)} {errorInfo.action === 'link' ? '계정 연결' : '로그인'}에 
            실패했습니다
          </p>
        </div>

        {/* 오류 메시지 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">
                오류 내용
              </h3>
              <p className="text-sm text-red-700">
                {getErrorMessage(errorInfo.error)}
              </p>
            </div>
          </div>
        </div>

        {/* 해결 방법 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            해결 방법
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            {getErrorSolution(errorInfo.error).map((solution, index) => (
              <li key={index}>• {solution}</li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          {isRetryable && (
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </button>
          )}

          <Link
            href={errorInfo.action === 'link' ? '/settings/accounts' : '/auth/login'}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {errorInfo.action === 'link' ? '계정 관리로 돌아가기' : '로그인 페이지로 돌아가기'}
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            홈페이지로 이동
          </Link>
        </div>

        {/* 도움말 */}
        <div className="text-center space-y-4">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              다른 방법으로 시도해보세요
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/auth/login"
                className="text-xs text-gray-500 hover:text-gray-700 p-2 border border-gray-200 rounded"
              >
                다른 소셜 계정
              </Link>
              <button
                disabled
                className="text-xs text-gray-400 cursor-not-allowed p-2 border border-gray-200 rounded"
              >
                이메일 로그인
                <br />
                <span className="text-xs">(준비 중)</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>문제가 지속되나요?</p>
            <div className="flex justify-center space-x-4">
              <Link href="/help" className="hover:text-gray-700">
                도움말
              </Link>
              <Link href="/contact" className="hover:text-gray-700">
                고객센터
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
