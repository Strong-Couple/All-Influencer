'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';

import type { AuthUser } from '../types/api';
import { fetchCurrentUser, logout } from '../services/auth';

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingLogout, setPendingLogout] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const current = await fetchCurrentUser();
      if (mounted) {
        setUser(current);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setPendingLogout(true);
    try {
      await logout();
      setUser(null);
      // 로그아웃 성공 후 홈으로 리다이렉트 및 페이지 새로고침
      router.push('/');
      router.refresh();
    } catch {
      alert('로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingLogout(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-sm text-gray-600">확인 중...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {/* 사용자 프로필 */}
        <div className="flex items-center gap-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.displayName || '사용자'}
          </span>
        </div>

        {/* 드롭다운 메뉴 또는 로그아웃 버튼 */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings/accounts"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            계정 관리
          </Link>
          <button
            onClick={handleLogout}
            disabled={pendingLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
          >
            {pendingLogout ? (
              <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-3 h-3" />
            )}
            <span>{pendingLogout ? '로그아웃 중' : '로그아웃'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 상태 - 소셜 로그인 페이지로 이동
  return (
    <Link
      href="/auth/login"
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      <User className="w-4 h-4" />
      로그인
    </Link>
  );
}

