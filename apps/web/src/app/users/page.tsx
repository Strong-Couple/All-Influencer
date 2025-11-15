'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Filter, Grid, List, Search, Users as UsersIcon, Star, TrendingUp, Eye } from 'lucide-react';

import { fetchUsers } from '../../services/users';
import type { ApiMeta, UserListItem, UserRole, UserStatus } from '../../types/api';

type RoleFilter = 'ALL' | UserRole;
type StatusFilter = 'ALL' | UserStatus;
type SortKey = 'newest' | 'oldest' | 'name';

const PAGE_SIZE = 12;

export default function UsersPage() {
  const [rawUsers, setRawUsers] = useState<UserListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchUsers({
          page: currentPage,
          limit: PAGE_SIZE,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: debouncedSearch || undefined,
        });

        if (cancelled) {
          return;
        }

        setRawUsers(payload.data);
        setMeta(payload.meta);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setRawUsers([]);
        setMeta(null);
        setError(err instanceof Error ? err.message : '사용자 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [currentPage, roleFilter, statusFilter, debouncedSearch, reloadFlag]);

  useEffect(() => {
    setUsers(sortUsers([...rawUsers], sortBy));
  }, [rawUsers, sortBy]);

  const summary = useMemo(() => {
    const activeCount = rawUsers.filter((user) => user.status === 'ACTIVE').length;
    const recentCount = rawUsers.filter((user) => {
      if (!user.lastLoginAt) {
        return false;
      }
      const diff = Date.now() - new Date(user.lastLoginAt).getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: meta?.total ?? rawUsers.length,
      pageCount: rawUsers.length,
      activeCount,
      recentCount,
    };
  }, [rawUsers, meta]);

  const canGoPrev = meta?.hasPrev ?? currentPage > 1;
  const canGoNext = meta?.hasNext ?? false;

  const handleRetry = () => setReloadFlag((flag) => flag + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">사용자 목록</h1>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
                onClick={handleRetry}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">사용자 목록</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard icon={<UsersIcon className="h-8 w-8 text-blue-500" />} label="총 사용자" value={summary.total} />
            <SummaryCard icon={<Star className="h-8 w-8 text-yellow-500" />} label="현재 페이지" value={summary.pageCount} />
            <SummaryCard icon={<TrendingUp className="h-8 w-8 text-green-500" />} label="활성 사용자" value={summary.activeCount} />
            <SummaryCard icon={<Eye className="h-8 w-8 text-purple-500" />} label="최근 7일 로그인" value={summary.recentCount} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순</option>
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

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleFilter);
                    setCurrentPage(1);
                  }}
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
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setCurrentPage(1);
                  }}
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
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {meta
              ? `총 ${meta.total}명 중 ${users.length}명 표시`
              : `총 ${users.length}명의 사용자`}
          </p>
        </div>

        {users.length === 0 ? (
          <EmptyState onReset={() => {
            setSearchTerm('');
            setRoleFilter('ALL');
            setStatusFilter('ALL');
          }} />
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
            {users.map((user) => (
              viewMode === 'grid' ? (
                <UserGridCard key={user.id} user={user} />
              ) : (
                <UserListCard key={user.id} user={user} />
              )
            ))}
          </div>
        )}

        {users.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-md">
                {meta ? `${meta.page} / ${meta.totalPages}` : currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!canGoNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center">
        {icon}
        <div className="ml-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
      <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-lg mb-2">조건에 맞는 사용자가 없습니다.</p>
      <button
        onClick={onReset}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        필터 초기화
      </button>
    </div>
  );
}

function UserGridCard({ user }: { user: UserListItem }) {
  const primary = user.displayName ?? '이름 미등록';
  const secondary = user.email ?? '이메일 정보 없음';
  const initial = (primary || secondary).charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 p-6">
      <div className="flex items-center space-x-3 mb-4">
        {user.avatar ? (
          <img src={user.avatar} alt={primary} className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100" />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{initial}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{primary}</h3>
          <p className="text-sm text-gray-500 truncate">{secondary}</p>
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {formatWebsite(user.website)}
            </a>
          )}
        </div>
      </div>

      {user.bio && (
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">{user.bio}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
          {getStatusLabel(user.status)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
        <span>가입일: {formatDate(user.createdAt)}</span>
        <span>최근 로그인: {formatDate(user.lastLoginAt)}</span>
      </div>
    </div>
  );
}

function UserListCard({ user }: { user: UserListItem }) {
  const primary = user.displayName ?? '이름 미등록';
  const secondary = user.email ?? '이메일 정보 없음';
  const initial = (primary || secondary).charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4">
      <div className="flex items-center space-x-4">
        {user.avatar ? (
          <img src={user.avatar} alt={primary} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{initial}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{primary}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
              {getStatusLabel(user.status)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2 truncate">{secondary}</p>
          {user.bio && (
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">{user.bio}</p>
          )}
        </div>

        <div className="text-right text-xs text-gray-500 space-y-1">
          <p>가입 {formatDate(user.createdAt)}</p>
          <p>최근 {formatDate(user.lastLoginAt)}</p>
        </div>
      </div>
    </div>
  );
}

function sortUsers(list: UserListItem[], sortKey: SortKey) {
  switch (sortKey) {
    case 'oldest':
      return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'name':
      return list.sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''));
    case 'newest':
    default:
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

function formatDate(value?: string) {
  if (!value) {
    return '기록 없음';
  }
  return new Date(value).toLocaleDateString();
}

function formatWebsite(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '') ?? url;
  } catch {
    return url;
  }
}

function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800';
    case 'ADVERTISER':
      return 'bg-green-100 text-green-800';
    case 'INFLUENCER':
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return '관리자';
    case 'ADVERTISER':
      return '광고주';
    case 'INFLUENCER':
    default:
      return '인플루언서';
  }
}

function getStatusBadge(status: UserStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800';
    case 'INACTIVE':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: UserStatus) {
  switch (status) {
    case 'ACTIVE':
      return '활성';
    case 'SUSPENDED':
      return '정지';
    case 'INACTIVE':
    default:
      return '비활성';
  }
}
