'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

export default function AuthButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // httpOnly 쿠키 포함
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.debug('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        window.location.reload(); // 페이지 새로고침으로 상태 초기화
      } else {
        alert('로그아웃 실패');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 중 오류 발생');
    } finally {
      setLoading(false);
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

  if (isAuthenticated && user) {
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
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
          >
            <LogOut className="w-3 h-3" />
            로그아웃
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

