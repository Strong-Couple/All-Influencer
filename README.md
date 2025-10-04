# All-Influencer Platform

> **🚀 인플루언서와 브랜드를 연결하는 풀스택 플랫폼**  
> Next.js + NestJS + PostgreSQL + Prisma를 활용한 모노레포 아키텍처

![프로젝트 상태](https://img.shields.io/badge/상태-개발완료-brightgreen)
![기술스택](https://img.shields.io/badge/Tech_Stack-TypeScript-blue)
![라이센스](https://img.shields.io/badge/license-MIT-green)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [빠른 시작](#-빠른-시작)
- [📚 상세 문서](#-상세-문서)
- [데이터베이스 관리](#-데이터베이스-관리)
- [API 문서](#-api-문서)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)
- [문제 해결](#-문제-해결)

## 🎯 프로젝트 개요

**All-Influencer**는 인플루언서와 광고주(브랜드)를 연결하는 종합 플랫폼입니다. 

### 주요 목표
- 🤝 **효율적인 매칭**: AI 기반 인플루언서-브랜드 매칭 시스템
- 📊 **데이터 기반 의사결정**: 상세한 성과 분석 및 리포팅
- 🔒 **안전한 거래**: 스마트 컨트랙트 및 에스크로 시스템
- 🌐 **글로벌 플랫폼**: 다국가, 다언어 지원

### 타겟 사용자
- **인플루언서**: 소셜미디어 크리에이터, 블로거, 유튜버
- **광고주**: 브랜드, 마케팅 에이전시, 스타트업
- **관리자**: 플랫폼 운영 및 관리

## ✨ 주요 기능

### 🎭 사용자 관리
- [x] **OAuth 소셜 로그인**: Google, Kakao, Naver 통합 인증
- [x] **계정 통합**: 동일 이메일 기반 자동 계정 연결
- [x] **다중 사용자 역할**: 인플루언서, 광고주, 관리자
- [x] **JWT httpOnly 쿠키**: Access/Refresh 토큰, 보안 강화
- [x] **RBAC**: 역할 기반 접근 제어 시스템
- [x] **계정 연결 관리**: 여러 소셜 계정 연결/해제
- [x] **프로필 관리**: 상세 프로필, 포트폴리오, 성과 지표

### 🌐 사용자 인터페이스
- [x] **현대적인 메인페이지**: 히어로 섹션, 애니메이션 카운터, 통계
- [x] **인기 인플루언서 섹션**: 평점, 팔로워, 카테고리별 추천
- [x] **최신 구인공고 미리보기**: 브랜드별 최신 협업 기회
- [x] **고급 사용자 검색**: 실시간 필터링, 정렬, 그리드/리스트 뷰
- [x] **반응형 카드 레이아웃**: 호버 효과, 그라디언트, 애니메이션
- [x] **통계 대시보드**: 실시간 플랫폼 지표 및 인사이트

### 👤 마이페이지 시스템
- [x] **역할별 대시보드**: 인플루언서/광고주 맞춤 인터페이스
- [x] **프로필 편집**: 실시간 편집, 기술 태그, 포트폴리오 관리
- [x] **활동 통계**: 지원 현황, 스크랩, 완료 캠페인
- [x] **빠른 액션**: 이력서 편집, 공고 작성, 지원자 관리

### 💼 캠페인 관리
- [x] **구인공고 시스템**: 스와이프 슬라이드, 카드/리스트 혼합 레이아웃
- [x] **지원 및 매칭**: 자동 매칭 알고리즘, 수동 선별
- [x] **계약 관리**: 디지털 계약서, 결제 조건
- [x] **성과 추적**: 실시간 캠페인 성과 모니터링

### 🛡️ 보안 & 인프라
- [x] **OAuth 2.0**: Google, Kakao, Naver 소셜 로그인
- [x] **JWT 토큰 관리**: Access/Refresh 로테이션, 세션 관리
- [x] **암호화**: 소셜 토큰 AES 암호화 저장 (선택)
- [x] **보안 강화**: Helmet, CORS 화이트리스트, Rate Limiting
- [x] **입력 검증**: ValidationPipe, whitelist, 타입 안전성
- [x] **로깅**: Pino 기반 구조화된 로깅, Request ID 추적
- [x] **모니터링**: OpenTelemetry 준비, Health Check
- [x] **API 문서**: Swagger/OpenAPI 자동 생성, 인증 스키마

## 🛠 기술 스택

### Frontend
- **Next.js 14**: App Router, Server Components, TypeScript
- **React 18**: Hooks, Context API, Suspense
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Lucide React**: 아이콘 라이브러리

### Backend
- **NestJS**: 모듈화된 Node.js 프레임워크
- **Prisma**: Type-safe ORM, 데이터베이스 마이그레이션
- **PostgreSQL 16**: 관계형 데이터베이스
- **JWT**: JSON Web Token 인증

### DevOps & Tools
- **Docker**: 컨테이너화, 개발 환경 통일
- **Turborepo**: 모노레포 빌드 시스템
- **pnpm**: 효율적인 패키지 관리자
- **ESLint + Prettier**: 코드 품질 관리
- **Husky**: Git hooks, 커밋 전 검증

### Monitoring & Analytics
- **Pino**: 고성능 로깅
- **OpenTelemetry**: 분산 추적 (준비)
- **Prisma Studio**: 데이터베이스 GUI
- **pgAdmin**: PostgreSQL 관리 도구

## 🏗 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Shared Libs   │    │   OpenAPI       │    │   Tools         │
│   - @types      │    │   - Swagger UI  │    │   - Prisma      │
│   - @utils      │    │   - Auto SDK    │    │   - pgAdmin     │
│   - @sdk        │    │   Generation    │    │   - Studio      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 데이터 플로우
1. **사용자 요청** → Next.js (SSR/CSR)
2. **API 호출** → NestJS (RESTful API)
3. **데이터 처리** → Prisma ORM
4. **데이터 저장** → PostgreSQL
5. **실시간 업데이트** → WebSocket (예정)

## 📁 프로젝트 구조

```
All-influencer/
├── 📱 apps/
│   ├── 🌐 web/                 # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router 페이지
│   │   │   ├── components/    # 재사용 컴포넌트
│   │   │   └── lib/          # 클라이언트 라이브러리
│   │   ├── public/           # 정적 파일
│   │   └── package.json
│   └── 🔧 api/                # NestJS Backend
│       ├── src/
│       │   ├── modules/       # 비즈니스 모듈
│       │   ├── common/        # 공통 유틸리티
│       │   └── main.ts       # 애플리케이션 진입점
│       ├── prisma/           # DB 스키마 & 시드
│       └── test/             # E2E 테스트
├── 📦 packages/
│   ├── 🎨 ui/                 # 공용 컴포넌트
│   ├── 🛠 utils/              # 유틸리티 함수
│   ├── 📝 types/              # TypeScript 타입
│   └── 🔌 sdk/               # API 클라이언트 SDK
├── 🐳 docker-compose.yml      # 로컬 개발 환경
├── 📋 turbo.json             # Turborepo 설정
├── 🏠 pnpm-workspace.yaml    # 워크스페이스 설정
└── 📖 README.md
```

## 🚀 빠른 시작

### 전제 조건
- **Node.js**: 18.0.0 이상
- **Docker Desktop**: 데이터베이스 및 관리도구 실행용
- **Git**: 버전 관리
- **Chrome/Safari**: 최적 브라우저 환경

### ⚡ 1분 실행 가이드

```bash
# 1. 저장소 클론
git clone https://github.com/Strong-Couple/All-Influencer.git
cd All-influencer

# 2. 데이터베이스 실행 (PostgreSQL + Adminer)
docker compose -f db/postgres/docker-compose.yml up -d

# 3. 웹 앱 실행 (현재 temp-api 포함)
cd apps/web
npm install
npm run dev
```

### 🎯 모든 것을 한 번에 실행

```bash
# 터미널 1: 데이터베이스 시작
docker compose -f db/postgres/docker-compose.yml up -d

# 터미널 2: 임시 API 서버 (현재 사용중)
cd temp-api && npm start

# 터미널 3: 웹 애플리케이션  
cd apps/web && npm run dev
```

### 🌟 결과 확인

| 서비스 | URL | 설명 |
|--------|-----|------|
| 🌐 **메인 플랫폼** | http://localhost:3000 | 완전히 새롭게 디자인된 UI |
| 📋 **구인공고** | http://localhost:3000/jobs | 스와이프 슬라이드 + 혼합 레이아웃 |
| 👥 **사용자 목록** | http://localhost:3000/users | 고급 검색 및 필터링 |
| 🏠 **마이페이지** | http://localhost:3000/my | 역할별 대시보드 |
| 🔧 **API 서버** | http://localhost:3001 | 임시 API (완전 기능) |
| 🗃 **데이터 관리** | http://localhost:8080 | Adminer DB GUI |

🎉 **이제 완전히 업그레이드된 All-Influencer 플랫폼을 체험해보세요!**

## 🆕 새로운 기능 하이라이트

### 🏠 메인페이지 완전 리뉴얼
- **✨ 동적 히어로 섹션**: 그라디언트 배경, 애니메이션 효과
- **📊 실시간 통계**: 카운터 애니메이션으로 플랫폼 지표 표시
- **⭐ 인기 인플루언서**: 평점, 팔로워, 카테고리별 추천 섹션
- **📋 최신 구인공고**: 브랜드별 신규 협업 기회 미리보기
- **🎨 현대적 디자인**: 카드 기반 레이아웃, 호버 효과

### 🔍 고급 사용자 검색 시스템
- **🔎 실시간 검색**: 이름, 카테고리, 기술 등 즉시 필터링
- **📈 통계 대시보드**: 총 사용자, 팔로워, 캠페인 등 한 눈에
- **🎛 다중 필터**: 역할, 상태, 정렬 옵션
- **📱 뷰 모드 전환**: 그리드/리스트 뷰 선택
- **💎 프리미엄 카드**: 그라디언트, 애니메이션 효과

### 📋 구인공고 페이지 혁신
- **🎠 스와이프 슬라이드**: 프리미엄 공고용 터치 지원 캐러셀
- **🎴 혼합 레이아웃**: 카드형(광고) + 리스트형(일반) 조합
- **❤️ 즐겨찾기**: 하트 버튼으로 관심 공고 저장
- **🏷 스마트 태그**: 카테고리, 예산, 마감일 표시
- **📱 모바일 최적화**: 터치 제스처, 반응형 그리드

### 🏡 마이페이지 시스템
- **🎯 역할별 대시보드**: 인플루언서/광고주 맞춤 인터페이스
- **📊 상세 통계**: 지원 현황, 스크랩, 완료 프로젝트
- **✏️ 실시간 편집**: 프로필, 기술, 포트폴리오 즉시 수정
- **⚡ 빠른 액션**: 자주 사용하는 기능 원클릭 접근

### 🎨 UI/UX 개선사항
- **🌈 그라디언트 효과**: 모든 주요 요소에 적용
- **🏃‍♂️ 부드러운 애니메이션**: 호버, 클릭, 로딩 효과
- **📐 일관된 디자인**: 통일된 스타일 가이드
- **♿ 접근성**: 키보드 내비게이션, 스크린리더 지원

## 📚 상세 문서

프로젝트를 완전히 이해하고 효과적으로 사용하기 위해 다음 문서들을 참고하세요:

### 🚀 실행 및 개발 가이드
- **[프로젝트 실행 방법](docs/how-to-run.txt)** - 완전한 개발 환경 설정 및 실행 가이드
- **[데이터베이스 설정](docs/database-setup.txt)** - PostgreSQL + Prisma 연결 가이드
- **[Docker 관리](docs/docker-guide.txt)** - Docker 컨테이너 및 서비스 관리
- **[문제 해결](docs/troubleshooting.txt)** - 자주 발생하는 문제와 해결 방법

### 📋 빠른 참조
```bash
# 📖 전체 실행 가이드
cat docs/how-to-run.txt

# 🐳 Docker 관리 방법
cat docs/docker-guide.txt

# 🗄️ 데이터베이스 연결 설정
cat docs/database-setup.txt

# 🚨 문제 해결 가이드
cat docs/troubleshooting.txt
```

### 🔧 개발자를 위한 핵심 정보
- **환경 요구사항**: Node.js 18+, Docker, PostgreSQL
- **패키지 관리자**: npm 권장 (pnpm 키 검증 문제로 인해)
- **개발 서버**: API(3001) + Web(3000) + PostgreSQL(5432) + Adminer(8080)
- **데이터베이스**: PostgreSQL 16 with Prisma ORM

## 🔐 OAuth 소셜 로그인 설정

All-Influencer는 **Google, Kakao, Naver** OAuth 2.0 소셜 로그인을 지원합니다.

### OAuth 콘솔 설정

#### 1. Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. **APIs & Services > Credentials** 이동
3. **Create Credentials > OAuth 2.0 Client IDs** 선택
4. **Application type**: Web application
5. **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`
6. **Client ID**와 **Client Secret** 복사

#### 2. Kakao OAuth 설정
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. **내 애플리케이션** 에서 앱 생성 또는 선택
3. **앱 설정 > 플랫폼** 에서 Web 플랫폼 추가
   - 도메인: `http://localhost:3000`
4. **제품 설정 > 카카오 로그인** 활성화
   - Redirect URI: `http://localhost:3001/auth/kakao/callback`
5. **동의항목** 설정:
   - 프로필 정보 (필수): 닉네임, 프로필 사진
   - 카카오계정 (선택): 이메일
6. **REST API 키** 복사

#### 3. Naver OAuth 설정
1. [네이버 개발자센터](https://developers.naver.com/)에 접속
2. **Application > 애플리케이션 등록** 선택
3. **서비스 URL**: `http://localhost:3000`
4. **Callback URL**: `http://localhost:3001/auth/naver/callback`
5. **제공 정보**: 이메일, 닉네임, 프로필 사진
6. **Client ID**와 **Client Secret** 복사

### 환경변수 설정

OAuth 관련 환경변수를 설정합니다:

```bash
# apps/api/.env.local 파일 생성
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth  
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret-if-any

# Naver OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# JWT 및 리다이렉트 설정
JWT_SECRET=your-super-secret-32bytes-at-least-for-security
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
OAUTH_REDIRECT_SUCCESS=${APP_URL}/auth/success
OAUTH_REDIRECT_FAILURE=${APP_URL}/auth/failure

# 암호화 키 (선택)
ENCRYPTION_KEY=your-base64-encoded-32-bytes-encryption-key
```

### OAuth 로그인 플로우

```mermaid
sequenceDiagram
    participant U as 사용자
    participant W as 웹앱
    participant A as API서버
    participant G as Google/Kakao/Naver
    
    U->>W: 로그인 페이지 접속
    W->>U: 소셜 로그인 버튼 표시
    U->>A: OAuth 로그인 시작 (GET /auth/google)
    A->>G: OAuth 인증 페이지로 리다이렉트
    G->>U: 로그인 폼 표시
    U->>G: 로그인 정보 입력
    G->>A: 인증 코드와 함께 콜백 (GET /auth/google/callback)
    A->>G: 액세스 토큰 요청
    G->>A: 사용자 프로필 정보 반환
    A->>A: 계정 통합 처리
    A->>A: JWT 토큰 생성 & 쿠키 설정
    A->>W: 성공 페이지로 리다이렉트
    W->>U: 로그인 완료 화면
```

### OAuth 기능 테스트

1. **데이터베이스 실행**:
```bash
docker compose up -d
```

2. **API 서버 실행**:
```bash
cd apps/api
npm install
npm run dev
```

3. **웹 앱 실행**:
```bash
cd apps/web  
npm install
npm run dev
```

4. **테스트 시나리오**:
   - http://localhost:3000/auth/login 접속
   - 각 소셜 로그인 버튼 클릭
   - 권한 승인 후 로그인 완료 확인
   - http://localhost:3000/settings/accounts 에서 계정 관리

## 📚 상세 실행 방법

### Step 1: 환경 설정

#### pnpm 설치 및 활성화
```bash
# Corepack을 통한 pnpm 활성화 (권장)
corepack enable

# 또는 npm을 통한 전역 설치
npm install -g pnpm@8.12.1
```

#### 프로젝트 클론 및 설정
```bash
git clone <repository-url>
cd All-influencer

# 각 패키지별 의존성 설치 (워크스페이스 문제 우회)
cd apps/web && npm install
cd ../api && npm install
cd ../../packages/ui && npm install
cd ../utils && npm install
cd ../types && npm install
cd ../sdk && npm install
cd ../..
```

### Step 2: 데이터베이스 설정

```bash
# PostgreSQL & pgAdmin 실행
docker compose up -d

# 데이터베이스 상태 확인
docker compose logs postgres

# API 환경변수 설정
cd apps/api
echo 'DATABASE_URL="postgresql://dev:devpass@localhost:5432/all_influencer?schema=public"' > .env.local
echo 'JWT_SECRET="dev-jwt-secret-key-for-local-development-only"' >> .env.local
echo 'NODE_ENV=development' >> .env.local

# 데이터베이스 스키마 생성
DATABASE_URL="postgresql://dev:devpass@localhost:5432/all_influencer?schema=public" npx prisma db push

# 시드 데이터 삽입 (SQL 직접 실행)
docker exec -it all-influencer-db psql -U dev -d all_influencer -c "
INSERT INTO users (id, email, username, \"passwordHash\", \"displayName\", role, status, bio, avatar, \"createdAt\", \"updatedAt\") 
VALUES 
('admin001', 'admin@allinfluencer.com', 'admin', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqyeCHDRra3IzG3UjW6k7IS', '시스템 관리자', 'ADMIN', 'ACTIVE', '전체 플랫폼을 관리합니다.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', NOW(), NOW()),
('jenny001', 'jenny@example.com', 'jenny_kim', '\$2b\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '제니 김', 'INFLUENCER', 'ACTIVE', '뷰티 인플루언서입니다.', 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400', NOW(), NOW()),
('alex0001', 'alex@example.com', 'alex_fitness', '\$2b\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '알렉스 피트니스', 'INFLUENCER', 'ACTIVE', '피트니스 인플루언서입니다.', 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400', NOW(), NOW()),
('brand001', 'marketing@beautybrand.com', 'beauty_corp', '\$2b\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '뷰티 브랜드', 'ADVERTISER', 'ACTIVE', '뷰티 브랜드입니다.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', NOW(), NOW());
"
```

### Step 3: 애플리케이션 실행

#### Frontend 실행 (포트 3000)
```bash
cd apps/web
npm run dev
```

#### Backend 실행 (포트 3001) - 선택사항
```bash
cd apps/api
DATABASE_URL="postgresql://dev:devpass@localhost:5432/all_influencer?schema=public" JWT_SECRET="dev-jwt-secret-key-for-local-development-only" npm run dev
```

### Step 4: 접속 및 확인

| 서비스 | URL | 설명 |
|--------|-----|------|
| 🌐 웹 애플리케이션 | http://localhost:3000 | 메인 플랫폼 |
| 🔧 API 서버 | http://localhost:3001 | REST API |
| 📚 API 문서 | http://localhost:3001/api-docs | Swagger UI |
| 🗃 Prisma Studio | http://localhost:5555 | 데이터베이스 GUI |
| 🐘 pgAdmin | http://localhost:5050 | PostgreSQL 관리 |

## 🗄 데이터베이스 관리

### 접속 정보

#### PostgreSQL 직접 접속
```bash
# 터미널에서 직접 접속
docker exec -it all-influencer-db psql -U dev -d all_influencer

# 테이블 목록 확인
\dt

# 사용자 목록 확인
SELECT username, "displayName", role FROM users;
```

#### Prisma Studio (권장)
```bash
cd apps/api
DATABASE_URL="postgresql://dev:devpass@localhost:5432/all_influencer?schema=public" npx prisma studio
```
- **URL**: http://localhost:5555
- **기능**: 시각적 데이터 편집, 관계 탐색, 필터링

#### pgAdmin (고급 사용자)
- **URL**: http://localhost:5050
- **로그인**: admin@admin.com / admin
- **서버 연결**:
  - Host: `postgres`
  - Port: `5432`
  - Database: `all_influencer`
  - Username: `dev`
  - Password: `devpass`

### 데이터베이스 스키마

#### 주요 테이블
```sql
-- 사용자 (인플루언서, 광고주, 관리자)
users (id, email, username, passwordHash, displayName, role, status, bio, avatar)

-- 인플루언서 프로필
influencer_profiles (userId, categories, followers, avgEngagement, ratePerPost)

-- 광고주 회사 정보
advertiser_companies (userId, companyName, industry, description, location)

-- 소셜 미디어 채널
channels (influencerProfileId, platform, channelUrl, followers, avgViews)

-- 구인공고
job_posts (userId, title, description, budget, categories, platforms, deadline, status)

-- 지원서
applications (userId, jobPostId, status, coverLetter)

-- 계약 및 오퍼
offers (senderId, receiverId, jobPostId, amount, status, terms)
contracts (userId, offerId, startDate, endDate, totalAmount, status)

-- 커뮤니케이션
chat_messages (senderId, receiverId, message, isRead, createdAt)
notifications (userId, type, title, message, isRead, createdAt)

-- 리뷰 시스템
reviews (giverId, receiverId, rating, comment, createdAt)
```

### 테스트 계정

| 역할 | 이메일 | 비밀번호 | 설명 |
|------|--------|----------|------|
| 관리자 | admin@allinfluencer.com | admin123 | 시스템 관리자 |
| 인플루언서 | jenny@example.com | user123 | 뷰티 인플루언서 |
| 인플루언서 | alex@example.com | user123 | 피트니스 인플루언서 |
| 광고주 | marketing@beautybrand.com | user123 | 뷰티 브랜드 |

## 📖 API 문서

### Swagger UI
- **URL**: http://localhost:3001/api-docs
- **인증**: Bearer Token (JWT)
- **OpenAPI JSON**: http://localhost:3001/api-json

### 주요 엔드포인트

#### 인증 API
```
POST /auth/signup    - 회원가입
POST /auth/login     - 로그인
POST /auth/refresh   - 토큰 갱신
POST /auth/logout    - 로그아웃
GET  /auth/me        - 현재 사용자 정보
```

#### 사용자 API
```
GET    /users        - 사용자 목록 (페이지네이션)
GET    /users/:id    - 사용자 상세 정보
PUT    /users/:id    - 사용자 정보 수정
DELETE /users/:id    - 사용자 삭제
```

#### 구인공고 API (개발 예정)
```
GET    /job-posts    - 공고 목록
POST   /job-posts    - 공고 작성
GET    /job-posts/:id - 공고 상세
PUT    /job-posts/:id - 공고 수정
DELETE /job-posts/:id - 공고 삭제
```

## 🔧 개발 가이드

### 코드 스타일
- **ESLint**: `@typescript-eslint/recommended`
- **Prettier**: 2-space 들여쓰기, 세미콜론 사용
- **Commit Convention**: Conventional Commits

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

### 개발 워크플로우
1. **브랜치 생성**: `feature/기능명` 또는 `fix/버그명`
2. **개발 진행**: 기능 개발 및 테스트
3. **코드 검토**: ESLint, Prettier 실행
4. **커밋**: Conventional Commits 규칙 준수
5. **풀 리퀘스트**: 코드 리뷰 요청
6. **머지**: main 브랜치에 병합

### 테스트 실행
```bash
# 전체 테스트
npm run test

# API 테스트
cd apps/api
npm run test

# E2E 테스트
npm run test:e2e
```

### 빌드 및 배포
```bash
# 전체 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 🌐 배포

### Docker 배포
```bash
# 프로덕션 이미지 빌드
docker compose -f docker-compose.prod.yml build

# 프로덕션 환경 실행
docker compose -f docker-compose.prod.yml up -d
```

### 환경 변수 설정
```bash
# apps/api/.env.production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production

# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🚨 문제 해결

### 자주 발생하는 문제

#### 1. pnpm 설치 문제
```bash
# 해결: Corepack 사용
corepack enable
```

#### 2. workspace: 프로토콜 에러
```bash
# 해결: 개별 npm install
cd apps/web && npm install
cd ../api && npm install
```

#### 3. 데이터베이스 연결 실패
```bash
# 해결: Docker 컨테이너 상태 확인
docker compose ps
docker compose logs postgres
```

#### 4. UI 컴포넌트 에러
```bash
# 현재 상태: 간단한 HTML/CSS로 구현됨
# UI 패키지 의존성 문제로 인한 임시 조치
```

#### 5. 포트 충돌
```bash
# 해결: 사용 중인 포트 확인
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

### 로그 확인
```bash
# Docker 로그
docker compose logs -f

# 애플리케이션 로그
cd apps/web && npm run dev  # 웹 앱 로그
cd apps/api && npm run dev  # API 로그
```

### 디버깅 모드
```bash
# API 디버깅
cd apps/api
npm run start:debug

# Next.js 디버깅
cd apps/web
npm run dev -- --inspect
```

## 🤝 기여하기

1. **Fork** 프로젝트
2. **Feature Branch** 생성: `git checkout -b feature/AmazingFeature`
3. **변경사항 Commit**: `git commit -m 'feat: Add AmazingFeature'`
4. **Branch Push**: `git push origin feature/AmazingFeature`
5. **Pull Request** 생성

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- **개발팀**: dev@allinfluencer.com
- **GitHub**: https://github.com/your-org/all-influencer
- **문서**: https://docs.allinfluencer.com

---

**⚡ 빠른 시작**: `docker compose up -d && cd apps/web && npm install && npm run dev`

🎉 **프로젝트 실행 완료!** [http://localhost:3000](http://localhost:3000)에서 확인하세요.