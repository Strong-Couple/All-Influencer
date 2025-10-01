const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 임시 사용자 데이터 저장소
let users = new Map();
let currentUserId = 1;

// JWT 토큰 시뮬레이션을 위한 유틸리티
function generateToken(userId) {
  return `temp_token_${userId}_${Date.now()}`;
}

function verifyToken(token) {
  if (!token || !token.startsWith('temp_token_')) return null;
  const parts = token.split('_');
  const userId = parts[2];
  return users.get(userId);
}

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Temp API Server is running' });
});

// 현재 사용자 정보
app.get('/auth/me', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'User not logged in' 
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid token' 
    });
  }

  res.json({ 
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatar: user.avatar,
    }
  });
});

// Local Auth 회원가입
app.post('/auth/local/signup', (req, res) => {
  const { email, password, displayName, role } = req.body;
  
  // 유효성 검사
  if (!email || !password || !displayName || !role) {
    return res.status(400).json({ 
      success: false, 
      message: '모든 필드를 입력해주세요.' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: '비밀번호는 최소 6자 이상이어야 합니다.' 
    });
  }

  // 이메일 중복 검사
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      message: '이미 가입된 이메일입니다.' 
    });
  }

  // 새 사용자 생성
  const userId = String(currentUserId++);
  const newUser = {
    id: userId,
    email,
    password: `hashed_${password}`, // 실제로는 bcrypt 해시
    displayName,
    role,
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  users.set(userId, newUser);
  console.log(`✅ New user registered: ${email} (${role})`);

  // 로그인 토큰 생성 및 쿠키 설정
  const token = generateToken(userId);
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: false, // 개발 환경
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15분
  });

  res.status(201).json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    user: {
      id: userId,
      email,
      displayName,
      role,
    }
  });
});

// Local Auth 로그인
app.post('/auth/local/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '이메일과 비밀번호를 입력해주세요.' 
    });
  }

  // 사용자 찾기
  const user = Array.from(users.values()).find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
    });
  }

  // 비밀번호 확인 (실제로는 bcrypt 비교)
  if (user.password !== `hashed_${password}`) {
    return res.status(401).json({ 
      success: false, 
      message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
    });
  }

  console.log(`✅ User logged in: ${email}`);

  // 로그인 토큰 생성 및 쿠키 설정
  const token = generateToken(user.id);
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: false, // 개발 환경
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15분
  });

  res.json({
    success: true,
    message: '로그인되었습니다.',
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatar: user.avatar,
    }
  });
});

// OAuth 로그인 시작점들 (임시 응답)
app.get('/auth/google', (req, res) => {
  res.json({ message: 'Google OAuth not configured yet' });
});

app.get('/auth/kakao', (req, res) => {
  res.json({ message: 'Kakao OAuth not configured yet' });
});

app.get('/auth/naver', (req, res) => {
  res.json({ message: 'Naver OAuth not configured yet' });
});

// 로그아웃
app.post('/auth/logout', (req, res) => {
  res.clearCookie('access_token');
  res.json({ success: true, message: 'Logged out' });
});

// 사용자 목록 (임시 데이터)
app.get('/users', (req, res) => {
  res.json({
    users: [
      { id: '1', name: '데모 인플루언서 1', role: 'INFLUENCER' },
      { id: '2', name: '데모 인플루언서 2', role: 'INFLUENCER' },
      { id: '3', name: '데모 광고주 1', role: 'ADVERTISER' }
    ],
    total: 3
  });
});

// 인플루언서 마이페이지 - 개요
app.get('/my/influencer/overview', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'INFLUENCER') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    profile: {
      headline: '테크 리뷰 전문 인플루언서입니다',
      totalFollowers: 125000,
      avgEngagement: 5.2,
      ratePerPost: 500000,
      channelCount: 3,
    },
    applications: {
      total: 12,
      pending: 3,
      accepted: 5,
      rejected: 4,
      withdrawn: 0,
    },
    scrapCount: 8,
    stats: {
      completedContracts: 15,
      avgRating: 4.8,
    },
  });
});

// 인플루언서 마이페이지 - 이력서 조회
app.get('/my/influencer/resume', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'INFLUENCER') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    headline: '테크 리뷰 전문 인플루언서입니다',
    bio: '안녕하세요! 5년간 테크 리뷰를 해온 인플루언서입니다. 주로 스마트폰, 노트북, 가전제품 등을 다루며, IT 트렌드에 관심이 많습니다.',
    skills: ['스마트폰', '노트북', '가전제품', 'IT 트렌드', '언박싱'],
    portfolioUrls: ['https://youtube.com/@techreview', 'https://instagram.com/techreview'],
    resumeJson: {
      education: [
        { school: '서울대학교', major: '컴퓨터과학과', degree: '학사', year: '2020' }
      ],
      career: [
        { company: 'Tech회사', position: '마케터', period: '2020-2022' }
      ],
    },
    categories: ['테크', '리뷰'],
    location: '서울',
    languages: ['ko', 'en'],
    ratePerPost: 500000,
    updatedAt: new Date().toISOString(),
  });
});

// 인플루언서 마이페이지 - 이력서 수정
app.put('/my/influencer/resume', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'INFLUENCER') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  console.log(`✅ Resume updated for user: ${user.email}`, req.body);

  res.json({
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
});

// 사업자 마이페이지 - 개요
app.get('/my/advertiser/overview', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'ADVERTISER') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    company: {
      name: 'Demo 브랜드',
      industry: '뷰티',
      description: '혁신적인 뷰티 제품을 만드는 회사입니다.',
    },
    jobPosts: {
      total: 8,
      open: 3,
      closed: 2,
      completed: 2,
      cancelled: 1,
    },
    recentStats: {
      recentApplications: 15,
      activeContracts: 3,
      avgRating: 4.6,
    },
  });
});

// 구인공고 목록 (임시 데이터)
app.get('/job-posts', (req, res) => {
  res.json({
    jobPosts: [
      { id: '1', title: '뷰티 제품 홍보', company: '뷰티브랜드A' },
      { id: '2', title: '패션 아이템 리뷰', company: '패션브랜드B' },
      { id: '3', title: 'IT 제품 언박싱', company: 'IT회사C' }
    ],
    total: 3
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.originalUrl} not found` 
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: 'Something went wrong!' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Temp API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/auth/me`);
});
