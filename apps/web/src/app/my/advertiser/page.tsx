import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Star, 
  PlusCircle,
  Eye,
  Calendar,
  BarChart3,
  MessageSquare
} from 'lucide-react';

async function getAdvertiserOverview() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const cookieStore = cookies();
    
    const response = await fetch(`${API_URL}/api/v1/my/advertiser/overview`, {
      headers: {
        'Cookie': cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (response.status === 401) {
      redirect('/auth/login');
    }

    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data : null;
    }

    console.error('Failed to fetch advertiser overview:', response.statusText);
    return null;
  } catch (error) {
    console.error('Error fetching advertiser overview:', error);
    return null;
  }
}

export default async function AdvertiserMyPage() {
  const overview = await getAdvertiserOverview();

  // 임시 데모 데이터 (API가 없는 경우)
  const demoOverview = {
    jobPosts: {
      total: 12,
      draft: 2,
      open: 5,
      closed: 3,
      completed: 2,
      cancelled: 0
    },
    recentStats: {
      recentApplications: 47,
      activeContracts: 8,
      avgRating: 4.6
    }
  };

  const data = overview || demoOverview;
  const { jobPosts, recentStats } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/jobs/create"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              공고 작성
            </Link>
            
            <Link
              href="/my/advertiser/job-posts"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              공고 관리
            </Link>
            
            <Link
              href="/my/advertiser/applicants"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              지원자 관리
            </Link>

            <Link
              href="/my/advertiser/analytics"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              성과 분석
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* 총 공고 수 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 공고
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobPosts.total}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 활성 공고 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      활성 공고
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobPosts.open}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 지원자 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      최근 지원자
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recentStats.recentApplications}명
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 평균 평점 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      평균 평점
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      {recentStats.avgRating.toFixed(1)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 공고 현황 & 활동 통계 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 공고 현황 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">공고 현황</h3>
              <Link 
                href="/my/advertiser/job-posts"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                전체 관리 →
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">임시보관</span>
                <span className="font-medium text-gray-600">{jobPosts.draft}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">모집중</span>
                <span className="font-medium text-green-600">{jobPosts.open}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">모집완료</span>
                <span className="font-medium text-blue-600">{jobPosts.closed}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">완료</span>
                <span className="font-medium text-purple-600">{jobPosts.completed}건</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Link 
                href="/jobs/create"
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                새 공고 작성
              </Link>
            </div>
          </div>

          {/* 활동 통계 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">활동 통계</h3>
              <Link 
                href="/my/advertiser/analytics"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                상세 분석 →
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">진행중 계약</span>
                <span className="font-medium text-green-600">{recentStats.activeContracts}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">이번달 지원자</span>
                <span className="font-medium">{recentStats.recentApplications}명</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평균 응답률</span>
                <span className="font-medium text-blue-600">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">완료율</span>
                <span className="font-medium text-purple-600">94%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 & 메시지 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 최근 공고 활동 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">최근 공고 활동</h3>
            <div className="space-y-4">
              {[
                { title: '뷰티 신제품 런칭 캠페인', applicants: 12, status: 'open', time: '2시간 전' },
                { title: '홈카페 브랜드 협업', applicants: 8, status: 'closed', time: '1일 전' },
                { title: '피트니스 웨어 모델링', applicants: 15, status: 'open', time: '3일 전' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      {activity.applicants}명 지원
                      <span className="mx-2">•</span>
                      {activity.time}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status === 'open' ? '모집중' : '모집완료'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 메시지 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">최근 메시지</h3>
              <Link 
                href="/my/advertiser/messages"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                전체 보기 →
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { name: '김미영', message: '캠페인 세부사항에 대해 문의드리고 싶습니다.', time: '30분 전', unread: true },
                { name: '박준호', message: '제안서를 보내드렸습니다. 검토 부탁드립니다.', time: '2시간 전', unread: false },
                { name: '이소희', message: '협업 가능한 날짜를 알려드릴게요.', time: '5시간 전', unread: false },
              ].map((msg, index) => (
                <div key={index} className={`flex items-start p-3 rounded-lg ${msg.unread ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                    {msg.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${msg.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {msg.name}
                      </h4>
                      <span className="text-xs text-gray-500">{msg.time}</span>
                    </div>
                    <p className={`text-sm ${msg.unread ? 'text-gray-800' : 'text-gray-600'} truncate mt-1`}>
                      {msg.message}
                    </p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
