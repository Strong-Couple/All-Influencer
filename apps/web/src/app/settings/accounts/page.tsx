'use client';

import { useState, useEffect } from 'react';
import { Chrome, MessageCircle, User, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react';

interface LinkedAccount {
  provider: string;
  email?: string;
  linkedAt: string;
  lastUpdated: string;
}

interface AccountInfo {
  identities: LinkedAccount[];
  hasPassword: boolean;
  primaryEmail?: string;
  totalAuthMethods: number;
}

/**
 * 계정 연결 관리 페이지
 * 연결된 소셜 계정 조회, 연결, 해제 관리
 */
export default function AccountsPage() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/link`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('계정 정보를 가져올 수 없습니다');
      }

      const data = await response.json();
      setAccountInfo(data);
    } catch (error) {
      console.error('Failed to fetch account info:', error);
      setError(error instanceof Error ? error.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = (provider: string) => {
    setActionLoading(`connect-${provider}`);
    // API 서버의 계정 연결 엔드포인트로 이동
    window.location.href = `${API_URL}/api/v1/auth/link/${provider}`;
  };

  const handleDisconnectAccount = async (provider: string) => {
    if (!accountInfo) return;

    // 마지막 인증 수단인지 확인
    if (accountInfo.totalAuthMethods <= 1) {
      alert('마지막 인증 수단은 해제할 수 없습니다. 다른 인증 방법을 먼저 설정해주세요.');
      return;
    }

    const confirmed = confirm(
      `${getProviderDisplayName(provider)} 계정 연결을 해제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`disconnect-${provider}`);

      const response = await fetch(`${API_URL}/auth/link/${provider}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '계정 연결 해제에 실패했습니다');
      }

      // 성공 시 계정 정보 다시 가져오기
      await fetchAccountInfo();
      alert('계정 연결이 해제되었습니다.');
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      alert(error instanceof Error ? error.message : '계정 연결 해제에 실패했습니다');
    } finally {
      setActionLoading(null);
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google': return 'Google';
      case 'kakao': return '카카오';
      case 'naver': return '네이버';
      default: return provider;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google': return Chrome;
      case 'kakao': return MessageCircle;
      case 'naver': return User;
      default: return User;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google': return 'border-gray-300 text-gray-700';
      case 'kakao': return 'border-yellow-300 text-yellow-700';
      case 'naver': return 'border-green-300 text-green-700';
      default: return 'border-gray-300 text-gray-700';
    }
  };

  const allProviders = ['google', 'kakao', 'naver'];
  const connectedProviders = accountInfo?.identities.map(identity => identity.provider) || [];
  const availableProviders = allProviders.filter(provider => !connectedProviders.includes(provider));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">계정 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">계정 관리</h1>
          <p className="mt-2 text-gray-600">
            연결된 소셜 계정을 관리하고 새로운 계정을 연결할 수 있습니다
          </p>
        </div>

        {/* 보안 상태 카드 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">보안 상태</h2>
            </div>
            <span className="text-sm text-green-600 font-medium">안전함</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {accountInfo?.totalAuthMethods || 0}
              </div>
              <div className="text-sm text-gray-600">총 인증 방법</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {accountInfo?.identities.length || 0}
              </div>
              <div className="text-sm text-gray-600">연결된 소셜 계정</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {accountInfo?.hasPassword ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">패스워드 계정</div>
            </div>
          </div>
        </div>

        {/* 연결된 계정 목록 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">연결된 계정</h2>
          
          {accountInfo?.identities.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">연결된 소셜 계정이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accountInfo?.identities.map((identity) => {
                const Icon = getProviderIcon(identity.provider);
                const isDisconnecting = actionLoading === `disconnect-${identity.provider}`;
                
                return (
                  <div
                    key={identity.provider}
                    className={`flex items-center justify-between p-4 border rounded-lg ${getProviderColor(identity.provider)}`}
                  >
                    <div className="flex items-center space-x-4">
                      <Icon className="h-8 w-8" />
                      <div>
                        <h3 className="font-medium">
                          {getProviderDisplayName(identity.provider)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {identity.email || '이메일 정보 없음'}
                        </p>
                        <p className="text-xs text-gray-400">
                          연결일: {new Date(identity.linkedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDisconnectAccount(identity.provider)}
                      disabled={isDisconnecting || (accountInfo?.totalAuthMethods || 0) <= 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isDisconnecting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      {isDisconnecting ? '해제 중...' : '연결 해제'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 새 계정 연결 */}
        {availableProviders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">새 계정 연결</h2>
            
            <div className="space-y-4">
              {availableProviders.map((provider) => {
                const Icon = getProviderIcon(provider);
                const isConnecting = actionLoading === `connect-${provider}`;
                
                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                  >
                    <div className="flex items-center space-x-4">
                      <Icon className="h-8 w-8 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getProviderDisplayName(provider)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {provider === 'google' && 'Google 계정으로 연결하기'}
                          {provider === 'kakao' && '카카오 계정으로 연결하기'}
                          {provider === 'naver' && '네이버 계정으로 연결하기'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnectAccount(provider)}
                      disabled={isConnecting}
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      {isConnecting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isConnecting ? '연결 중...' : '연결하기'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 안전 가이드 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">보안 가이드</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 최소 2개 이상의 인증 방법을 설정하는 것을 권장합니다</li>
            <li>• 마지막 인증 방법은 해제할 수 없습니다</li>
            <li>• 연결 해제된 소셜 계정은 언제든지 다시 연결할 수 있습니다</li>
            <li>• 의심스러운 활동이 감지되면 즉시 연결을 해제하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
