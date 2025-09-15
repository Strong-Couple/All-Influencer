const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Temp API Server is running' });
});

// 현재 사용자 정보 (로그인되지 않은 상태)
app.get('/auth/me', (req, res) => {
  // 임시로 로그인되지 않은 상태 반환
  res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'User not logged in' 
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
