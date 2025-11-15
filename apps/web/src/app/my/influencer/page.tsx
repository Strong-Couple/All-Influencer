import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Heart, 
  Star, 
  Award,
  Eye,
  Calendar 
} from 'lucide-react';

async function getInfluencerOverview() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const cookieStore = cookies();
    
    const response = await fetch(`${API_URL}/api/v1/my/influencer/overview`, {
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

    console.error('Failed to fetch influencer overview:', response.statusText);
    return null;
  } catch (error) {
    console.error('Error fetching influencer overview:', error);
    return null;
  }
}

export default async function InfluencerMyPage() {
  const overview = await getInfluencerOverview();

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              데이터를 불러올 수 없습니다
            </h2>
            <p className="text-red-600">
              서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { profile, applications, scrapCount, stats } = overview;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/my/influencer/resume"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              이력서 편집
            </Link>
            
            <Link
              href="/my/influencer/applications"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              지원 현황
            </Link>
            
            <Link
              href="/my/influencer/scraps"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Heart className="h-4 w-4 mr-2" />
              스크랩 관리
            </Link>

            <Link
              href="/jobs"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              공고 찾기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* 총 팔로워 수 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 팔로워
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {profile.totalFollowers.toLocaleString()}명
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 포스트당 요금 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      포스트당 요금
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {profile.ratePerPost 
                        ? `${profile.ratePerPost.toLocaleString()}원`
                        : '미설정'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 채널 수 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      연결된 채널
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {profile.channelCount}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 지원 현황 & 스크랩 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 지원 현황 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">지원 현황</h3>
              <Link 
                href="/my/influencer/applications"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                전체 보기 →
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">총 지원</span>
                <span className="font-medium">{applications.total}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">대기중</span>
                <span className="font-medium text-yellow-600">{applications.pending}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">합격</span>
                <span className="font-medium text-green-600">{applications.accepted}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">불합격</span>
                <span className="font-medium text-red-600">{applications.rejected}건</span>
              </div>
            </div>
          </div>

          {/* 스크랩 & 기타 통계 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">활동 통계</h3>
              <Link 
                href="/my/influencer/scraps"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                스크랩 관리 →
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">스크랩한 공고</span>
                <span className="font-medium">{scrapCount}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">완료된 계약</span>
                <span className="font-medium text-green-600">{stats.completedContracts}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평균 평점</span>
                <span className="font-medium flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '없음'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
