'use client';

import { useState, useEffect } from 'react';
// import { apiClient } from '../lib/api-client'; // 임시 비활성화

export default function JobPostsPage() {
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 임시 데모 데이터
    setTimeout(() => {
      setJobPosts([
        {
          id: '1',
          title: '신제품 립스틱 런칭 캠페인 인플루언서 모집',
          description: '새로 출시되는 매트 립스틱 라인을 소개할 뷰티 인플루언서를 찾습니다.',
          budget: 1000000,
          categories: ['뷰티', '화장품'],
          platforms: ['INSTAGRAM', 'YOUTUBE'],
          status: 'OPEN',
          company: { companyName: '뷰티 브랜드 코리아' },
          createdAt: '2024-01-15',
          deadline: '2024-12-31'
        },
        {
          id: '2', 
          title: '스킨케어 루틴 협업 인플루언서 모집',
          description: '건강한 피부 관리를 위한 스킨케어 라인 홍보 협업을 진행할 인플루언서를 모집합니다.',
          budget: 800000,
          categories: ['뷰티', '스킨케어'],
          platforms: ['INSTAGRAM', 'TIKTOK'],
          status: 'OPEN',
          company: { companyName: '뷰티 브랜드 코리아' },
          createdAt: '2024-01-10',
          deadline: '2024-11-30'
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">구인 공고</h1>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">구인 공고</h1>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">구인 공고</h1>
          <p className="mt-2 text-lg text-gray-600">
            브랜드들이 올린 최신 협업 공고를 확인해보세요
          </p>
        </div>

        {jobPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 구인 공고가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobPosts.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    job.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status === 'OPEN' ? '모집중' :
                     job.status === 'CLOSED' ? '모집완료' : '검토중'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {job.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {job.description}
                </p>

                <div className="space-y-2 mb-4">
                  {job.company && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">회사:</span>
                      <span className="ml-1">{job.company.companyName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">예산:</span>
                    <span className="ml-1 font-semibold text-green-600">
                      {job.budget?.toLocaleString()}원
                    </span>
                  </div>

                  {job.deadline && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">마감일:</span>
                      <span className="ml-1">
                        {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {job.categories && job.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.categories.map((category: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  {job.platforms && job.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.platforms.map((platform: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                    지원하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 간단한 페이지네이션 */}
        {jobPosts.length > 0 && (
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