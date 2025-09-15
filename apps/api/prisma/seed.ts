import { PrismaClient, UserRole, UserStatus, JobPostStatus, Platform } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  // 기존 데이터 정리 (개발환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('📝 기존 데이터를 정리합니다...');
    await prisma.jobPost.deleteMany();
    await prisma.influencerProfile.deleteMany();
    await prisma.advertiserCompany.deleteMany();
    await prisma.user.deleteMany();
  }

  // 사용자 생성
  console.log('👥 사용자 데이터를 생성합니다...');
  
  // 공통 비밀번호 해시 생성
  const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  const userPasswordHash = await bcrypt.hash('user123', SALT_ROUNDS);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@allinfluencer.com',
      username: 'admin',
      passwordHash: adminPasswordHash,
      displayName: '시스템 관리자',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      bio: '전체 플랫폼을 관리하는 시스템 관리자입니다.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    },
  });

  const influencer = await prisma.user.create({
    data: {
      email: 'jenny@example.com',
      username: 'jenny_kim',
      passwordHash: userPasswordHash,
      displayName: '제니 김',
      role: UserRole.INFLUENCER,
      status: UserStatus.ACTIVE,
      bio: '뷰티와 라이프스타일을 다루는 인플루언서입니다. 진정성 있는 콘텐츠로 소통하겠습니다!',
      website: 'https://jennykim.blog',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400',
    },
  });

  const advertiser = await prisma.user.create({
    data: {
      email: 'marketing@beautybrand.com',
      username: 'beauty_corp',
      passwordHash: userPasswordHash,
      displayName: '뷰티 브랜드 마케팅팀',
      role: UserRole.ADVERTISER,
      status: UserStatus.ACTIVE,
      bio: '혁신적인 뷰티 제품을 만드는 브랜드입니다.',
      website: 'https://beautybrand.com',
      avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    },
  });

  // 추가 인플루언서들 생성
  const moreInfluencers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        username: 'alex_fitness',
        passwordHash: userPasswordHash,
        displayName: '알렉스 피트니스',
        role: UserRole.INFLUENCER,
        status: UserStatus.ACTIVE,
        bio: '건강한 라이프스타일을 추구하는 피트니스 인플루언서입니다.',
        avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah@example.com',
        username: 'sarah_food',
        passwordHash: userPasswordHash,
        displayName: '사라의 맛집 탐방',
        role: UserRole.INFLUENCER,
        status: UserStatus.ACTIVE,
        bio: '전국 맛집을 찾아다니며 리뷰하는 푸드 인플루언서입니다.',
        website: 'https://sarahfood.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        username: 'mike_tech',
        passwordHash: userPasswordHash,
        displayName: '마이크의 테크 리뷰',
        role: UserRole.INFLUENCER,
        status: UserStatus.ACTIVE,
        bio: '최신 IT 제품을 리뷰하는 테크 인플루언서입니다.',
        website: 'https://miketech.blog',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      },
    }),
  ]);

  // 인플루언서 프로필 생성
  console.log('🎯 인플루언서 프로필을 생성합니다...');
  
  const influencerProfile = await prisma.influencerProfile.create({
    data: {
      userId: influencer.id,
      categories: ['뷰티', '라이프스타일', '패션'],
      followers: 125000,
      avgEngagement: 4.8,
      ratePerPost: 500000,
      location: '서울, 대한민국',
      languages: ['ko', 'en'],
      channels: {
        create: [
          {
            platform: Platform.INSTAGRAM,
            channelUrl: 'https://instagram.com/jenny_kim',
            channelHandle: '@jenny_kim',
            followers: 85000,
            avgViews: 25000,
            avgLikes: 3500,
          },
          {
            platform: Platform.YOUTUBE,
            channelUrl: 'https://youtube.com/c/jennykimbeauty',
            channelHandle: 'Jenny Kim Beauty',
            followers: 40000,
            avgViews: 15000,
            avgLikes: 1200,
          },
        ],
      },
    },
  });

  // 광고주 회사 생성
  console.log('🏢 광고주 회사를 생성합니다...');
  
  const advertiserCompany = await prisma.advertiserCompany.create({
    data: {
      userId: advertiser.id,
      companyName: '뷰티 브랜드 코리아',
      industry: '화장품/뷰티',
      description: '자연 친화적인 성분으로 만든 프리미엄 화장품 브랜드입니다.',
      website: 'https://beautybrand.co.kr',
      location: '서울시 강남구',
    },
  });

  // 구인 공고 생성
  console.log('📋 구인 공고를 생성합니다...');
  
  const jobPosts = await Promise.all([
    prisma.jobPost.create({
      data: {
        userId: advertiser.id,
        companyId: advertiserCompany.id,
        title: '신제품 립스틱 런칭 캠페인 인플루언서 모집',
        description: `새로 출시되는 매트 립스틱 라인을 소개할 뷰티 인플루언서를 찾습니다.
        
        📝 업무 내용:
        - 제품 언박싱 및 리뷰 영상/포스트 제작
        - 착용 후기 및 스와치 콘텐츠
        - 라이브 방송을 통한 제품 소개 (선택사항)
        
        🎯 선호 조건:
        - 뷰티 관련 콘텐츠 경험 1년 이상
        - 인스타그램 팔로워 5만명 이상
        - 진정성 있는 리뷰 스타일`,
        requirements: '뷰티 인플루언서, 팔로워 5만+, 콘텐츠 제작 경험',
        budget: 1000000,
        categories: ['뷰티', '화장품'],
        platforms: [Platform.INSTAGRAM, Platform.YOUTUBE],
        deadline: new Date('2024-12-31'),
        status: JobPostStatus.OPEN,
      },
    }),
    
    prisma.jobPost.create({
      data: {
        userId: advertiser.id,
        companyId: advertiserCompany.id,
        title: '스킨케어 루틴 협업 인플루언서 모집',
        description: `건강한 피부 관리를 위한 스킨케어 라인 홍보 협업을 진행할 인플루언서를 모집합니다.
        
        📝 업무 내용:
        - 4주간 제품 사용 후 솔직한 후기
        - Before/After 사진 및 영상 콘텐츠
        - 개인 스킨케어 루틴에 제품 활용법 소개
        
        💰 혜택:
        - 제품 무상 제공
        - 우수 콘텐츠 제작시 추가 보상
        - 장기 브랜드 앰버서더 기회`,
        requirements: '스킨케어 콘텐츠 경험, 20-30대 타겟',
        budget: 800000,
        categories: ['뷰티', '스킨케어', '라이프스타일'],
        platforms: [Platform.INSTAGRAM, Platform.TIKTOK],
        deadline: new Date('2024-11-30'),
        status: JobPostStatus.OPEN,
      },
    }),
    
    prisma.jobPost.create({
      data: {
        userId: advertiser.id,
        companyId: advertiserCompany.id,
        title: '브랜드 앰버서더 모집 (6개월 장기 계약)',
        description: `뷰티 브랜드의 공식 앰버서더로 활동하실 인플루언서를 모집합니다.
        
        📅 계약 기간: 6개월
        📝 주요 업무:
        - 월 4회 이상 브랜드 관련 콘텐츠 제작
        - 신제품 사전 체험 및 리뷰
        - 브랜드 이벤트 참석 및 홍보
        - 팔로워와의 소통을 통한 브랜드 가치 전달
        
        🎁 혜택:
        - 월 정기 페이
        - 모든 신제품 무상 제공
        - 브랜드 이벤트 초대
        - 계약 갱신시 조건 우대`,
        requirements: '뷰티 분야 전문성, 팔로워 10만+, 브랜드 가치 부합',
        budget: 3000000,
        categories: ['뷰티', '브랜드 앰버서더'],
        platforms: [Platform.INSTAGRAM, Platform.YOUTUBE, Platform.TIKTOK],
        deadline: new Date('2024-10-15'),
        status: JobPostStatus.OPEN,
      },
    }),
    
    prisma.jobPost.create({
      data: {
        userId: advertiser.id,
        title: '라이프스타일 콘텐츠 협업 (일상 속 뷰티 팁)',
        description: `바쁜 일상 속에서도 쉽게 따라할 수 있는 뷰티 팁을 소개할 라이프스타일 인플루언서를 찾습니다.
        
        🎯 콘텐츠 방향:
        - 출근길 5분 메이크업
        - 집에서 간단한 셀프케어
        - 계절별 스킨케어 팁
        - 직장인 뷰티 아이템 추천
        
        👥 타겟:
        - 20-40대 직장 여성
        - 실용적인 뷰티 정보 선호층`,
        requirements: '라이프스타일 콘텐츠 경험, 직장인 타겟 소통 가능',
        budget: 600000,
        categories: ['라이프스타일', '뷰티', '직장인'],
        platforms: [Platform.INSTAGRAM, Platform.BLOG],
        deadline: new Date('2025-01-31'),
        status: JobPostStatus.OPEN,
      },
    }),
    
    prisma.jobPost.create({
      data: {
        userId: advertiser.id,
        companyId: advertiserCompany.id,
        title: '여름 시즌 선케어 제품 리뷰어 모집',
        description: `무더운 여름을 대비한 선케어 제품 라인업 리뷰를 진행할 인플루언서를 모집합니다.
        
        🌞 제품 라인업:
        - 데일리 선크림 (SPF50+/PA++++)
        - 쿨링 선크림
        - 톤업 선크림
        - 스틱형 선크림
        
        📝 리뷰 포인트:
        - 발림성 및 보습력
        - 백탁 현상 여부
        - 지속력 테스트
        - 피부 타입별 추천`,
        requirements: '선케어 제품 리뷰 경험, 여름철 콘텐츠 제작 가능',
        budget: 700000,
        categories: ['뷰티', '선케어', '여름'],
        platforms: [Platform.INSTAGRAM, Platform.YOUTUBE],
        deadline: new Date('2024-05-31'),
        status: JobPostStatus.CLOSED,
      },
    }),
  ]);

  // 추가 인플루언서 프로필 생성
  console.log('🎯 추가 인플루언서 프로필을 생성합니다...');
  
  await Promise.all([
    prisma.influencerProfile.create({
      data: {
        userId: moreInfluencers[0].id, // Alex Fitness
        categories: ['피트니스', '헬스', '라이프스타일'],
        followers: 75000,
        avgEngagement: 3.2,
        ratePerPost: 300000,
        location: '부산, 대한민국',
        languages: ['ko'],
        channels: {
          create: [
            {
              platform: Platform.YOUTUBE,
              channelUrl: 'https://youtube.com/c/alexfitness',
              channelHandle: 'Alex Fitness',
              followers: 50000,
              avgViews: 20000,
              avgLikes: 1500,
            },
            {
              platform: Platform.INSTAGRAM,
              channelUrl: 'https://instagram.com/alex_fitness',
              channelHandle: '@alex_fitness',
              followers: 25000,
              avgViews: 8000,
              avgLikes: 800,
            },
          ],
        },
      },
    }),
    prisma.influencerProfile.create({
      data: {
        userId: moreInfluencers[1].id, // Sarah Food
        categories: ['음식', '맛집', '요리', '라이프스타일'],
        followers: 120000,
        avgEngagement: 4.1,
        ratePerPost: 600000,
        location: '서울, 대한민국',
        languages: ['ko', 'en'],
        channels: {
          create: [
            {
              platform: Platform.INSTAGRAM,
              channelUrl: 'https://instagram.com/sarah_food',
              channelHandle: '@sarah_food',
              followers: 95000,
              avgViews: 30000,
              avgLikes: 4000,
            },
            {
              platform: Platform.BLOG,
              channelUrl: 'https://sarahfood.com',
              channelHandle: '사라의 맛집 탐방',
              followers: 25000,
              avgViews: 5000,
              avgLikes: 200,
            },
          ],
        },
      },
    }),
    prisma.influencerProfile.create({
      data: {
        userId: moreInfluencers[2].id, // Mike Tech
        categories: ['기술', 'IT', '제품리뷰', '가젯'],
        followers: 200000,
        avgEngagement: 3.8,
        ratePerPost: 800000,
        location: '서울, 대한민국',
        languages: ['ko', 'en'],
        channels: {
          create: [
            {
              platform: Platform.YOUTUBE,
              channelUrl: 'https://youtube.com/c/miketech',
              channelHandle: 'Mike Tech Reviews',
              followers: 150000,
              avgViews: 50000,
              avgLikes: 3000,
            },
            {
              platform: Platform.BLOG,
              channelUrl: 'https://miketech.blog',
              channelHandle: '마이크의 테크 리뷰',
              followers: 50000,
              avgViews: 10000,
              avgLikes: 300,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ 시드 데이터 생성이 완료되었습니다!');
  console.log('📊 생성된 데이터:');
  console.log(`   - 사용자: 6명 (관리자 1, 인플루언서 4, 광고주 1)`);
  console.log(`   - 인플루언서 프로필: 4개`);
  console.log(`   - 광고주 회사: 1개`);
  console.log(`   - 구인 공고: ${jobPosts.length}개`);
  console.log(`   - 채널: 8개 (다양한 플랫폼)`);
  console.log('');
  console.log('🔑 로그인 정보:');
  console.log('   관리자: admin@allinfluencer.com / admin123');
  console.log('   일반 사용자: jenny@example.com (또는 다른 이메일) / user123');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류가 발생했습니다:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
