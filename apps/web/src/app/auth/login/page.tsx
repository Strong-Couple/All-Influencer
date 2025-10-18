'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Chrome, MessageCircle, User, Mail, UserPlus } from 'lucide-react';

/**
 * 통합 로그인 페이지
 * Local Auth(이메일/비밀번호) + 소셜 로그인 제공
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSocialLogin = (provider: string) => {
    setIsLoading(provider);
    // API 서버의 OAuth 엔드포인트로 직접 이동
    window.location.href = `${API_URL}/api/v1/auth/${provider}`;
  };

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
      description: 'Google 계정으로 로그인',
    },
    {
      id: 'kakao',
      name: 'Kakao',
      icon: MessageCircle,
      color: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500',
      description: '카카오 계정으로 로그인',
    },
    {
      id: 'naver',
      name: 'Naver',
      icon: User,
      color: 'bg-green-500 text-white hover:bg-green-600',
      description: '네이버 계정으로 로그인',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600 hover:text-blue-700">
              All Influencer
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            올인플루언서 플랫폼에 로그인하세요
          </p>
        </div>

        {/* Local 로그인 옵션 */}
        <div className="space-y-3">
          <Link
            href="/auth/local-login"
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 font-medium"
          >
            <Mail className="w-5 h-5 mr-3" />
            이메일로 로그인
          </Link>
          
          <Link
            href="/auth/signup"
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200 font-medium"
          >
            <UserPlus className="w-5 h-5 mr-3" />
            계정 만들기
          </Link>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">또는 소셜 계정으로</span>
          </div>
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-4">
          {socialProviders.map((provider) => {
            const Icon = provider.icon;
            const isCurrentLoading = isLoading === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={isLoading !== null}
                className={`
                  w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${provider.color}
                `}
              >
                {isCurrentLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                ) : (
                  <Icon className="h-5 w-5 mr-3" />
                )}
                <span className={isCurrentLoading ? 'ml-3' : ''}>
                  {isCurrentLoading ? '로그인 중...' : provider.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* 하단 링크 */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            처음 이용하시나요?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입하기
            </Link>
          </p>
          
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-gray-700">
              이용약관
            </Link>
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            로그인 방법
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>이메일 로그인:</strong> 직접 가입한 계정으로 로그인</li>
            <li>• <strong>소셜 로그인:</strong> 빠르고 간편한 OAuth 인증</li>
            <li>• <strong>계정 통합:</strong> 여러 로그인 방법을 하나의 계정으로 연결 가능</li>
            <li>• <strong>보안:</strong> 안전한 JWT 쿠키 기반 인증</li>
          </ul>
        </div>
      </div>
    </div>
  );
}