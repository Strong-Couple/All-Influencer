/**
 * admin1 (INFLUENCER)와 admin (ADVERTISER) 사용자 추가 스크립트
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('사용자 추가 시작...');

  // admin1 - 구직 사용자 (INFLUENCER)
  const admin1PasswordHash = await bcrypt.hash('admin1', 12);
  
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin1@example.com' },
    update: {
      username: 'admin1',
      passwordHash: admin1PasswordHash,
      displayName: 'Admin1 구직자',
      role: UserRole.INFLUENCER,
      status: 'ACTIVE',
      bio: '구직 중인 인플루언서입니다.',
    },
    create: {
      email: 'admin1@example.com',
      username: 'admin1',
      passwordHash: admin1PasswordHash,
      displayName: 'Admin1 구직자',
      role: UserRole.INFLUENCER,
      status: 'ACTIVE',
      bio: '구직 중인 인플루언서입니다.',
      influencerProfile: {
        create: {
          categories: ['뷰티', '라이프스타일'],
          followers: 50000,
          avgEngagement: 5.5,
          ratePerPost: 500000,
          headline: '뷰티 & 라이프스타일 인플루언서',
          bio: '일상 속 뷰티와 라이프스타일을 공유합니다.',
          skills: ['메이크업', '스킨케어', '패션'],
          location: '서울',
        },
      },
    },
  });

  console.log('✅ admin1 (INFLUENCER) 생성 완료:', admin1.id);

  // admin - 기업 사용자 (ADVERTISER)
  const adminPasswordHash = await bcrypt.hash('admin', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      displayName: 'Admin 기업',
      role: UserRole.ADVERTISER,
      status: 'ACTIVE',
      bio: '기업 광고주입니다.',
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPasswordHash,
      displayName: 'Admin 기업',
      role: UserRole.ADVERTISER,
      status: 'ACTIVE',
      bio: '기업 광고주입니다.',
      advertiserCompany: {
        create: {
          companyName: 'Admin 기업',
          industry: 'IT/기술',
          description: '혁신적인 기술 기업입니다.',
          website: 'https://admin.example.com',
          location: '서울',
        },
      },
    },
  });

  console.log('✅ admin (ADVERTISER) 생성 완료:', admin.id);
  console.log('\n📋 사용자 정보:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. admin1 (구직자)');
  console.log('   이메일: admin1@example.com');
  console.log('   비밀번호: admin1');
  console.log('   역할: INFLUENCER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. admin (기업)');
  console.log('   이메일: admin@example.com');
  console.log('   비밀번호: admin');
  console.log('   역할: ADVERTISER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

