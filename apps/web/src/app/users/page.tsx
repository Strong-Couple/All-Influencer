'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Users as UsersIcon, Star, TrendingUp, Eye } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // 임시 데모 데이터 - 더 많은 사용자 추가
    setTimeout(() => {
      const demoUsers = [
        {
          id: '1',
          displayName: '제니 김',
          username: 'jenny_kim',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '뷰티와 라이프스타일을 다루는 인플루언서입니다. 매일 새로운 뷰티 트렌드를 소개하고 있어요!',
          website: 'https://jennykim.blog',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400',
          createdAt: '2024-01-01',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['뷰티', '라이프스타일', '패션'],
            followers: 125000,
            avgEngagement: 4.8,
            ratePerPost: 500000,
            rating: 4.9,
            completedCampaigns: 42
          }
        },
        {
          id: '2',
          displayName: '알렉스 피트니스',
          username: 'alex_fitness',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '건강한 라이프스타일을 추구하는 피트니스 인플루언서입니다. 운동의 즐거움을 전파합니다!',
          avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400',
          createdAt: '2024-01-02',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['피트니스', '헬스', '라이프스타일'],
            followers: 75000,
            avgEngagement: 6.2,
            ratePerPost: 300000,
            rating: 4.7,
            completedCampaigns: 28
          }
        },
        {
          id: '3',
          displayName: '테크 리뷰어 박민수',
          username: 'tech_minsoo',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '최신 테크 트렌드와 가젯 리뷰를 전문으로 하는 테크 인플루언서입니다.',
          website: 'https://techreview.blog',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          createdAt: '2024-01-05',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['테크', '가젯', '리뷰'],
            followers: 89000,
            avgEngagement: 5.1,
            ratePerPost: 400000,
            rating: 4.8,
            completedCampaigns: 35
          }
        },
        {
          id: '4',
          displayName: '요리하는 소희',
          username: 'cooking_sohee',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '맛있는 레시피와 요리 팁을 공유하는 푸드 인플루언서입니다.',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          createdAt: '2024-01-08',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['푸드', '레시피', '라이프스타일'],
            followers: 156000,
            avgEngagement: 7.3,
            ratePerPost: 600000,
            rating: 4.9,
            completedCampaigns: 58
          }
        },
        {
          id: '5',
          displayName: '뷰티 브랜드 코리아',
          username: 'beauty_corp',
          role: 'ADVERTISER',
          status: 'ACTIVE',
          bio: '혁신적인 뷰티 제품을 만드는 브랜드입니다. 자연에서 영감을 받은 제품을 선보입니다.',
          website: 'https://beautybrand.com',
          avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          createdAt: '2024-01-03',
          _count: { jobPosts: 8 }
        },
        {
          id: '6',
          displayName: '액티브 피트니스',
          username: 'active_fitness',
          role: 'ADVERTISER',
          status: 'ACTIVE',
          bio: '프리미엄 운동복과 피트니스 용품을 제조하는 브랜드입니다.',
          website: 'https://activefit.co.kr',
          avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          createdAt: '2024-01-07',
          _count: { jobPosts: 5 }
        },
        {
          id: '7',
          displayName: '패션 트렌드 이유진',
          username: 'fashion_yujin',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '최신 패션 트렌드와 스타일링 팁을 공유하는 패션 인플루언서입니다.',
          website: 'https://fashionyujin.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          createdAt: '2024-01-10',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['패션', '스타일링', '트렌드'],
            followers: 98000,
            avgEngagement: 4.2,
            ratePerPost: 450000,
            rating: 4.6,
            completedCampaigns: 31
          }
        },
        {
          id: '8',
          displayName: '게임 스트리머 지훈',
          username: 'gamer_jihoon',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          bio: '인기 게임들의 플레이와 공략을 공유하는 게임 인플루언서입니다.',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
          createdAt: '2024-01-12',
          _count: { jobPosts: 0 },
          profile: {
            categories: ['게임', '스트리밍', '엔터테인먼트'],
            followers: 67000,
            avgEngagement: 8.1,
            ratePerPost: 250000,
            rating: 4.5,
            completedCampaigns: 19
          }
        }
      ];
      setUsers(demoUsers);
      setLoading(false);
    }, 1000);
  }, [currentPage]);

  // 검색 및 필터링 로직
  useEffect(() => {
    let filtered = [...users];

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.categories || []).some((cat: string) => 
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 역할 필터링
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // 상태 필터링
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // 정렬
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case 'followers':
        filtered.sort((a, b) => (b.profile?.followers || 0) - (a.profile?.followers || 0));
        break;
      case 'engagement':
        filtered.sort((a, b) => (b.profile?.avgEngagement || 0) - (a.profile?.avgEngagement || 0));
        break;
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

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

  const influencerStats = {
    total: users.filter(u => u.role === 'INFLUENCER').length,
    totalFollowers: users.filter(u => u.role === 'INFLUENCER').reduce((sum, u) => sum + (u.profile?.followers || 0), 0),
    avgEngagement: users.filter(u => u.role === 'INFLUENCER' && u.profile?.avgEngagement).reduce((sum, u, _, arr) => sum + (u.profile?.avgEngagement || 0) / arr.length, 0),
    totalCampaigns: users.filter(u => u.role === 'INFLUENCER').reduce((sum, u) => sum + (u.profile?.completedCampaigns || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">사용자 목록</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">전체 사용자</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{influencerStats.total}</p>
                  <p className="text-sm text-gray-600">인플루언서</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{(influencerStats.totalFollowers / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-gray-600">총 팔로워</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{influencerStats.totalCampaigns}</p>
                  <p className="text-sm text-gray-600">완료 캠페인</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 검색 */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 사용자명, 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 필터 및 정렬 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                필터
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순</option>
                <option value="followers">팔로워순</option>
                <option value="engagement">참여율순</option>
              </select>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 확장 필터 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ALL">전체</option>
                  <option value="INFLUENCER">인플루언서</option>
                  <option value="ADVERTISER">광고주</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ALL">전체</option>
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="SUSPENDED">정지</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                    setSortBy('newest');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 결과 개수 */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
              ? `${filteredUsers.length}개의 검색 결과 (전체 ${users.length}개 중)`
              : `총 ${users.length}명의 사용자`}
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                ? '검색 조건에 맞는 사용자가 없습니다.'
                : '등록된 사용자가 없습니다.'}
            </p>
            {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
          }>
            {filteredUsers.map((user) => (
              viewMode === 'grid' ? (
                // 그리드 뷰 카드
                <div key={user.id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.displayName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {user.displayName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </p>
                      {user.profile?.rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">
                            {user.profile.rating} ({user.profile.completedCampaigns}개 캠페인)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </div>

                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* 인플루언서 프로필 정보 */}
                  {user.role === 'INFLUENCER' && user.profile && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {(user.profile.followers / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-600">팔로워</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {user.profile.avgEngagement}%
                          </p>
                          <p className="text-xs text-gray-600">참여율</p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-lg font-semibold text-purple-600">
                          ₩{(user.profile.ratePerPost / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-600">포스트당 요금</p>
                      </div>
                      
                      {user.profile.categories && user.profile.categories.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {user.profile.categories.slice(0, 3).map((category: string, index: number) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-blue-600 border">
                                {category}
                              </span>
                            ))}
                            {user.profile.categories.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{user.profile.categories.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 광고주 정보 */}
                  {user.role === 'ADVERTISER' && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {user._count?.jobPosts || 0}
                        </p>
                        <p className="text-sm text-gray-600">활성 공고</p>
                      </div>
                      {user.website && (
                        <div className="mt-2 text-center">
                          <a
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 truncate"
                          >
                            웹사이트 방문
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
                    <span>가입일: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors">
                      상세보기
                    </button>
                  </div>
                </div>
              ) : (
                // 리스트 뷰
                <div key={user.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4">
                  <div className="flex items-center space-x-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.displayName.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.displayName}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {user.bio}
                        </p>
                      )}
                      
                      {user.profile?.categories && (
                        <div className="flex flex-wrap gap-1">
                          {user.profile.categories.slice(0, 4).map((category: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      {user.role === 'INFLUENCER' && user.profile && (
                        <>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900">{(user.profile.followers / 1000).toFixed(0)}K</span>
                            <span className="text-gray-500 text-xs ml-1">팔로워</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-green-600">{user.profile.avgEngagement}%</span>
                            <span className="text-gray-500 text-xs ml-1">참여율</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">
                              {user.profile.rating} ({user.profile.completedCampaigns})
                            </span>
                          </div>
                        </>
                      )}
                      {user.role === 'ADVERTISER' && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{user._count?.jobPosts || 0}</span>
                          <span className="text-gray-500 text-xs ml-1">공고</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
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