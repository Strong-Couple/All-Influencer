# All-Influencer Platform

> **🚀 인플루언서와 브랜드를 연결하는 풀스택 플랫폼**  
> Next.js + NestJS + PostgreSQL + Prisma를 활용한 모노레포 아키텍처

![프로젝트 상태](https://img.shields.io/badge/상태-개발중-yellow)
![기술스택](https://img.shields.io/badge/Tech_Stack-TypeScript-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![라이센스](https://img.shields.io/badge/license-MIT-green)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [환경 설정](#-환경-설정)
- [실행 방법](#-실행-방법)
- [상세 문서](#-상세-문서)

---

## 🎯 프로젝트 개요

**All-Influencer**는 인플루언서와 광고주(브랜드)를 연결하는 종합 플랫폼입니다.

### 프로젝트 목적

- 🤝 **인플루언서-브랜드 매칭**: 검증된 인플루언서와 브랜드를 효율적으로 연결
- 📊 **캠페인 관리**: 구인공고, 지원, 계약, 성과 추적을 한 곳에서 관리
- 🔒 **안전한 거래**: 투명한 계약 및 결제 시스템
- 📈 **데이터 기반 의사결정**: 상세한 성과 분석 및 리포팅

### 타겟 사용자

- **인플루언서**: 소셜미디어 크리에이터, 블로거, 유튜버
- **광고주**: 브랜드, 마케팅 에이전시, 스타트업
- **관리자**: 플랫폼 운영 및 관리

---

## ✨ 주요 기능

### 🏠 메인 페이지 (`/`)

- **히어로 섹션**: 플랫폼 소개 및 주요 CTA
- **통계 대시보드**: 활성 인플루언서, 브랜드 파트너, 완료된 캠페인 수
- **인기 인플루언서**: 평점, 팔로워, 카테고리별 추천
- **최신 구인공고**: 브랜드별 신규 협업 기회 미리보기
- **기능 소개**: 플랫폼의 주요 특징 및 장점

### 👥 사용자 목록 (`/users`)

- **실시간 검색**: 이름, 카테고리, 기술 등 즉시 필터링
- **다중 필터**: 역할(인플루언서/광고주), 상태(활성/비활성), 정렬 옵션
- **뷰 모드 전환**: 그리드/리스트 뷰 선택
- **페이지네이션**: 효율적인 데이터 로딩
- **통계 대시보드**: 총 사용자, 팔로워, 캠페인 등 한 눈에 확인

### 💼 구인공고 (`/jobs`)

- **스와이프 슬라이드**: 프리미엄 공고용 터치 지원 캐러셀
- **혼합 레이아웃**: 카드형(광고) + 리스트형(일반) 조합
- **즐겨찾기**: 하트 버튼으로 관심 공고 저장
- **스마트 태그**: 카테고리, 예산, 마감일 표시
- **모바일 최적화**: 터치 제스처, 반응형 그리드

### 🔐 인증 시스템 (`/auth/*`)

- **소셜 로그인**: Google, Kakao, Naver OAuth 2.0
- **로컬 로그인**: 이메일/비밀번호 기반 인증
- **회원가입**: 역할 선택 (인플루언서/광고주)
- **계정 통합**: 동일 이메일 기반 자동 계정 연결
- **JWT 인증**: httpOnly 쿠키 기반 Access/Refresh 토큰

### 👤 마이페이지 (`/my/*`)

#### 인플루언서 마이페이지 (`/my/influencer`)

- **대시보드**: 총 팔로워, 포스트당 요금, 연결된 채널 수
- **지원 현황**: 총 지원, 대기중, 합격, 불합격 건수
- **활동 통계**: 스크랩한 공고, 완료된 계약, 평균 평점
- **빠른 액션**: 이력서 편집, 지원 현황, 스크랩 관리, 공고 찾기
- **이력서 관리** (`/my/influencer/resume`): 프로필, 기술, 포트폴리오 편집

#### 광고주 마이페이지 (`/my/advertiser`)

- **대시보드**: 총 공고, 활성 공고, 최근 지원자, 평균 평점
- **공고 현황**: 임시보관, 모집중, 모집완료, 완료 건수
- **활동 통계**: 진행중 계약, 이번달 지원자, 평균 응답률, 완료율
- **빠른 액션**: 공고 작성, 공고 관리, 지원자 관리, 성과 분석
- **최근 활동**: 최근 공고 활동 및 메시지

### ⚙️ 설정 (`/settings/*`)

- **계정 관리**: 소셜 계정 연결/해제, 프로필 수정

---

## 🛠 기술 스택

### Frontend
- **Next.js 14**: App Router, Server Components, TypeScript
- **React 18**: Hooks, Context API
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Lucide React**: 아이콘 라이브러리

### Backend
- **NestJS**: 모듈화된 Node.js 프레임워크
- **Prisma**: Type-safe ORM, 데이터베이스 마이그레이션
- **PostgreSQL 16**: 관계형 데이터베이스
- **JWT**: JSON Web Token 인증 (httpOnly 쿠키)

### DevOps & Tools
- **Docker**: PostgreSQL 컨테이너
- **Turborepo**: 모노레포 빌드 시스템
- **npm**: 패키지 관리자
- **ESLint + Prettier**: 코드 품질 관리
- **Husky**: Git hooks, 커밋 전 검증
- **Semgrep**: 아키텍처 규칙 검증

---

## 🚀 환경 설정

### 전제 조건

- **Node.js** ≥ 18
- **npm** ≥ 8
- **Docker Desktop / CLI**

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/Strong-Couple/All-Influencer.git
cd All-influencer

# 모노레포 전체 의존성 설치
npm install
```

### 2. 데이터베이스 설정

```bash
# PostgreSQL 컨테이너 시작
npm run db:up

# Prisma Client 생성
cd apps/api
npx prisma generate
```

**데이터베이스 접속 정보**:
- Host: `localhost`
- Port: `5432`
- Database: `allinfluencer`
- Username: `allinfluencer`
- Password: `allinfluencer`

### 3. 환경 변수 설정

#### Backend (`apps/api/.env`)

```bash
# 데이터베이스
DATABASE_URL=postgresql://allinfluencer:allinfluencer@localhost:5432/allinfluencer?schema=public

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d

# 애플리케이션
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# OAuth (선택)
ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

#### Frontend (`apps/web/.env.local`)

```bash
# API 서버 URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# 애플리케이션 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 실행 방법

### 전체 실행 (권장)

```bash
# 프론트엔드 + 백엔드 동시 실행
npm run dev
# 또는
npm start
```

### 개별 실행

```bash
# 프론트엔드만 실행
npm run dev:web

# 백엔드만 실행
npm run dev:api
```

### 서비스 접속 정보

| 서비스 | URL | 설명 |
|--------|-----|------|
| 🌐 웹 애플리케이션 | http://localhost:3000 | 메인 플랫폼 |
| 🔧 API 서버 | http://localhost:3001 | REST API |
| 📚 Swagger UI | http://localhost:3001/api/docs | API 문서 |
| 🔗 OpenAPI JSON | http://localhost:3001/api-json | OpenAPI 스펙 |
| 🗃 Prisma Studio | http://localhost:5555 | 데이터베이스 GUI |
| 🐘 DBeaver | 로컬 설치 | PostgreSQL 관리 (권장) |

### Prisma Studio 실행

Prisma Studio는 **별도 설치가 필요 없습니다**. Prisma가 이미 설치되어 있으므로 바로 실행할 수 있습니다.

```bash
# 방법 1: npm 스크립트 사용 (권장)
cd apps/api
npm run db:studio

# 방법 2: npx 사용
cd apps/api
npx prisma studio
```

**접속**: http://localhost:5555

**주의사항**:
- Prisma Studio 실행 전에 데이터베이스가 실행 중이어야 합니다 (`npm run db:up`)
- Prisma Client가 생성되어 있어야 합니다 (`npm run db:generate`)

### Swagger UI 접속

API 서버 실행 후 브라우저에서 접속:
- **URL**: http://localhost:3001/api/docs
- **인증**: JWT Bearer Token (로그인 후 토큰 사용)

---

## 📚 상세 문서

| 문서 | 내용 |
| --- | --- |
| `docs/frontend.md` | Next.js 구조, 서비스/타입 계층, 실행 방법, 패키지 관리 |
| `docs/backend.md` | NestJS 모듈/레이어 규칙, 마이그레이션, 테스트, 패키지 관리 |
| `docs/db.md` | PostgreSQL/Docker 명령, Prisma 사용 가이드, 테이블 상세 정보 |
| `docs/docker.md` | 컨테이너 구성 및 문제 해결 |
| `docs/api-spec.md` | HTTP API 엔드포인트 사양서 |
| `rules.md` | 프로젝트 아키텍처 & 코딩 규칙 |

---

## 🔧 개발 도구

### 코드 품질 검증

```bash
# 린팅
npm run lint

# 타입 검사
npm run type-check

# 레이어 규칙 검사 (Semgrep)
npm run semgrep

# SDK 재생성 (API 스키마 변경 시)
npm run sdk:generate
```

### 데이터베이스 관리

```bash
# 컨테이너 시작
npm run db:up

# 컨테이너 종료
npm run db:down

# 로그 확인
npm run db:logs

# 스키마 적용
npm run db:migrate

# 시드 데이터 삽입
npm run db:seed
```

---

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.

---

## 📞 연락처

- **GitHub Repository**: https://github.com/Strong-Couple/All-Influencer
- **개발 문서**: [docs/](docs/) 폴더 참조
- **이슈 리포팅**: GitHub Issues 활용
