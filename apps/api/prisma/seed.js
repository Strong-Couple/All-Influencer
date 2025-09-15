const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  // 기존 데이터 정리 
  console.log('📝 기존 데이터를 정리합니다...');
  await prisma.jobPost.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.influencerProfile.deleteMany();
  await prisma.advertiserCompany.deleteMany();
  await prisma.user.deleteMany();

  // 사용자 생성
  console.log('👥 사용자 데이터를 생성합니다...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@allinfluencer.com',
      username: 'admin',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqyeCHDRra3IzG3UjW6k7IS', // 'admin123' hashed
      displayName: '시스템 관리자',
      role: 'ADMIN',
      status: 'ACTIVE',
      bio: '전체 플랫폼을 관리하는 시스템 관리자입니다.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    },
  });

  const influencer1 = await prisma.user.create({
    data: {
      email: 'jenny@example.com',
      username: 'jenny_kim',
      passwordHash: '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'user123' hashed
      displayName: '제니 김',
      role: 'INFLUENCER',
      status: 'ACTIVE',
      bio: '뷰티와 라이프스타일을 다루는 인플루언서입니다.',
      website: 'https://jennykim.blog',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400',
    },
  });

  const influencer2 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      username: 'alex_fitness',
      passwordHash: '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'user123' hashed
      displayName: '알렉스 피트니스',
      role: 'INFLUENCER',
      status: 'ACTIVE',
      bio: '건강한 라이프스타일을 추구하는 피트니스 인플루언서입니다.',
      avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400',
    },
  });

  const advertiser = await prisma.user.create({
    data: {
      email: 'marketing@beautybrand.com',
      username: 'beauty_corp',
      passwordHash: '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'user123' hashed
      displayName: '뷰티 브랜드 마케팅팀',
      role: 'ADVERTISER',
      status: 'ACTIVE',
      bio: '혁신적인 뷰티 제품을 만드는 브랜드입니다.',
      website: 'https://beautybrand.com',
      avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    },
  });

  // 인플루언서 프로필 생성
  console.log('🎯 인플루언서 프로필을 생성합니다...');
  
  const profile1 = await prisma.influencerProfile.create({
    data: {
      userId: influencer1.id,
      categories: ['뷰티', '라이프스타일', '패션'],
      followers: 125000,
      avgEngagement: 4.8,
      ratePerPost: 500000,
      location: '서울, 대한민국',
      languages: ['ko', 'en'],
    },
  });

  const profile2 = await prisma.influencerProfile.create({
    data: {
      userId: influencer2.id,
      categories: ['피트니스', '헬스', '라이프스타일'],
      followers: 75000,
      avgEngagement: 3.2,
      ratePerPost: 300000,
      location: '부산, 대한민국',
      languages: ['ko'],
    },
  });

  // 채널 생성
  await prisma.channel.createMany({
    data: [
      {
        influencerProfileId: profile1.id,
        platform: 'INSTAGRAM',
        channelUrl: 'https://instagram.com/jenny_kim',
        channelHandle: '@jenny_kim',
        followers: 85000,
        avgViews: 25000,
        avgLikes: 3500,
      },
      {
        influencerProfileId: profile1.id,
        platform: 'YOUTUBE',
        channelUrl: 'https://youtube.com/c/jennykimbeauty',
        channelHandle: 'Jenny Kim Beauty',
        followers: 40000,
        avgViews: 15000,
        avgLikes: 1200,
      },
      {
        influencerProfileId: profile2.id,
        platform: 'YOUTUBE',
        channelUrl: 'https://youtube.com/c/alexfitness',
        channelHandle: 'Alex Fitness',
        followers: 50000,
        avgViews: 20000,
        avgLikes: 1500,
      },
      {
        influencerProfileId: profile2.id,
        platform: 'INSTAGRAM',
        channelUrl: 'https://instagram.com/alex_fitness',
        channelHandle: '@alex_fitness',
        followers: 25000,
        avgViews: 8000,
        avgLikes: 800,
      },
    ],
  });

  // 광고주 회사 생성
  console.log('🏢 광고주 회사를 생성합니다...');
  
  const company = await prisma.advertiserCompany.create({
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
  
  await prisma.jobPost.createMany({
    data: [
      {
        userId: advertiser.id,
        companyId: company.id,
        title: '신제품 립스틱 런칭 캠페인 인플루언서 모집',
        description: '새로 출시되는 매트 립스틱 라인을 소개할 뷰티 인플루언서를 찾습니다.',
        requirements: '뷰티 인플루언서, 팔로워 5만+, 콘텐츠 제작 경험',
        budget: 1000000,
        categories: ['뷰티', '화장품'],
        platforms: ['INSTAGRAM', 'YOUTUBE'],
        deadline: new Date('2024-12-31'),
        status: 'OPEN',
      },
      {
        userId: advertiser.id,
        companyId: company.id,
        title: '스킨케어 루틴 협업 인플루언서 모집',
        description: '건강한 피부 관리를 위한 스킨케어 라인 홍보 협업을 진행할 인플루언서를 모집합니다.',
        requirements: '스킨케어 콘텐츠 경험, 20-30대 타겟',
        budget: 800000,
        categories: ['뷰티', '스킨케어', '라이프스타일'],
        platforms: ['INSTAGRAM', 'TIKTOK'],
        deadline: new Date('2024-11-30'),
        status: 'OPEN',
      },
      {
        userId: advertiser.id,
        companyId: company.id,
        title: '브랜드 앰버서더 모집 (6개월 장기 계약)',
        description: '뷰티 브랜드의 공식 앰버서더로 활동하실 인플루언서를 모집합니다.',
        requirements: '뷰티 분야 전문성, 팔로워 10만+, 브랜드 가치 부합',
        budget: 3000000,
        categories: ['뷰티', '브랜드 앰버서더'],
        platforms: ['INSTAGRAM', 'YOUTUBE', 'TIKTOK'],
        deadline: new Date('2024-10-15'),
        status: 'OPEN',
      },
    ],
  });

  console.log('✅ 시드 데이터 생성이 완료되었습니다!');
  console.log('📊 생성된 데이터:');
  console.log('   - 사용자: 4명 (관리자 1, 인플루언서 2, 광고주 1)');
  console.log('   - 인플루언서 프로필: 2개');
  console.log('   - 광고주 회사: 1개');
  console.log('   - 구인 공고: 3개');
  console.log('   - 채널: 4개');
  console.log('');
  console.log('🔑 로그인 정보:');
  console.log('   관리자: admin@allinfluencer.com / admin123');
  console.log('   인플루언서: jenny@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류가 발생했습니다:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

