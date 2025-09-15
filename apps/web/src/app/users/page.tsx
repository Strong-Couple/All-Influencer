'use client';

import { useState, useEffect } from 'react';
// import { apiClient } from '../lib/api-client'; // 임시 비활성화

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 임시 데모 데이터
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          displayName: '제니 김',
          username: 'jenny_kim',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '뷰티와 라이프스타일을 다루는 인플루언서입니다.',
          website: 'https://jennykim.blog',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400',
          createdAt: '2024-01-01',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['뷰티', '라이프스타일', '패션'],
            followers: 125000,
            avgEngagement: 4.8,
            ratePerPost: 500000
          }
        },
        {
          id: '2',
          displayName: '알렉스 피트니스',
          username: 'alex_fitness',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '건강한 라이프스타일을 추구하는 피트니스 인플루언서입니다.',
          avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400',
          createdAt: '2024-01-02',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['피트니스', '헬스', '라이프스타일'],
            followers: 75000,
            avgEngagement: 3.2,
            ratePerPost: 300000
          }
        },
        {
          id: '3',
          displayName: '뷰티 브랜드 마케팅팀',
          username: 'beauty_corp',
          role: 'ADVERTISER',
          status: 'ACTIVE',
          bio: '혁신적인 뷰티 제품을 만드는 브랜드입니다.',
          website: 'https://beautybrand.com',
          avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          createdAt: '2024-01-03',
          _count: { jobPosts: 3 }
        },
        {
          id: '4',
          displayName: '시스템 관리자',
          username: 'admin',
          role: 'ADMIN',
          status: 'ACTIVE',
          bio: '전체 플랫폼을 관리하는 시스템 관리자입니다.',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
          createdAt: '2024-01-01',
          _count: { jobPosts: 0 }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">사용자 목록</h1>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">사용자 목록</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INFLUENCER':
        return 'bg-blue-100 text-blue-800';
      case 'ADVERTISER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'INFLUENCER':
        return '인플루언서';
      case 'ADVERTISER':
        return '광고주';
      default:
        return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '활성';
      case 'INACTIVE':
        return '비활성';
      case 'SUSPENDED':
        return '정지';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">사용자 목록</h1>
          <p className="mt-2 text-lg text-gray-600">
            플랫폼에 등록된 사용자들을 확인해보세요
          </p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 사용자가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {user.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </div>

                  {user.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                    >
                      {user.website}
                    </a>
                  )}
                </div>

                {/* 인플루언서 프로필 정보 */}
                {user.role === 'INFLUENCER' && user.profile && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">팔로워:</span>
                        <span className="font-medium">
                          {user.profile.followers?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">참여율:</span>
                        <span className="font-medium">{user.profile.avgEngagement}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">포스트당:</span>
                        <span className="font-medium text-green-600">
                          {user.profile.ratePerPost?.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    
                    {user.profile.categories && user.profile.categories.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {user.profile.categories.slice(0, 2).map((category: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              {category}
                            </span>
                          ))}
                          {user.profile.categories.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{user.profile.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
                  <span>가입: {new Date(user.createdAt).toLocaleDateString()}</span>
                  {user.role === 'ADVERTISER' && (
                    <span>공고: {user._count?.jobPosts || 0}개</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 간단한 페이지네이션 */}
        {users.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-md">
                {currentPage}
              </span>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}