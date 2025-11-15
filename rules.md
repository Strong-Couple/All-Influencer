# 프로젝트 아키텍처 & 코딩 규칙

이 문서는 All Influencer 모노레포의 **레이어드 아키텍처**와 **Domain-Driven Design (DDD)** 원칙, 코드 컨벤션, 테스트 및 검증 절차를 정리합니다. Next.js App Router와 NestJS 베스트 프랙티스를 바탕으로 작성되었습니다.

---

## 1. 전체 아키텍처 개요

### 레이어

| 영역 | 폴더 | 역할 |
| --- | --- | --- |
| 프론트 UI | `apps/web/src/app`, `apps/web/src/components` | 사용자 인터페이스(App Router 기준 Server/Client Component). |
| 프론트 서비스 | `apps/web/src/services`, `apps/web/src/lib` | API 호출, 캐싱 옵션, 인증 토큰 처리. 컴포넌트가 직접 SDK/HTTP를 만지지 않음. |
| 공유 타입/SDK | `packages/types`, `packages/sdk`, `packages/utils` | DTO/유틸/자동 생성된 Axios Client. |
| API Controller | `apps/api/src/modules/**/controllers` | HTTP 경계. 인증/검증, DTO 매핑만 담당. |
| Application Service / Use-Case | `apps/api/src/modules/**/services`, `use-cases` | 비즈니스 규칙 조합, 트랜잭션 단위 orchestration. |
| Domain / Repository | `apps/api/src/modules/**/repositories`, `common/database` | Prisma, 외부 인프라 접근. |

### 의존 방향

```
React Page/Component → services/* → @all-influencer/sdk → HTTP API

Nest Controller → Application Service/Use-Case → Repository/Infrastructure → Prisma/외부

packages/* ←(참조) apps/*
```

프론트는 서비스 레이어를 통해서만 API를 호출하고, 백엔드는 Controller가 Repository를 직접 의존하지 않습니다.

---

## 2. 의존 관계 규칙

| From \ To | UI (app/components) | Web Services | SDK / packages | Controller | Service/UseCase | Repository/Infra |
| --- | --- | --- | --- | --- | --- | --- |
| UI | ✅ | ✅(services만) | ❌ | ❌ | ❌ | ❌ |
| Web Services | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Controller | ❌ | ❌ | ✅ | ✅ | ✅ | ✅(경유 금지) |
| Service / Use-Case | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Repository/Infra | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |

이를 자동으로 검증하기 위해 `.semgrep/layered.yml` 규칙을 제공하며, `semgrep --config .semgrep/layered.yml`로 실행합니다.

---

## 3. 코딩 컨벤션

### 네이밍 & 파일 규칙

- **폴더명**: 기능 단위로 kebab-case 사용 (예: `user-profile`, `job-posts`)
- **React 컴포넌트**: PascalCase (예: `UserCard.tsx`, `JobPostList.tsx`)
- **DTO 클래스**: `SomethingRequestDto`, `SomethingResponseDto` 형식
- **Nest 모듈**: `FeatureModule`, `feature.controller.ts`, `feature.service.ts`, `feature.repository.ts`
- **타입 정의**: 
  - 공유 타입: `packages/types` (프론트/백 모두 사용)
  - 프론트 전용: `apps/web/src/types`
  - 백엔드 전용: `apps/api/src/modules/*/dto`

### TypeScript 규칙

- **strict 모드**: 모든 프로젝트에서 `strict: true` 유지
- **타입 정의**: 백엔드 DTO와 프론트 API 응답 타입은 `packages/types` 또는 `apps/web/src/types`에서 구조화
- **React 상태 관리**: 
  - 외부 데이터는 `useMemo`, `useEffect`로 관리
  - API 호출은 반드시 `services/*` 레이어에 모음
  - 직접 `fetch` 사용 금지 (Server Component 제외)

### 폴더 구조 규칙

**프론트엔드** (`apps/web/src`):
- `app/` - Next.js App Router 페이지 및 라우팅
- `components/` - 재사용 가능한 프레젠테이션 컴포넌트
- `services/` - API 호출 및 데이터 계층
- `types/` - 프론트엔드 전용 타입 정의

**백엔드** (`apps/api/src`):
- `modules/<feature>/` - 도메인별 모듈
  - `controllers/` - HTTP 엔드포인트
  - `services/` 또는 `use-cases/` - 비즈니스 로직
  - `repositories/` - 데이터 접근 계층
  - `dto/` - 요청/응답 DTO
- `common/` - 공통 인프라 (PrismaService, Interceptor, Guard 등)

---

## 4. API 설계 규칙

### 백엔드
- RESTful 경로: `/feature`, `/feature/:id`, `/my/<role>/...`.
- 모든 Controller는 `ResponseInterceptor`에 의해 `{ success, data }` 포맷으로 응답합니다.
- DTO에는 Swagger 데코레이터를 붙여 OpenAPI 스키마가 최신 상태가 되도록 유지합니다. SDK는 `npm run sdk:generate`로 갱신합니다.

### 프론트
- `apps/web/src/lib/api-client.ts`에서 생성한 SDK 인스턴스를 사용하고, `services/*`에서만 SDK를 import.
- 공통 에러 처리, 토큰 저장/쿠키 연동은 `api-client.ts`, `services/auth.ts`에서 담당.
- App Router Server Component에서 `fetch`를 쓸 경우 `next: { revalidate }` 또는 `cache: 'no-store'` 옵션을 명시해 의도를 표현합니다.

---

## 5. 테스트 & 검증

1. **Semgrep**: `npx semgrep --config .semgrep/layered.yml`로 레이어 규칙 위반을 검사합니다.
2. **ESLint / Type Check**: `npm run lint`, `npm run type-check`.
3. **SDK 갱신**: API 스키마 변경 시 `npm run sdk:generate` 후 `packages/sdk/src/*`를 커밋합니다.

새 기능 추가 시에는 최소한 Semgrep + 타입 검사까지 실행해 레이어 의존 위반 여부를 확인합니다.

---

## 6. 흐름 예시

### 프론트 (사용자 목록)
```
page.tsx (UI)
  └─ services/users.ts (fetchUsers)
        └─ lib/api-client.ts → @all-influencer/sdk (Axios)
             └─ HTTP GET /users
```

### 백엔드 (사용자 조회)
```
users.controller.ts
  └─ users.service.ts / GetUsersUseCase
        └─ users.repository.ts (Prisma)
            └─ PostgreSQL
```

컨트롤러는 DTO 검증과 응답 포맷만 담당하고, 실제 로직은 UseCase/Service, 데이터 접근은 Repository로 한정합니다.

---

이 문서는 지속적으로 업데이트되며, 새로운 기능을 추가할 때는 본 규칙을 따라 동일한 구조를 유지해주세요.

