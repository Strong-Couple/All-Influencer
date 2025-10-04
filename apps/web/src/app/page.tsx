'use client';

import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, Star, Zap, BarChart3, Target, Award, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

// 카운터 애니메이션 컴포넌트
function Counter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-75"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-150"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
              🎉 새로운 인플루언서 플랫폼 출시!
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              최고의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">인플루언서</span>들과<br />
              브랜드를 연결하는 플랫폼
            </h1>
            <p className="text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              All Influencer와 함께 성공적인 인플루언서 마케팅을 시작하세요.
              AI 기반 매칭으로 검증된 인플루언서들과 브랜드를 완벽하게 연결해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                구인공고 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/users"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                인플루언서 둘러보기
                <Users className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">왜 All Influencer인가?</h2>
            <p className="text-lg text-gray-600">
              검증된 인플루언서와 브랜드 매칭부터 캠페인 관리까지, 
              모든 것을 한 곳에서 해결하세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Influencers Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">인기 인플루언서</h2>
            <p className="text-lg text-gray-600">
              높은 평점과 성과를 가진 검증된 인플루언서들을 만나보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredInfluencers.map((influencer, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                    {influencer.name[0]}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{influencer.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{influencer.category}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">팔로워</span>
                      <span className="font-semibold">{influencer.followers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">참여율</span>
                      <span className="font-semibold text-green-600">{influencer.engagement}</span>
                    </div>
                    <div className="flex items-center justify-center mt-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-semibold">{influencer.rating}</span>
                        <span className="text-gray-500 text-xs ml-1">({influencer.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/users"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              더 많은 인플루언서 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">최신 구인공고</h2>
            <p className="text-lg text-gray-600">
              브랜드들이 새롭게 올린 매력적인 협업 기회들
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestJobs.map((job, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    모집중
                  </span>
                  <span className="text-sm text-gray-500">{job.postedDate}</span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{job.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">회사</span>
                    <span className="font-semibold">{job.company}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">예산</span>
                    <span className="font-semibold text-green-600">{job.budget}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  자세히 보기
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/jobs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              모든 공고 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">지금 시작해보세요</h2>
          <p className="text-xl mb-8 text-blue-100">
            수천 명의 검증된 인플루언서들과 브랜드들이 기다리고 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              인플루언서로 가입하기
              <Users className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/jobs"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              구인공고 등록하기
              <Target className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-semibold mb-2">All Influencer</h3>
          <p className="text-sm text-gray-400">
            © 2024 All Influencer. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: 2500, suffix: '+', label: '활성 인플루언서' },
  { value: 850, suffix: '+', label: '브랜드 파트너' },
  { value: 15000, suffix: '+', label: '완료된 캠페인' },
  { value: 98, suffix: '%', label: '성공률' },
];

const features = [
  {
    icon: Users,
    title: '검증된 인플루언서',
    description: '엄격한 심사를 통과한 양질의 인플루언서들만 선별합니다.',
  },
  {
    icon: TrendingUp,
    title: '데이터 기반 매칭',
    description: '브랜드와 인플루언서의 완벽한 매칭을 위한 AI 알고리즘을 제공합니다.',
  },
  {
    icon: Star,
    title: '품질 보장',
    description: '모든 캠페인에 대해 품질을 보장하고 성과를 추적합니다.',
  },
  {
    icon: Zap,
    title: '빠른 실행',
    description: '캠페인 기획부터 실행까지 빠르고 효율적으로 진행합니다.',
  },
];

const featuredInfluencers = [
  {
    name: '김미영',
    category: '뷰티 & 라이프스타일',
    followers: '125K',
    engagement: '4.8%',
    rating: 4.9,
    reviews: 127
  },
  {
    name: '박준호',
    category: '테크 & 게임',
    followers: '89K',
    engagement: '6.2%',
    rating: 4.8,
    reviews: 94
  },
  {
    name: '이소희',
    category: '패션 & 스타일',
    followers: '156K',
    engagement: '5.1%',
    rating: 4.9,
    reviews: 203
  },
  {
    name: '최우진',
    category: '피트니스 & 건강',
    followers: '78K',
    engagement: '7.3%',
    rating: 4.7,
    reviews: 156
  }
];

const latestJobs = [
  {
    title: '신제품 스킨케어 라인 런칭 캠페인',
    description: '새로 출시되는 프리미엄 스킨케어 제품군을 소개할 뷰티 인플루언서를 모집합니다. 자연 성분과 혁신적인 기술이 결합된 제품을 체험하고 솔직한 리뷰를 작성해주실 분을 찾습니다.',
    company: 'BeautyLab Korea',
    budget: '₩1,200,000',
    postedDate: '1일 전',
    tags: ['뷰티', '스킨케어', '인스타그램', '유튜브']
  },
  {
    title: '홈카페 브랜드 제품 협업 인플루언서',
    description: '프리미엄 원두와 커피 용품을 체험하고 홈카페 콘텐츠를 제작해주실 라이프스타일 인플루언서를 모집합니다. 제품 제공 및 협업비 지급.',
    company: '카페올레 스튜디오',
    budget: '₩800,000',
    postedDate: '2일 전',
    tags: ['라이프스타일', '홈카페', '인스타그램']
  },
  {
    title: '피트니스 웨어 신규 라인 모델링',
    description: '활동성과 스타일을 모두 갖춘 피트니스 웨어 브랜드의 새로운 컬렉션을 소개할 피트니스 인플루언서를 찾습니다. 운동 영상 촬영 및 착용 후기 작성.',
    company: 'ActiveFit',
    budget: '₩1,500,000',
    postedDate: '3일 전',
    tags: ['피트니스', '패션', '유튜브', '인스타그램']
  }
];
