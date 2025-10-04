'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function JobPostsPage() {
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [cardJobs, setCardJobs] = useState<any[]>([]);
  const [listJobs, setListJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 임시 데모 데이터 - 구조 개선
    setTimeout(() => {
      // 스와이프 슬라이드용 프리미엄/광고 공고
      setFeaturedJobs([
        {
          id: 'featured-1',
          title: '🌟 프리미엄 뷰티 브랜드 글로벌 캠페인',
          description: '세계적인 뷰티 브랜드와 함께하는 독점 협업! 매력적인 보상과 글로벌 노출 기회를 놓치지 마세요.',
          budget: 5000000,
          categories: ['뷰티', '프리미엄', '글로벌'],
          platforms: ['INSTAGRAM', 'YOUTUBE', 'TIKTOK'],
          status: 'FEATURED',
          company: { companyName: '글로벌 뷰티 컴퍼니', logo: '🏆' },
          createdAt: '2024-01-20',
          deadline: '2024-12-15',
          type: 'featured',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop',
          urgent: true,
          applicants: 45
        },
        {
          id: 'featured-2',
          title: '💎 럭셔리 패션 브랜드 시즌 컬렉션',
          description: '최신 컬렉션 런칭을 위한 패션 인플루언서 모집. 높은 수수료와 제품 제공!',
          budget: 3500000,
          categories: ['패션', '럭셔리', '컬렉션'],
          platforms: ['INSTAGRAM', 'YOUTUBE'],
          status: 'FEATURED',
          company: { companyName: '럭셔리 패션 하우스', logo: '👗' },
          createdAt: '2024-01-18',
          deadline: '2024-11-30',
          type: 'featured',
          image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=200&fit=crop',
          urgent: false,
          applicants: 32
        },
        {
          id: 'featured-3',
          title: '🚗 자동차 브랜드 신차 런칭',
          description: '혁신적인 전기차 브랜드의 신차 출시 캠페인. 독점 시승 기회와 함께!',
          budget: 8000000,
          categories: ['자동차', '테크', '친환경'],
          platforms: ['YOUTUBE', 'INSTAGRAM'],
          status: 'FEATURED',
          company: { companyName: '이코 모터스', logo: '⚡' },
          createdAt: '2024-01-22',
          deadline: '2024-12-31',
          type: 'featured',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop',
          urgent: true,
          applicants: 18
        }
      ]);

      // 일반 카드형 공고
      setCardJobs([
        {
          id: 'card-1',
          title: '신제품 립스틱 런칭 캠페인 인플루언서 모집',
          description: '새로 출시되는 매트 립스틱 라인을 소개할 뷰티 인플루언서를 찾습니다.',
          budget: 1000000,
          categories: ['뷰티', '화장품'],
          platforms: ['INSTAGRAM', 'YOUTUBE'],
          status: 'OPEN',
          company: { companyName: '뷰티 브랜드 코리아' },
          createdAt: '2024-01-15',
          deadline: '2024-12-31',
          type: 'card',
          applicants: 12
        },
        {
          id: 'card-2',
          title: '스킨케어 루틴 협업 인플루언서 모집',
          description: '건강한 피부 관리를 위한 스킨케어 라인 홍보 협업을 진행할 인플루언서를 모집합니다.',
          budget: 800000,
          categories: ['뷰티', '스킨케어'],
          platforms: ['INSTAGRAM', 'TIKTOK'],
          status: 'OPEN',
          company: { companyName: '헬시 스킨 코리아' },
          createdAt: '2024-01-10',
          deadline: '2024-11-30',
          type: 'card',
          applicants: 8
        },
        {
          id: 'card-3',
          title: '홈카페 브랜드 제품 체험 리뷰',
          description: '프리미엄 원두와 커피 용품을 체험하고 솔직한 리뷰를 작성해주실 분을 모집합니다.',
          budget: 600000,
          categories: ['라이프스타일', '카페', 'F&B'],
          platforms: ['INSTAGRAM', 'YOUTUBE'],
          status: 'OPEN',
          company: { companyName: '홈카페 브랜드' },
          createdAt: '2024-01-08',
          deadline: '2024-11-15',
          type: 'card',
          applicants: 25
        },
        {
          id: 'card-4',
          title: '피트니스 웨어 브랜드 협업',
          description: '운동복과 운동 용품 협업을 통한 건강한 라이프스타일 컨텐츠 제작',
          budget: 1200000,
          categories: ['피트니스', '건강', '라이프스타일'],
          platforms: ['INSTAGRAM', 'TIKTOK'],
          status: 'OPEN',
          company: { companyName: '액티브 라이프' },
          createdAt: '2024-01-12',
          deadline: '2024-12-20',
          type: 'card',
          applicants: 15
        }
      ]);

      // 리스트형 공고들
      setListJobs([
        {
          id: 'list-1',
          title: '반려동물 용품 브랜드 제품 리뷰',
          company: { companyName: '펫케어 플러스' },
          budget: 400000,
          categories: ['반려동물', '라이프스타일'],
          status: 'OPEN',
          deadline: '2024-11-10',
          applicants: 6
        },
        {
          id: 'list-2', 
          title: '모바일 게임 신규 출시 홍보',
          company: { companyName: '게임랩 스튜디오' },
          budget: 700000,
          categories: ['게임', '엔터테인먼트'],
          status: 'OPEN',
          deadline: '2024-12-05',
          applicants: 22
        },
        {
          id: 'list-3',
          title: '온라인 교육 플랫폼 체험 후기',
          company: { companyName: '스마트 러닝' },
          budget: 500000,
          categories: ['교육', '테크'],
          status: 'OPEN', 
          deadline: '2024-11-25',
          applicants: 9
        },
        {
          id: 'list-4',
          title: '친환경 생활용품 브랜드 협업',
          company: { companyName: '그린 라이프' },
          budget: 350000,
          categories: ['친환경', '라이프스타일'],
          status: 'OPEN',
          deadline: '2024-11-20',
          applicants: 4
        },
        {
          id: 'list-5',
          title: '여행용품 브랜드 제품 체험',
          company: { companyName: '트래블 기어' },
          budget: 600000,
          categories: ['여행', '라이프스타일'],
          status: 'OPEN',
          deadline: '2024-12-10',
          applicants: 11
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [currentPage]);

  // 스와이프 슬라이드 유틸리티 함수들
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredJobs.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredJobs.length) % featuredJobs.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleFavorite = (jobId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(jobId)) {
        newFavorites.delete(jobId);
      } else {
        newFavorites.add(jobId);
      }
      return newFavorites;
    });
  };

  // 터치/스와이프 기능
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // 자동 슬라이드 (옵션)
  useEffect(() => {
    if (featuredJobs.length > 0) {
      const interval = setInterval(nextSlide, 5000); // 5초마다 자동 넘김
      return () => clearInterval(interval);
    }
  }, [featuredJobs.length]);

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
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">구인 공고</h1>
          <p className="mt-2 text-lg text-gray-600">
            브랜드들이 올린 최신 협업 공고를 확인해보세요
          </p>
        </div>

        {/* 1. 스와이프 슬라이드 섹션 - 프리미엄/광고 공고 */}
        {featuredJobs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
                프리미엄 공고
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div 
              className="relative overflow-hidden rounded-xl"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div 
                ref={sliderRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredJobs.map((job) => (
                  <div key={job.id} className="w-full flex-shrink-0">
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl overflow-hidden">
                      {/* 배경 이미지 */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${job.image})` }}
                      />
                      
                      <div className="relative p-6 md:p-8 lg:p-12 text-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{job.company.logo}</div>
                            <div>
                              <h3 className="text-2xl md:text-3xl font-bold mb-2">{job.title}</h3>
                              <p className="text-blue-100 text-lg font-medium">{job.company.companyName}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFavorite(job.id)}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                          >
                            {favorites.has(job.id) ? (
                              <HeartSolidIcon className="h-6 w-6 text-red-400" />
                            ) : (
                              <HeartIcon className="h-6 w-6 text-white" />
                            )}
                          </button>
                        </div>

                        <p className="text-blue-100 text-lg mb-6 max-w-2xl">{job.description}</p>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="space-y-2 mb-6 md:mb-0">
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-3xl font-bold text-yellow-300">
                                  {job.budget?.toLocaleString()}원
                                </span>
                                {job.urgent && (
                                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                                    긴급
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 text-blue-200">
                                <EyeIcon className="h-4 w-4" />
                                <span className="text-sm">{job.applicants}명 지원</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {job.categories.map((category: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
                            지금 지원하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 인디케이터 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featuredJobs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 카드형 공고 섹션 */}
        {cardJobs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 공고</h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {cardJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        job.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.status === 'OPEN' ? '모집중' :
                         job.status === 'CLOSED' ? '모집완료' : '검토중'}
                      </span>
                      <button
                        onClick={() => toggleFavorite(job.id)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {favorites.has(job.id) ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {job.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{job.company.companyName}</span>
                        <span className="font-semibold text-green-600">
                          {job.budget?.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{new Date(job.deadline).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{job.applicants}명</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-1">
                        {job.categories.slice(0, 2).map((category: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {category}
                          </span>
                        ))}
                        {job.categories.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            +{job.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                      지원하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 리스트형 공고 섹션 */}
        {listJobs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">일반 공고</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {listJobs.map((job, index) => (
                <div key={job.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                  index !== listJobs.length - 1 ? 'border-b border-gray-200' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {job.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status === 'OPEN' ? '모집중' : '마감'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{job.company.companyName}</span>
                        <span>{job.budget?.toLocaleString()}원</span>
                        <span>마감: {new Date(job.deadline).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{job.applicants}명 지원</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.categories.map((category: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() => toggleFavorite(job.id)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {favorites.has(job.id) ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                        지원하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-center">
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
      </div>
    </div>
  );
}