'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, User, AlertCircle, ArrowRight, Mail } from 'lucide-react';

interface SuccessInfo {
  provider?: string;
  isNewUser?: boolean;
  isNewIdentity?: boolean;
  needsEmailVerification?: boolean;
  action?: 'login' | 'link';
}

/**
 * OAuth 성공 처리 페이지
 * 로그인 완료 후 사용자 상태에 따른 안내 제공
 */
export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [info, setInfo] = useState<SuccessInfo>({});
  const [countdown, setCountdown] = useState(5);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // URL 파라미터에서 정보 추출
    const provider = searchParams.get('provider');
    const newUser = searchParams.get('new_user') === 'true';
    const newIdentity = searchParams.get('new_identity') === 'true';
    const needsEmail = searchParams.get('needs_email') === 'true';
    const action = searchParams.get('action') as 'login' | 'link' || 'login';

    setInfo({
      provider,
      isNewUser: newUser,
      isNewIdentity: newIdentity,
      needsEmailVerification: needsEmail,
      action,
    });

    // 사용자 정보 조회
    fetchUserInfo();

    // 5초 후 자동 리다이렉트 (계정 연결이 아닌 경우)
    if (action === 'login') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [searchParams, router]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include', // 쿠키 포함
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const getProviderDisplayName = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'google': return 'Google';
      case 'kakao': return '카카오';
      case 'naver': return '네이버';
      default: return '소셜 계정';
    }
  };

  const getSuccessMessage = () => {
    if (info.action === 'link') {
      return `${getProviderDisplayName(info.provider)} 계정이 성공적으로 연결되었습니다!`;
    }

    if (info.isNewUser) {
      return `${getProviderDisplayName(info.provider)} 계정으로 회원가입이 완료되었습니다!`;
    }

    return `${getProviderDisplayName(info.provider)} 계정으로 로그인되었습니다!`;
  };

  const getStatusMessages = () => {
    const messages = [];

    if (info.isNewUser) {
      messages.push({
        icon: User,
        text: '새로운 계정이 생성되었습니다',
        type: 'success' as const,
      });
    }

    if (info.isNewIdentity && !info.isNewUser) {
      messages.push({
        icon: CheckCircle,
        text: `${getProviderDisplayName(info.provider)} 계정이 기존 계정에 연결되었습니다`,
        type: 'success' as const,
      });
    }

    if (info.needsEmailVerification) {
      messages.push({
        icon: Mail,
        text: '이메일 인증이 필요합니다. 계정 설정에서 이메일을 등록해주세요',
        type: 'warning' as const,
      });
    }

    return messages;
  };

  const statusMessages = getStatusMessages();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 성공 아이콘 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {info.action === 'link' ? '계정 연결 완료' : '로그인 성공'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {getSuccessMessage()}
          </p>
        </div>

        {/* 사용자 정보 카드 */}
        {userInfo && (
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center space-x-3">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.displayName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {userInfo.displayName || '사용자'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {userInfo.email || '이메일 없음'}
                </p>
                <p className="text-xs text-gray-400">
                  {userInfo.role === 'INFLUENCER' ? '인플루언서' :
                   userInfo.role === 'ADVERTISER' ? '광고주' : '관리자'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 상태 메시지들 */}
        {statusMessages.length > 0 && (
          <div className="space-y-3">
            {statusMessages.map((msg, index) => {
              const Icon = msg.icon;
              const colorClasses = 
                msg.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700';

              return (
                <div key={index} className={`flex items-center p-3 rounded-md border ${colorClasses}`}>
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">{msg.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="space-y-4">
          {info.action === 'link' ? (
            // 계정 연결 완료 시
            <div className="space-y-3">
              <Link
                href="/settings/accounts"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                계정 관리로 이동
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                홈으로 이동
              </Link>
            </div>
          ) : (
            // 로그인 완료 시
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                지금 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              {info.needsEmailVerification && (
                <Link
                  href="/settings/profile"
                  className="w-full flex items-center justify-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                >
                  이메일 등록하기
                  <Mail className="ml-2 h-4 w-4" />
                </Link>
              )}

              {/* 자동 리다이렉트 카운트다운 */}
              <div className="text-center text-sm text-gray-500">
                {countdown}초 후 자동으로 홈페이지로 이동합니다
              </div>
            </div>
          )}
        </div>

        {/* 추가 액션 링크들 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <Link href="/settings/accounts" className="hover:text-gray-700">
              계정 관리
            </Link>
            <Link href="/settings/profile" className="hover:text-gray-700">
              프로필 설정
            </Link>
            <Link href="/help" className="hover:text-gray-700">
              도움말
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
