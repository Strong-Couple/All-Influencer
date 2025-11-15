# Backend 개발 가이드

NestJS + Prisma 기반 API 서버(`apps/api`) 개발을 위한 구조와 규칙을 정리합니다.

## 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [레이어 원칙](#레이어-원칙)
- [실행 방법](#실행-방법)
- [환경 변수](#환경-변수)
- [Prisma & 마이그레이션](#prisma--마이그레이션)
- [주요 모듈](#주요-모듈)
- [인증 및 보안](#인증-및-보안)
- [테스트 & 검증](#테스트--검증)
- [요청 흐름 예시](#요청-흐름-예시)

---

## 기술 스택

| 기술 | 버전 | 용도 |
| --- | --- | --- |
| **NestJS** | 10.x | 모듈형 서버 프레임워크 |
| **Prisma** | 5.7.1 | PostgreSQL ORM/마이그레이션 |
| **@nestjs/swagger** | 7.1.17 | API 문서 자동 생성 |
| **@nestjs/jwt** | 10.2.0 | JWT 토큰 관리 |
| **passport** | 0.7.0 | 인증 전략 (JWT, Local, OAuth) |
| **bcrypt** | 5.1.1 | 비밀번호 해싱 |
| **pino** | 8.17.1 | 구조화된 로깅 |
| **helmet** | 7.1.0 | 보안 헤더 설정 |
| **compression** | 1.7.4 | 응답 압축 |

---

## 프로젝트 구조

```
apps/api/src
├── main.ts                 # 애플리케이션 진입점
├── app.module.ts           # 루트 모듈
├── common/                 # 공통 인프라
│   ├── database/           # PrismaService, PrismaModule
│   ├── services/           # 공통 서비스 (JwtCookieService, RefreshSessionService)
│   ├── utils/              # 유틸리티 (EncryptionUtil)
│   ├── config/             # 설정 (logger.config.ts, security.config.ts)
│   ├── middleware/         # 미들웨어 (RequestIdMiddleware)
│   ├── interceptors/       # 인터셉터 (LoggingInterceptor, TransformInterceptor)
│   └── filters/            # 예외 필터 (GlobalExceptionFilter, HttpExceptionFilter)
├── modules/                # 기능 모듈
│   ├── auth/               # 인증 모듈
│   │   ├── controllers/    # AuthController, LocalAuthController, OAuthController
│   │   ├── services/       # AuthService, TokenService, OAuthIntegrationService
│   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   ├── strategies/     # JwtStrategy, LocalStrategy, OAuth Strategies
│   │   ├── decorators/     # @Public(), @CurrentUser(), @Roles()
│   │   └── local/          # 로컬 인증 (LocalAuthController, LocalAuthService)
│   ├── users/              # 사용자 모듈
│   │   ├── controllers/    # UsersController
│   │   ├── services/       # UsersService
│   │   ├── repositories/   # UsersRepository
│   │   ├── use-cases/      # GetUsersUseCase, GetUserByIdUseCase, UpdateUserUseCase, DeleteUserUseCase
│   │   ├── dto/            # CreateUserDto, UpdateUserDto, QueryUsersDto
│   │   └── interfaces/     # User.interface.ts
│   └── my-page/            # 마이페이지 모듈
│       ├── controllers/    # MyPageController, InfluencerMyPageController, AdvertiserMyPageController
│       └── services/       # InfluencerMyPageService, AdvertiserMyPageService
└── config/                 # 환경변수 로딩
    └── config.factory.ts   # ConfigFactory
```

---

## 레이어 원칙

프로젝트는 **3계층 아키텍처**를 따릅니다:

```
Controller Layer (controllers/*)
  ↓
Service/Use-Case Layer (services/*, use-cases/*)
  ↓
Repository Layer (repositories/*)
  ↓
Infrastructure (Prisma, External APIs)
```

### 각 레이어의 역할

1. **Controller Layer**
   - HTTP 요청/응답 처리
   - DTO 검증 (`class-validator`)
   - Guard 적용 (인증/인가)
   - Swagger 데코레이터
   - **금지**: Prisma 직접 사용, 비즈니스 로직 포함

2. **Service/Use-Case Layer**
   - 비즈니스 로직 처리
   - 트랜잭션 관리
   - Repository 호출
   - **금지**: Controller 직접 참조, HTTP 관련 코드

3. **Repository Layer**
   - 데이터베이스 접근 (Prisma)
   - 쿼리 최적화
   - 데이터 변환
   - **금지**: 비즈니스 로직 포함

### Semgrep 규칙

`.semgrep/layered.yml`에서 다음 규칙을 강제합니다:

- ❌ Controller가 Prisma 직접 import
- ❌ Service가 Controller 참조
- ❌ Repository가 Service 참조

---

## 실행 방법

### 개발 환경 설정

```bash
# 1. 의존성 설치
cd apps/api
npm install

# 2. 데이터베이스 실행 (필수)
npm run db:up

# 3. Prisma Client 생성
npm run db:generate

# 4. 개발 서버 실행
npm run dev
```

**서버 포트**: `http://localhost:3001`  
**Swagger UI**: `http://localhost:3001/api-docs`

### 루트에서 동시 실행

```bash
# 루트 디렉토리에서
npm run dev:api          # API만
npm run dev              # API + Web 동시 실행
npm start                # npm run dev와 동일
```

---

## 환경 변수

`apps/api/.env` (또는 `.env.local`) 파일을 생성합니다:

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

# 쿠키
COOKIE_SECURE=false        # HTTPS 환경에서는 true
COOKIE_DOMAIN=             # 도메인 설정 (선택)

# OAuth (선택)
ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

---

## Prisma & 마이그레이션

### 기본 명령

```bash
cd apps/api

# Prisma Studio (GUI)
npx prisma studio                 # http://localhost:5555

# 스키마를 데이터베이스에 적용 (개발용)
npx prisma db push                # schema.prisma → DB

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name add_feature

# Prisma Client 재생성
npx prisma generate

# 마이그레이션 리셋 (주의: 데이터 삭제)
npx prisma migrate reset
```

### 마이그레이션 워크플로우

1. `prisma/schema.prisma` 수정
2. `npx prisma migrate dev --name <description>` 실행
3. 마이그레이션 파일이 `prisma/migrations/`에 생성됨
4. SDK 재생성: `npm run sdk:generate` (루트에서)

### 스키마 파일 위치

- **스키마 정의**: `apps/api/prisma/schema.prisma`
- **마이그레이션**: `apps/api/prisma/migrations/`
- **Prisma Client**: `apps/api/node_modules/.prisma/client/` (자동 생성)

---

## 주요 모듈

### 1. Auth Module (`modules/auth`)

**기능**:
- 패스워드 기반 로그인/회원가입
- OAuth 로그인 (Google, Kakao, Naver)
- JWT 토큰 발급 및 갱신
- Refresh 세션 관리
- 계정 연결 관리

**주요 파일**:
- `auth.controller.ts`: 인증 엔드포인트
- `local/local.controller.ts`: 로컬 인증 엔드포인트
- `local/local.service.ts`: 로컬 인증 로직
- `services/oauth-integration.service.ts`: OAuth 통합
- `guards/jwt-auth.guard.ts`: JWT 인증 가드
- `strategies/jwt.strategy.ts`: JWT 전략

**엔드포인트**:
- `POST /auth/signup`: 회원가입
- `POST /auth/login`: 로그인
- `POST /auth/refresh`: 토큰 갱신
- `POST /auth/logout`: 로그아웃
- `GET /auth/me`: 현재 사용자 정보

### 2. Users Module (`modules/users`)

**기능**:
- 사용자 CRUD
- 사용자 목록 조회 (페이지네이션, 필터링, 검색)
- 사용자 상세 조회

**주요 파일**:
- `users.controller.ts`: 사용자 엔드포인트
- `users.service.ts`: 사용자 서비스
- `repositories/users.repository.ts`: 사용자 저장소
- `use-cases/`: Use Case 패턴 구현

**엔드포인트**:
- `GET /users`: 사용자 목록
- `GET /users/:id`: 사용자 상세
- `PATCH /users/:id`: 사용자 수정
- `DELETE /users/:id`: 사용자 삭제

### 3. My-Page Module (`modules/my-page`)

**기능**:
- 인플루언서 마이페이지 (대시보드, 지원 목록, 스크랩)
- 광고주 마이페이지 (대시보드, 공고 관리, 지원자 목록)

**주요 파일**:
- `controllers/influencer-mypage.controller.ts`: 인플루언서 컨트롤러
- `controllers/advertiser-mypage.controller.ts`: 광고주 컨트롤러
- `services/influencer-mypage.service.ts`: 인플루언서 서비스
- `services/advertiser-mypage.service.ts`: 광고주 서비스

**엔드포인트**:
- `GET /my/influencer/overview`: 인플루언서 대시보드
- `GET /my/influencer/applications`: 지원 목록
- `GET /my/influencer/scraps`: 스크랩 목록
- `GET /my/advertiser/overview`: 광고주 대시보드
- `GET /my/advertiser/job-posts`: 공고 목록
- `GET /my/advertiser/job-posts/:id/applicants`: 지원자 목록

---

## 인증 및 보안

### JWT 인증

- **Access Token**: 15분 만료 (기본값)
- **Refresh Token**: 14일 만료 (기본값)
- **전송 방식**: httpOnly 쿠키 (XSS 방지)
- **토큰 로테이션**: Refresh Token 사용 시 새 토큰 발급

### Guard 적용

```typescript
// 전역 가드 (app.module.ts)
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}

// 특정 엔드포인트 공개
@Public()
@Get('/users')
async getUsers() { ... }

// 역할 기반 접근 제어
@Roles('ADMIN')
@Get('/admin/users')
async getAdminUsers() { ... }
```

### 보안 기능

- **Helmet**: 보안 헤더 설정
- **CORS**: Cross-Origin 요청 제어
- **Rate Limiting**: 요청 제한 (Throttler)
- **Password Hashing**: bcrypt (salt rounds: 12)
- **Cookie Security**: httpOnly, Secure, SameSite

---

## 테스트 & 검증

### 린팅 및 타입 검사

```bash
# 린팅
npm run lint

# 타입 검사
npm run type-check

# 레이어 규칙 검사 (Semgrep)
npm run semgrep
```

### 단위 테스트

```bash
# 테스트 실행
npm run test

# Watch 모드
npm run test:watch

# 커버리지
npm run test:cov
```

### E2E 테스트

```bash
npm run test:e2e
```

---

## 요청 흐름 예시

### 로그인 요청

```
HTTP POST /auth/login
  ↓
LocalAuthController.login()
  ↓ (DTO 검증, Guard)
LocalAuthService.login()
  ↓ (비즈니스 로직)
UsersRepository.findByEmail()
  ↓ (Prisma)
PrismaService.user.findUnique()
  ↓
JWT 토큰 생성 (JwtCookieService)
  ↓
RefreshSessionService.createSession()
  ↓
쿠키 설정 (httpOnly)
  ↓
ResponseInterceptor
  ↓
{ success: true, user: {...} }
```

### 사용자 목록 조회

```
HTTP GET /users?page=1&limit=20
  ↓
UsersController.findAll()
  ↓ (DTO 검증, @Public() 데코레이터)
UsersService.findAll()
  ↓ (비즈니스 로직)
GetUsersUseCase.execute()
  ↓
UsersRepository.findMany()
  ↓ (Prisma)
PrismaService.user.findMany()
  ↓
ResponseInterceptor
  ↓
{ success: true, data: { items: [...], meta: {...} } }
```

---

이 구조를 지키면 SDK 재생성과 프론트 타입 동기화가 쉬워집니다.

---

## 코드 품질 검증

### Git Hooks (Husky)

**Husky**는 Git hooks를 관리하여 커밋 전후에 자동으로 코드 검증을 실행합니다.

#### pre-commit (커밋 전 실행)

**위치**: `.husky/pre-commit`

**실행 내용**:
```bash
npm run lint && npm run type-check
```

**역할**:
- 커밋 전에 자동으로 린팅과 타입 체크를 실행
- 오류가 있으면 커밋이 차단됨

#### commit-msg (커밋 메시지 검증)

**위치**: `.husky/commit-msg`

**실행 내용**:
```bash
npx --no -- commitlint --edit ${1}
```

**역할**:
- 커밋 메시지가 Conventional Commits 규칙을 따르는지 검증
- 형식: `type(scope): subject`
- 예: `feat(auth): add OAuth login`, `fix(users): resolve pagination bug`

### Semgrep - 정적 분석 도구

**Semgrep**은 아키텍처 규칙 위반을 자동으로 감지합니다.

**위치**: `.semgrep/layered.yml`

**검사하는 규칙**:

1. **Controller는 Prisma를 직접 사용하지 않음**
   - 검사 대상: `/apps/api/src/modules/**/controllers/**.ts`
   - 금지: `import { PrismaClient } from '@prisma/client'`
   - 허용: `import { UsersService } from '../services/users.service'`

2. **Service는 Controller를 import하지 않음**
   - 검사 대상: `/apps/api/src/modules/**/services/**.ts`, `/apps/api/src/modules/**/use-cases/**.ts`
   - 금지: `import { UsersController } from '../controllers/users.controller'`
   - 허용: `import { UsersRepository } from '../repositories/users.repository'`

**실행**:
```bash
npm run semgrep
```

---

## 공유 패키지 (packages/)

백엔드에서 사용하는 공유 패키지들입니다. 모노레포의 `packages/` 폴더에서 관리됩니다.

### 패키지 목록

| 패키지 | 이름 | 용도 | 사용 위치 |
| --- | --- | --- | --- |
| **types** | `@all-influencer/types` | 공통 TypeScript 타입 | `apps/api/src/common/*` |
| **utils** | `@all-influencer/utils` | 유틸리티 함수 | `apps/api/src/config/*` |

### @all-influencer/types - 타입 정의

**위치**: `packages/types/`

**용도**:
- 프론트엔드와 백엔드 간 공유되는 TypeScript 타입
- API 요청/응답 타입
- 도메인 모델 타입

**주요 파일**:
- `src/api.ts`: API 응답 타입 (`ApiResponse`, `ApiError` 등)
- `src/common.ts`: 공통 타입 (`PaginatedResponse`, `ApiMeta` 등)

**사용 예시**:
```typescript
// apps/api/src/common/interceptors/response.interceptor.ts
import type { ApiResponse } from '@all-influencer/types';

// apps/api/src/common/filters/http-exception.filter.ts
import type { ApiError } from '@all-influencer/types';
```

**관리 방법**:
```bash
# 빌드
cd packages/types && npm run build

# 타입 체크
cd packages/types && npm run type-check
```

**주의사항**:
- 타입은 프론트엔드와 백엔드 모두에서 사용되므로 변경 시 주의
- Breaking change는 버전 관리 필요

### @all-influencer/utils - 유틸리티 함수

**위치**: `packages/utils/`

**용도**:
- 환경변수 파싱 (`parseEnv`, `CommonEnvSchema`)
- 날짜 포맷팅 (`formatDate`, `formatRelativeTime`)
- 가격 포맷팅 (`formatPrice`, `formatCurrency`)
- 문자열 유틸리티 (`slugify`, `capitalize`)

**주요 파일**:
- `src/env.ts`: 환경변수 파싱
- `src/date.ts`: 날짜 관련 유틸리티
- `src/price.ts`: 가격 포맷팅
- `src/string.ts`: 문자열 유틸리티

**사용 예시**:
```typescript
// apps/api/src/config/config.factory.ts
import { parseEnv, CommonEnvSchema } from '@all-influencer/utils';
```

**관리 방법**:
```bash
# 빌드
cd packages/utils && npm run build

# 테스트
cd packages/utils && npm run test
```

**주의사항**:
- 순수 함수로 작성 (side effect 없음)
- 테스트 코드 작성 권장

### 패키지 관리 방법

#### 패키지 수정 시

```bash
# 1. 패키지 디렉토리로 이동
cd packages/types

# 2. 수정 작업
# src/api.ts 파일 수정

# 3. 빌드
npm run build

# 4. 사용하는 앱에서 테스트
cd ../../apps/api
npm run dev
```

#### 전체 빌드

```bash
# 루트에서 모든 패키지 빌드
npm run build
```

#### 패키지 문제 해결

```bash
# 패키지를 찾을 수 없음
npm install
cd packages/types && npm run build

# 타입 오류
cd packages/types && npm run build && npm run type-check
cd apps/api && npm run type-check
```
