# 데이터베이스 가이드

All Influencer는 **PostgreSQL 16** + **Prisma ORM**을 사용합니다. 로컬 개발은 Docker Compose 기반으로 제공됩니다.

## 목차

- [구성 요소](#구성-요소)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [테이블 상세 정보](#테이블-상세-정보)
- [기본 명령](#기본-명령)
- [접속 정보](#접속-정보)
- [Prisma 사용](#prisma-사용)
- [주의 사항](#주의-사항)
- [문제 해결](#문제-해결)

---

## 구성 요소

- **`docker-compose.yml`** – PostgreSQL 컨테이너 (루트 디렉토리)
- **`db/sql/*.sql`** – 초기 스키마 및 시드 스크립트
- **`apps/api/prisma/schema.prisma`** – Prisma 모델 정의 및 마이그레이션
- **`db/data/`** – PostgreSQL 데이터 볼륨 (자동 생성, .gitignore 포함)

### 파일 구조

```
db/
├── sql/
│   ├── 001_schema.sql        # 스키마 생성
│   └── 002_seed.sql          # 더미 데이터
└── data/                     # PostgreSQL 데이터 볼륨 (자동 생성)
```

---

## 데이터베이스 스키마

### 전체 테이블 목록

프로젝트는 총 **15개의 테이블**을 사용합니다:

| 테이블명 | 설명 | PK | 주요 사용 위치 |
|---------|------|-----|--------------|
| `users` | 사용자 기본 정보 | `id` (cuid) | 모든 모듈 |
| `influencer_profiles` | 인플루언서 프로필 | `id` (cuid) | MyPage (인플루언서) |
| `advertiser_companies` | 광고주 회사 정보 | `id` (cuid) | MyPage (광고주) |
| `channels` | 소셜미디어 채널 | `id` (cuid) | 인플루언서 프로필 |
| `job_posts` | 구인공고 | `id` (cuid) | 광고주 MyPage, 공고 관리 |
| `applications` | 지원서 | `id` (cuid) | 인플루언서/광고주 MyPage |
| `offers` | 제안서/오퍼 | `id` (cuid) | 계약 관리 |
| `contracts` | 계약 | `id` (cuid) | 계약 관리 |
| `chat_messages` | 채팅 메시지 | `id` (cuid) | 메시지 시스템 |
| `notifications` | 알림 | `id` (cuid) | 알림 시스템 |
| `reviews` | 리뷰/평가 | `id` (cuid) | 평점 시스템 |
| `user_identities` | OAuth 연동 정보 | `id` (cuid) | 인증 모듈 |
| `refresh_sessions` | JWT Refresh 세션 | `id` (cuid) | 인증 모듈 |
| `refresh_tokens` | Refresh 토큰 (레거시) | `id` (cuid) | 인증 모듈 |
| `scraps` | 스크랩/북마크 | `id` (cuid) | 인플루언서 MyPage |

---

## 테이블 상세 정보

### 1. `users` (사용자 기본 정보)

**Primary Key**: `id` (String, cuid)

**주요 필드**:
- `id`: 사용자 고유 ID (cuid)
- `email`: 이메일 (unique, nullable - OAuth 사용자용)
- `username`: 사용자명 (unique, nullable)
- `passwordHash`: 비밀번호 해시 (nullable - OAuth 사용자용)
- `displayName`: 표시 이름
- `avatar`: 프로필 이미지 URL
- `role`: 역할 (INFLUENCER, ADVERTISER, ADMIN)
- `status`: 상태 (ACTIVE, INACTIVE, SUSPENDED)
- `bio`: 자기소개
- `website`: 웹사이트 URL
- `lastLoginAt`: 마지막 로그인 시간

**인덱스**:
- `email` (unique)
- `username` (unique)
- `[role, status]` (복합 인덱스)
- `createdAt`

**사용 위치**:
- `apps/api/src/modules/users/` - 사용자 CRUD
- `apps/api/src/modules/auth/` - 인증/인가
- `apps/api/src/modules/my-page/` - 마이페이지
- 모든 모듈에서 사용자 정보 참조

**관계**:
- 1:1 `InfluencerProfile` (role=INFLUENCER)
- 1:1 `AdvertiserCompany` (role=ADVERTISER)
- 1:N `JobPost`, `Application`, `Offer`, `Contract`, `ChatMessage`, `Notification`, `Review`, `Scrap`
- 1:N `UserIdentity`, `RefreshSession`, `RefreshToken`

---

### 2. `influencer_profiles` (인플루언서 프로필)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `userId` → `users.id` (unique, cascade delete)

**주요 필드**:
- `id`: 프로필 고유 ID
- `userId`: 사용자 ID (unique)
- `categories`: 전문 분야 배열 (예: ['뷰티', '라이프스타일'])
- `followers`: 총 팔로워 수
- `avgEngagement`: 평균 참여도 (%)
- `ratePerPost`: 포스트당 요금
- `location`: 위치
- `languages`: 지원 언어 배열
- `headline`: 한 줄 소개
- `bio`: 자기소개
- `skills`: 보유 기술 배열
- `portfolioUrls`: 포트폴리오 링크 배열
- `resumeJson`: 자유 양식 이력서 (JSON)

**인덱스**:
- `userId` (unique)
- `categories` (배열 인덱스)
- `followers`

**사용 위치**:
- `apps/api/src/modules/my-page/services/influencer-mypage.service.ts`
- 인플루언서 대시보드, 이력서 관리, 프로필 조회

**관계**:
- N:1 `User`
- 1:N `Channel`

---

### 3. `advertiser_companies` (광고주 회사)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `userId` → `users.id` (unique, cascade delete)

**주요 필드**:
- `id`: 회사 고유 ID
- `userId`: 사용자 ID (unique)
- `companyName`: 회사명
- `industry`: 업종
- `description`: 설명
- `website`: 웹사이트 URL
- `location`: 위치

**인덱스**:
- `userId` (unique)
- `industry`

**사용 위치**:
- `apps/api/src/modules/my-page/services/advertiser-mypage.service.ts`
- 광고주 대시보드, 회사 정보 관리

**관계**:
- N:1 `User`
- 1:N `JobPost`

---

### 4. `channels` (소셜미디어 채널)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `influencerProfileId` → `influencer_profiles.id` (cascade delete)

**주요 필드**:
- `id`: 채널 고유 ID
- `influencerProfileId`: 인플루언서 프로필 ID
- `platform`: 플랫폼 (INSTAGRAM, YOUTUBE, TIKTOK, TWITTER, FACEBOOK, TWITCH, LINKEDIN, BLOG)
- `channelUrl`: 채널 URL
- `channelHandle`: 채널 핸들
- `followers`: 팔로워 수
- `avgViews`: 평균 조회수
- `avgLikes`: 평균 좋아요 수

**인덱스**:
- `influencerProfileId`
- `platform`

**사용 위치**:
- `apps/api/src/modules/my-page/services/influencer-mypage.service.ts`
- 인플루언서 프로필의 채널 목록 조회

**관계**:
- N:1 `InfluencerProfile`

---

### 5. `job_posts` (구인공고)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `userId` → `users.id` (cascade delete)
- `companyId` → `advertiser_companies.id` (nullable)

**주요 필드**:
- `id`: 공고 고유 ID
- `userId`: 광고주 사용자 ID
- `companyId`: 회사 ID (nullable)
- `title`: 공고 제목
- `description`: 설명
- `requirements`: 요구사항
- `budget`: 예산
- `categories`: 필요 분야 배열
- `platforms`: 필요 플랫폼 배열
- `deadline`: 마감일
- `status`: 상태 (OPEN, CLOSED, COMPLETED, CANCELLED)

**인덱스**:
- `userId`
- `status`
- `categories` (배열 인덱스)
- `createdAt`
- `deadline`

**사용 위치**:
- `apps/api/src/modules/my-page/services/advertiser-mypage.service.ts`
- 광고주 공고 관리, 지원자 목록 조회

**관계**:
- N:1 `User` (광고주)
- N:1 `AdvertiserCompany` (nullable)
- 1:N `Application`, `Offer`, `Scrap`

---

### 6. `applications` (지원서)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `jobPostId` → `job_posts.id` (cascade delete)
- `userId` → `users.id` (cascade delete)

**Unique Constraint**: `[jobPostId, userId]` (한 사용자는 한 공고에 한 번만 지원 가능)

**주요 필드**:
- `id`: 지원서 고유 ID
- `jobPostId`: 공고 ID
- `userId`: 인플루언서 사용자 ID
- `coverLetter`: 자기소개서
- `proposedRate`: 제안 요금
- `status`: 상태 (PENDING, ACCEPTED, REJECTED, WITHDRAWN)

**인덱스**:
- `userId`
- `status`
- `createdAt`
- `[status, createdAt]` (복합 인덱스)

**사용 위치**:
- `apps/api/src/modules/my-page/services/influencer-mypage.service.ts` - 인플루언서 지원 목록
- `apps/api/src/modules/my-page/services/advertiser-mypage.service.ts` - 광고주 지원자 목록

**관계**:
- N:1 `JobPost`
- N:1 `User` (인플루언서)
- 1:N `Offer`

---

### 7. `offers` (제안서/오퍼)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `jobPostId` → `job_posts.id` (cascade delete)
- `applicationId` → `applications.id` (nullable)
- `senderId` → `users.id` (cascade delete)
- `receiverId` → `users.id` (cascade delete)

**주요 필드**:
- `id`: 오퍼 고유 ID
- `jobPostId`: 공고 ID
- `applicationId`: 지원서 ID (nullable)
- `senderId`: 제안 보내는 사람 (광고주)
- `receiverId`: 제안 받는 사람 (인플루언서)
- `amount`: 금액
- `description`: 설명
- `deadline`: 마감일
- `status`: 상태 (PENDING, ACCEPTED, REJECTED, EXPIRED)

**인덱스**:
- `senderId`
- `receiverId`
- `status`
- `createdAt`

**사용 위치**:
- 계약 생성 전 오퍼 관리
- 광고주/인플루언서 간 협상

**관계**:
- N:1 `JobPost`
- N:1 `Application` (nullable)
- N:1 `User` (sender)
- N:1 `User` (receiver)
- 1:1 `Contract`

---

### 8. `contracts` (계약)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `offerId` → `offers.id` (unique, cascade delete)
- `userId` → `users.id` (cascade delete)

**주요 필드**:
- `id`: 계약 고유 ID
- `offerId`: 오퍼 ID (unique)
- `userId`: 인플루언서 사용자 ID
- `amount`: 계약 금액
- `startDate`: 시작일
- `endDate`: 종료일 (nullable)
- `deliverables`: 납품물 배열
- `terms`: 계약 조건
- `status`: 상태 (ACTIVE, COMPLETED, CANCELLED, TERMINATED)

**인덱스**:
- `userId`
- `status`
- `startDate`
- `endDate`

**사용 위치**:
- 계약 관리, 진행 중인 캠페인 추적

**관계**:
- 1:1 `Offer`
- N:1 `User` (인플루언서)

---

### 9. `chat_messages` (채팅 메시지)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `senderId` → `users.id` (cascade delete)
- `receiverId` → `users.id` (cascade delete)

**주요 필드**:
- `id`: 메시지 고유 ID
- `senderId`: 발신자 ID
- `receiverId`: 수신자 ID
- `content`: 메시지 내용
- `type`: 메시지 타입 (TEXT, IMAGE, FILE, SYSTEM)
- `isRead`: 읽음 여부

**인덱스**:
- `senderId`
- `receiverId`
- `createdAt`
- `isRead`

**사용 위치**:
- 채팅 시스템 (현재 구현 예정)

**관계**:
- N:1 `User` (sender)
- N:1 `User` (receiver)

---

### 10. `notifications` (알림)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `userId` → `users.id` (cascade delete)

**주요 필드**:
- `id`: 알림 고유 ID
- `userId`: 사용자 ID
- `title`: 제목
- `content`: 내용
- `type`: 알림 타입 (APPLICATION, OFFER, CONTRACT, MESSAGE, REVIEW, SYSTEM)
- `isRead`: 읽음 여부
- `data`: 추가 메타데이터 (JSON)

**인덱스**:
- `userId`
- `type`
- `isRead`
- `createdAt`

**사용 위치**:
- 알림 시스템 (현재 구현 예정)

**관계**:
- N:1 `User`

---

### 11. `reviews` (리뷰/평가)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `giverId` → `users.id` (cascade delete)
- `receiverId` → `users.id` (cascade delete)

**Unique Constraint**: `[giverId, receiverId]` (한 사용자는 다른 사용자에게 한 번만 리뷰 가능)

**주요 필드**:
- `id`: 리뷰 고유 ID
- `giverId`: 평가하는 사람 ID
- `receiverId`: 평가받는 사람 ID
- `rating`: 평점 (1-5)
- `comment`: 댓글

**인덱스**:
- `giverId`
- `receiverId`
- `rating`
- `createdAt`

**사용 위치**:
- `apps/api/src/modules/my-page/services/influencer-mypage.service.ts` - 인플루언서 평균 평점
- `apps/api/src/modules/my-page/services/advertiser-mypage.service.ts` - 광고주 평균 평점

**관계**:
- N:1 `User` (giver)
- N:1 `User` (receiver)

---

### 12. `user_identities` (OAuth 연동 정보)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `userId` → `users.id` (cascade delete)

**Unique Constraint**: `[provider, providerUserId]` (동일 provider-userId는 1:1)

**주요 필드**:
- `id`: 연동 정보 고유 ID
- `userId`: 사용자 ID
- `provider`: OAuth 프로바이더 (GOOGLE, KAKAO, NAVER)
- `providerUserId`: 소셜 고유 ID
- `email`: 프로바이더 제공 이메일 (nullable)
- `accessTokenEnc`: 암호화된 액세스 토큰 (nullable)
- `refreshTokenEnc`: 암호화된 리프레시 토큰 (nullable)
- `scope`: 승인된 권한 범위
- `rawData`: 원본 프로필 데이터 (JSON, nullable)

**인덱스**:
- `userId`
- `email`
- `provider`
- `[provider, providerUserId]` (unique)

**사용 위치**:
- `apps/api/src/modules/auth/services/oauth-integration.service.ts`
- `apps/api/src/modules/auth/controllers/account-link.controller.ts`
- OAuth 로그인, 계정 연결 관리

**관계**:
- N:1 `User`

---

### 13. `refresh_sessions` (JWT Refresh 세션)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `userId` → `users.id` (cascade delete)

**Unique Constraint**: `jti` (JWT ID)

**주요 필드**:
- `id`: 세션 고유 ID
- `userId`: 사용자 ID
- `jti`: JWT ID (토큰 로테이션용, unique)
- `uaHash`: User-Agent 해시 (보안 강화, nullable)
- `ipHash`: IP 해시 (보안 강화, nullable)
- `expiresAt`: 만료 시간

**인덱스**:
- `userId`
- `expiresAt`
- `jti` (unique)

**사용 위치**:
- `apps/api/src/common/services/refresh-session.service.ts`
- JWT 토큰 갱신, 세션 관리, 로그아웃

**관계**:
- N:1 `User`

---

### 14. `refresh_tokens` (Refresh 토큰 - 레거시)

**Primary Key**: `id` (String, cuid)  
**Foreign Key**: `userId` → `users.id` (cascade delete)

**Unique Constraint**: `jti` (JWT ID)

**주요 필드**:
- `id`: 토큰 고유 ID
- `userId`: 사용자 ID
- `jti`: JWT ID (unique)
- `expiresAt`: 만료 시간

**인덱스**:
- `userId`
- `jti` (unique)
- `expiresAt`

**사용 위치**:
- 레거시 호환성 유지 (현재는 `refresh_sessions` 사용 권장)

**관계**:
- N:1 `User`

---

### 15. `scraps` (스크랩/북마크)

**Primary Key**: `id` (String, cuid)  
**Foreign Keys**: 
- `userId` → `users.id` (cascade delete)
- `jobPostId` → `job_posts.id` (cascade delete)

**Unique Constraint**: `[userId, jobPostId]` (한 사용자는 한 공고를 한 번만 스크랩 가능)

**주요 필드**:
- `id`: 스크랩 고유 ID
- `userId`: 인플루언서 사용자 ID
- `jobPostId`: 공고 ID

**인덱스**:
- `userId`
- `jobPostId`
- `[userId, createdAt]` (복합 인덱스)

**사용 위치**:
- `apps/api/src/modules/my-page/services/influencer-mypage.service.ts`
- 인플루언서 스크랩 목록, 스크랩 추가/삭제

**관계**:
- N:1 `User` (인플루언서)
- N:1 `JobPost`

---

## Enum 타입

### UserRole
- `INFLUENCER`: 인플루언서
- `ADVERTISER`: 광고주
- `ADMIN`: 관리자

### UserStatus
- `ACTIVE`: 활성
- `INACTIVE`: 비활성
- `SUSPENDED`: 정지

### Platform
- `INSTAGRAM`, `YOUTUBE`, `TIKTOK`, `TWITTER`, `FACEBOOK`, `TWITCH`, `LINKEDIN`, `BLOG`

### JobPostStatus
- `OPEN`: 모집중
- `CLOSED`: 모집완료
- `COMPLETED`: 완료
- `CANCELLED`: 취소

### ApplicationStatus
- `PENDING`: 대기중
- `ACCEPTED`: 승인
- `REJECTED`: 거절
- `WITHDRAWN`: 철회

### OfferStatus
- `PENDING`: 대기중
- `ACCEPTED`: 승인
- `REJECTED`: 거절
- `EXPIRED`: 만료

### ContractStatus
- `ACTIVE`: 진행중
- `COMPLETED`: 완료
- `CANCELLED`: 취소
- `TERMINATED`: 종료

### MessageType
- `TEXT`: 텍스트
- `IMAGE`: 이미지
- `FILE`: 파일
- `SYSTEM`: 시스템

### NotificationType
- `APPLICATION`: 지원
- `OFFER`: 오퍼
- `CONTRACT`: 계약
- `MESSAGE`: 메시지
- `REVIEW`: 리뷰
- `SYSTEM`: 시스템

### AuthProvider
- `GOOGLE`: Google OAuth
- `KAKAO`: Kakao OAuth
- `NAVER`: Naver OAuth

---

## 기본 명령

루트 `package.json` 스크립트:

```bash
npm run db:up        # docker compose up -d postgres
npm run db:down       # 컨테이너 및 볼륨 제거
npm run db:logs       # PostgreSQL 로그 스트리밍
npm run db:migrate    # db/sql/001_schema.sql 적용
npm run db:seed       # db/sql/002_seed.sql 적용
```

---

## 접속 정보 (로컬)

| 항목 | 값 |
| --- | --- |
| Host | localhost |
| Port | 5432 |
| Database | allinfluencer |
| Username | allinfluencer |
| Password | allinfluencer |

### 직접 DB 접속

#### PostgreSQL CLI 접속
```bash
# 컨테이너 내부 접속
docker exec -it allinfluencer-postgres psql -U allinfluencer -d allinfluencer

# SQL 파일 직접 실행
docker exec -i allinfluencer-postgres psql -U allinfluencer -d allinfluencer < db/sql/001_schema.sql
```

#### DBeaver 사용 (권장)

DBeaver는 강력한 데이터베이스 관리 도구입니다. 다음 정보로 연결하세요:

**연결 정보**:
- **Host**: localhost
- **Port**: 5432
- **Database**: allinfluencer
- **Username**: allinfluencer
- **Password**: allinfluencer

**DBeaver 설치**:
- [DBeaver 공식 사이트](https://dbeaver.io/download/)에서 다운로드
- PostgreSQL 드라이버는 자동으로 설치됩니다

---

## 데이터 검증 쿼리

데이터가 올바르게 생성되었는지 확인하는 유용한 쿼리들:

```sql
-- 사용자 수 확인
SELECT COUNT(*) FROM users;
-- 예상 결과: 등록된 사용자 수

-- 사용자 역할별 통계
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- 인플루언서 프로필 확인
SELECT u.displayName, ip.categories, ip.followers 
FROM users u 
JOIN influencer_profiles ip ON u.id = ip."userId" 
LIMIT 10;

-- 광고주 회사 확인
SELECT u.displayName, ac.companyName, ac.industry 
FROM users u 
JOIN advertiser_companies ac ON u.id = ac."userId" 
LIMIT 10;

-- 구인공고 상태 확인
SELECT status, COUNT(*) as count FROM job_posts GROUP BY status;

-- 지원서 상태 확인
SELECT status, COUNT(*) as count FROM applications GROUP BY status;

-- 계약 상태 확인
SELECT status, COUNT(*) as count FROM contracts GROUP BY status;

-- 스크랩 수 확인
SELECT COUNT(*) FROM scraps;
```

---

## Prisma 사용

```bash
cd apps/api

# Prisma Studio (GUI)
npx prisma studio                 # http://localhost:5555

# 스키마를 데이터베이스에 적용
npx prisma db push                # schema.prisma → DB

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name xxx # 마이그레이션 생성

# Prisma Client 재생성
npx prisma generate               # Prisma Client 재생성
```

### 마이그레이션 규칙

1. `schema.prisma` 수정 후 `npx prisma migrate dev --name <desc>` 실행
2. SDK/공유 타입에 영향이 있으면 `npm run sdk:generate` 실행
3. SQL 시드가 필요하면 `db/sql/002_seed.sql` 추가 혹은 Prisma seeder 작성

---

## 주의 사항

- **환경 변수 보안**: `DATABASE_URL`은 각 환경별 `.env` 파일에서 관리하며, Git에 커밋하지 않습니다.
- **스키마 동기화**: 로컬 개발 시 Docker 컨테이너와 Prisma Client의 스키마 버전을 항상 일치시켜야 합니다.
- **시드 데이터**: 테스트 실행 전 필요한 시드 데이터가 있는지 확인하고, 필요 시 `npm run db:seed`를 실행합니다.
- **마이그레이션 충돌**: 여러 개발자가 동시에 작업할 경우 마이그레이션 충돌을 주의하세요.
- **Cascade Delete**: 대부분의 관계에서 `onDelete: Cascade`가 설정되어 있어, 부모 레코드 삭제 시 자식 레코드도 함께 삭제됩니다.
- **데이터 영속성**: `postgres_data` 볼륨에 데이터가 저장됩니다. `npm run db:down -v` 실행 시 데이터가 삭제됩니다.
- **포트 충돌**: 5432 포트가 사용 중이면 충돌할 수 있습니다. `lsof -i :5432`로 확인하세요.
- **개발 환경**: 프로덕션 환경에서는 보안 설정을 강화해야 합니다 (비밀번호, 방화벽 등).

---

## 문제 해결

### 데이터베이스 연결 실패

```bash
# 컨테이너 상태 확인
docker ps | grep postgres

# 컨테이너 재시작
npm run db:down
npm run db:up

# 연결 테스트
docker exec -it allinfluencer-postgres psql -U allinfluencer -d allinfluencer -c "SELECT 1;"
```

### Prisma 스키마 불일치

```bash
cd apps/api

# 스키마를 데이터베이스에 강제 적용 (주의: 데이터 손실 가능)
npx prisma db push --force-reset

# 또는 마이그레이션 생성
npx prisma migrate dev --name fix_schema
```

### 볼륨 데이터 초기화

```bash
# 1. 컨테이너 및 볼륨 삭제
npm run db:down

# 2. 데이터 디렉터리 삭제 (선택 사항, 로컬 볼륨 사용 시)
rm -rf db/data

# 3. 다시 시작
npm run db:up

# 4. 마이그레이션/시드 재실행
npm run db:migrate
npm run db:seed
```

**주의**: 볼륨을 사용하는 경우 (`postgres_data`), `docker volume rm all-influencer_postgres_data`로 볼륨을 삭제할 수 있습니다.

---

## 백업/복구 (선택)

```bash
# 덤프
pg_dump -h localhost -U allinfluencer allinfluencer > backup.sql

# 복구
psql -h localhost -U allinfluencer -d allinfluencer < backup.sql
```
