'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Briefcase, Zap } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'INFLUENCER' as 'INFLUENCER' | 'ADVERTISER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          username: formData.displayName, // displayName을 username으로 사용
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 회원가입 성공 시 사용자 역할에 따라 적절한 페이지로 이동
        const userRole = data.data?.user?.role;
        if (userRole === 'INFLUENCER') {
          router.push('/my/influencer');
        } else if (userRole === 'ADVERTISER') {
          router.push('/my/advertiser');
        } else {
          router.push('/my');
        }
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">계정 만들기</h1>
          <p className="text-gray-600">올인플루언서 플랫폼에 가입하세요</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 역할 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                가입 유형
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                  formData.role === 'INFLUENCER' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="INFLUENCER"
                    checked={formData.role === 'INFLUENCER'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Zap className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium text-sm">인플루언서</div>
                  <div className="text-xs text-gray-500">콘텐츠 제작자</div>
                </label>

                <label className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                  formData.role === 'ADVERTISER' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="ADVERTISER"
                    checked={formData.role === 'ADVERTISER'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Briefcase className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium text-sm">사업자</div>
                  <div className="text-xs text-gray-500">광고주</div>
                </label>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={formData.displayName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="홍길동"
              />
              <p className="mt-1 text-xs text-gray-500">3-50자, 사용자명으로도 사용됩니다</p>
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="최소 8자 이상"
                />
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호 재입력"
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '계정 만들기'}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/local-login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인하기
                </Link>
              </p>
            </div>

            {/* 소셜 로그인 옵션 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              소셜 로그인으로 계속하기
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
