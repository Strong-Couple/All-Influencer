# Frontend 개발 가이드

이 문서는 `apps/web` (Next.js 14 App Router) 애플리케이션을 개발할 때 필요한 구조, 실행 방법, 패턴을 정리합니다.

## 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [아키텍처 패턴](#아키텍처-패턴)
- [실행 방법](#실행-방법)
- [환경 변수](#환경-변수)
- [주요 패턴](#주요-패턴)
- [개발 체크리스트](#개발-체크리스트)
- [코드 품질 검증](#코드-품질-검증)
- [문제 해결](#문제-해결)

---

## 기술 스택

| 기술 | 버전 | 용도 |
| --- | --- | --- |
| **Next.js** | 14.0.4 | React 프레임워크, App Router |
| **React** | 18.x | UI 라이브러리 |
| **TypeScript** | 5.x | 타입 안전성 |
| **Tailwind CSS** | 3.3.0 | 유틸리티 기반 스타일링 |
| **lucide-react** | 0.294.0 | 아이콘 라이브러리 |
| **@heroicons/react** | 2.2.0 | 아이콘 라이브러리 (일부 페이지) |
| **@all-influencer/sdk** | - | 자동 생성된 API 클라이언트 |

### 타입 정의 위치

- **공통 타입**: `packages/types` (모노레포 공유)
- **프론트 전용 타입**: `apps/web/src/types/api.ts`
- **SDK 타입**: `packages/sdk/src/api-types.ts` (자동 생성)

---

## 프로젝트 구조

```
apps/web/src
├── app/                    # Next.js App Router (페이지 라우팅)
│   ├── (routes)/          # 라우트 그룹 (선택적)
│   ├── auth/              # 인증 관련 페이지
│   │   ├── login/         # 로그인 페이지
│   │   ├── signup/         # 회원가입 페이지
│   │   └── local-login/    # 로컬 로그인 페이지
│   ├── users/              # 사용자 목록 페이지
│   ├── jobs/               # 공고 목록 페이지
│   ├── my/                 # 마이페이지
│   │   ├── influencer/    # 인플루언서 마이페이지
│   │   └── advertiser/    # 광고주 마이페이지
│   ├── settings/           # 설정 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # Tailwind 글로벌 스타일
├── components/             # 재사용 가능한 프레젠테이션 컴포넌트
│   └── AuthButton.tsx     # 인증 버튼 컴포넌트
├── services/              # API 호출 및 데이터 계층 (SDK 사용)
│   ├── auth.ts            # 인증 관련 API
│   └── users.ts           # 사용자 관련 API
├── lib/                   # 유틸리티 및 헬퍼 함수
│   └── api-client.ts      # SDK 초기화 및 토큰 관리 (레거시)
└── types/                 # 프론트엔드 전용 타입 정의
    └── api.ts             # API 응답 타입 (PaginatedResponse 등)
```

### Next.js App Router 구조

Next.js 14 App Router에서는 **`app/` 폴더가 파일 기반 라우팅을 담당**합니다:

- `app/page.tsx` → `/` (홈 페이지)
- `app/users/page.tsx` → `/users` (사용자 목록)
- `app/my/influencer/page.tsx` → `/my/influencer` (인플루언서 마이페이지)

**라우트 파일 규칙**:
- 각 라우트는 `page.tsx` 파일로 정의됩니다
- `page.tsx`는 반드시 `app/` 폴더 내에 있어야 합니다
- 별도 `pages/` 폴더는 사용하지 않습니다 (Next.js가 인식하지 못함)

**컴포넌트 분리** (페이지가 복잡할 때):
```
apps/web/src/app/users/
├── page.tsx              # 라우트 파일 (필수)
├── UsersPageContent.tsx  # 페이지 컴포넌트 (선택)
└── components/           # 페이지 전용 컴포넌트 (선택)
    ├── UserGridCard.tsx
    └── UserListCard.tsx
```

**라우트 그룹 사용** (논리적 그룹화):
```
apps/web/src/app/
├── (main)/               # 메인 페이지 그룹 (URL에 포함되지 않음)
│   ├── page.tsx          # /
│   └── users/
│       └── page.tsx      # /users
└── (auth)/               # 인증 그룹
    └── auth/
        └── login/
            └── page.tsx  # /auth/login
```

---

## 아키텍처 패턴

### 데이터 흐름

프론트엔드는 **레이어드 아키텍처**를 따릅니다:

```
UI Layer (app/*, components/*)
  ↓
Service Layer (services/*)
  ↓
SDK Layer (@all-influencer/sdk)
  ↓
HTTP API (NestJS Backend)
```

**규칙**: UI 컴포넌트는 직접 SDK를 import하지 않으며, 반드시 `services/*` 레이어를 통해 API를 호출합니다.

### 레이어별 역할

1. **UI Layer** (`app/*`, `components/*`)
   - 사용자 인터페이스 렌더링
   - 사용자 입력 처리
   - 상태 관리 (useState, useEffect)
   - `services/*` 함수 호출

2. **Service Layer** (`services/*`)
   - API 호출 로직 캡슐화
   - 데이터 정규화 및 변환
   - 에러 처리
   - SDK 클라이언트 사용

3. **SDK Layer** (`@all-influencer/sdk`)
   - 자동 생성된 타입 안전 API 클라이언트
   - httpOnly 쿠키 기반 인증 처리
   - Axios 인스턴스 관리

### 예시: 사용자 목록 조회

```typescript
// 1. UI 레이어 (app/users/page.tsx)
'use client';
import { useState, useEffect } from 'react';
import { fetchUsers } from '@/services/users';
import type { UserListItem } from '@/types/api';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers({ page: 1, limit: 20 })
      .then(data => setUsers(data.items))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>로딩 중...</div>;
  return <UserList users={users} />;
}

// 2. 서비스 레이어 (services/users.ts)
import { apiClient } from '@all-influencer/sdk';
import type { PaginatedResponse, UserListItem } from '@/types/api';

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: 'INFLUENCER' | 'ADVERTISER' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  search?: string;
}

export async function fetchUsers(
  params: FetchUsersParams
): Promise<PaginatedResponse<UserListItem>> {
  try {
    const response = await apiClient.getUsers({
      page: params.page || 1,
      limit: params.limit || 20,
      role: params.role,
      status: params.status,
      search: params.search,
    });
    
    return {
      items: response.data.items,
      meta: response.data.meta,
    };
  } catch (error) {
    // 401 Unauthorized는 정상 (로그인하지 않은 상태)
    if (error instanceof Error && error.message.includes('401')) {
      return { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
    throw error;
  }
}
```

---

## 실행 방법

### 개발 환경 설정

```bash
# 1. 루트에서 의존성 설치
npm install

# 2. 데이터베이스 실행 (필수)
npm run db:up

# 3. 프론트엔드만 실행
npm run dev:web

# 4. 프론트엔드 + 백엔드 동시 실행 (권장)
npm run dev
# 또는
npm start
```

**접속 URL**: `http://localhost:3000`

### 프로덕션 빌드

```bash
cd apps/web
npm run build
npm run start
```

프로덕션 빌드는 `apps/web/.next` 디렉토리에 생성됩니다.

---

## 환경 변수

프로젝트 루트 또는 `apps/web` 디렉토리에 `.env.local` 파일을 생성합니다:

```bash
# API 서버 URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# 애플리케이션 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**주의**: 
- `NEXT_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능합니다.
- 환경 변수 변경 시 개발 서버를 재시작해야 합니다.

---

## 주요 패턴

### Server Component에서 데이터 페칭

```typescript
// app/users/page.tsx (Server Component)
import { fetchUsers } from '@/services/users';

export default async function UsersPage() {
  const users = await fetchUsers({ page: 1, limit: 20 });
  
  return <UserList users={users.items} />;
}
```

**주의**: Server Component에서는 `'use client'` 지시어를 사용하지 않습니다.

### Client Component에서 상태 관리

```typescript
'use client';
import { useState, useEffect } from 'react';
import { fetchUsers } from '@/services/users';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUsers({ page: 1, limit: 20 })
      .then(data => {
        setUsers(data.items);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  return <UserList users={users} />;
}
```

### 페이지네이션 처리

```typescript
'use client';
import { useState } from 'react';
import { fetchUsers } from '@/services/users';
import type { ApiMeta } from '@/types/api';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  
  useEffect(() => {
    fetchUsers({ page, limit: 20 }).then(data => {
      setUsers(data.items);
      setMeta(data.meta);
    });
  }, [page]);
  
  return (
    <div>
      <UserList users={users} />
      <Pagination
        currentPage={page}
        totalPages={meta?.totalPages || 1}
        onPageChange={setPage}
        canGoPrev={meta?.hasPrev || false}
        canGoNext={meta?.hasNext || false}
      />
    </div>
  );
}
```

### 검색 및 필터링

```typescript
'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchUsers } from '@/services/users';
import { debounce } from '@/lib/utils';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'INFLUENCER' | 'ADVERTISER' | undefined>();
  const [users, setUsers] = useState([]);
  
  // 검색어 디바운싱
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      fetchUsers({ search: value, role }).then(data => setUsers(data.items));
    }, 300),
    [role]
  );
  
  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);
  
  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="검색..."
      />
      <select value={role} onChange={e => setRole(e.target.value as any)}>
        <option value="">전체</option>
        <option value="INFLUENCER">인플루언서</option>
        <option value="ADVERTISER">광고주</option>
      </select>
      <UserList users={users} />
    </div>
  );
}
```

---

## 개발 체크리스트

새 기능을 추가할 때 다음 순서를 따릅니다:

1. ✅ **API 엔드포인트 확인** - `docs/api-spec.md` 참고
2. ✅ **서비스 함수 작성** - `services/xxx.ts`에 API 호출 로직 추가
3. ✅ **타입 정의** - `types/api.ts`에 필요한 타입 추가
4. ✅ **UI 컴포넌트 작성** - `app/*` 또는 `components/*`에 UI 구현
5. ✅ **SDK 재생성** - API 스키마 변경 시 `npm run sdk:generate` 실행

### 주의사항

- ❌ **UI에서 직접 SDK import 금지** - Semgrep 규칙 위반
- ✅ **Server Component에서 `fetch` 사용 시** - `cache`, `next.revalidate` 옵션 명시
- ✅ **SDK 스키마 변경 시** - `npm run sdk:generate` 후 `services/*` 업데이트
- ✅ **에러 처리** - 401 Unauthorized는 정상적인 응답일 수 있음 (로그인하지 않은 상태)

---

## 코드 품질 검증

### 린팅 및 타입 검사

```bash
# 전체 프로젝트 린팅
npm run lint

# 타입 검사
npm run type-check

# 레이어 규칙 검사 (Semgrep)
npm run semgrep
```

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
- 코드 품질을 일정 수준 이상 유지

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

**허용되는 타입**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Semgrep - 정적 분석 도구

**Semgrep**은 아키텍처 규칙 위반을 자동으로 감지합니다.

**위치**: `.semgrep/layered.yml`

**검사하는 규칙**:

1. **React 컴포넌트는 서비스 레이어를 통해서만 SDK 사용**
   - 검사 대상: `/apps/web/src/app/**`, `/apps/web/src/components/**`, `/apps/web/src/hooks/**`
   - 금지: `import { apiClient } from '@all-influencer/sdk'`
   - 허용: `import { fetchUsers } from '@/services/users'`
   - 예외: `/apps/web/src/lib/**`, `/apps/web/src/services/**`

**실행**:
```bash
npm run semgrep
```

### 권장 사항

- **컴포넌트 테스트**: 스냅샷 테스트 또는 React Testing Library 사용
- **E2E 테스트**: Playwright 또는 Cypress (추후 추가 예정)
- **Storybook**: 컴포넌트 문서화 (추후 추가 예정)

---

## 문제 해결

### SDK 타입 오류

```bash
# SDK 재생성
npm run sdk:generate

# 타입 재확인
npm run type-check
```

### API 연결 실패

1. 백엔드 서버가 실행 중인지 확인 (`npm run dev:api`)
2. `NEXT_PUBLIC_API_URL` 환경 변수 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인
4. CORS 오류인 경우 백엔드 `CORS_ORIGIN` 설정 확인

### 401 Unauthorized 오류

- 로그인하지 않은 상태에서 인증이 필요한 API를 호출하면 정상적인 응답입니다.
- `services/*` 레이어에서 401 오류를 적절히 처리하세요:

```typescript
try {
  const response = await apiClient.getUsers();
  return response.data;
} catch (error) {
  // 401은 정상 (로그인하지 않은 상태)
  if (error instanceof Error && error.message.includes('401')) {
    return { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
  throw error;
}
```

### 빌드 오류

```bash
# .next 디렉토리 삭제 후 재빌드
rm -rf apps/web/.next
npm run build
```

---

## 공유 패키지 (packages/)

프론트엔드에서 사용하는 공유 패키지들입니다. 모노레포의 `packages/` 폴더에서 관리됩니다.

### 패키지 목록

| 패키지 | 이름 | 용도 | 사용 위치 |
| --- | --- | --- | --- |
| **sdk** | `@all-influencer/sdk` | API 클라이언트 (자동 생성) | `apps/web/src/services/*` |
| **types** | `@all-influencer/types` | 공통 TypeScript 타입 | `apps/web/src/types/*` |
| **utils** | `@all-influencer/utils` | 유틸리티 함수 | `apps/web/src/app/*` |
| **ui** | `@all-influencer/ui` | 공용 React 컴포넌트 | `apps/web` (향후 사용 예정) |

### @all-influencer/sdk - API 클라이언트

**위치**: `packages/sdk/`

**용도**:
- 백엔드 OpenAPI 스펙에서 자동 생성된 타입 안전 API 클라이언트
- Axios 기반 HTTP 클라이언트
- JWT 토큰 관리 (httpOnly 쿠키)
- 자동 타입 추론

**주요 파일**:
- `src/client.ts`: Axios 인스턴스 및 API 메서드
- `src/api-types.ts`: OpenAPI에서 생성된 타입 정의 (자동 생성)
- `scripts/generate-client.ts`: SDK 자동 생성 스크립트

**사용 예시**:
```typescript
// apps/web/src/services/users.ts
import { apiClient } from '@all-influencer/sdk';

export async function fetchUsers(params) {
  const response = await apiClient.getUsers(params);
  return response.data;
}
```

**관리 방법**:
```bash
# SDK 재생성 (백엔드 API 변경 시)
npm run sdk:generate

# 빌드
cd packages/sdk && npm run build
```

**주의사항**:
- `src/api-types.ts`와 `src/client.ts`는 **자동 생성 파일**입니다
- 수동으로 수정하면 안 됩니다
- 백엔드 API 변경 시 `npm run sdk:generate` 실행 필요

### @all-influencer/types - 타입 정의

**위치**: `packages/types/`

**용도**:
- 프론트엔드와 백엔드 간 공유되는 TypeScript 타입
- API 요청/응답 타입
- 도메인 모델 타입

**주요 파일**:
- `src/api.ts`: API 응답 타입 (`ApiResponse`, `ApiError` 등)
- `src/common.ts`: 공통 타입 (`PaginatedResponse`, `ApiMeta` 등)
- `src/user.ts`: 사용자 관련 타입

**사용 예시**:
```typescript
// apps/web/src/types/api.ts
import type { UserRole, UserStatus } from '@all-influencer/types';
```

**관리 방법**:
```bash
# 빌드
cd packages/types && npm run build

# 타입 체크
cd packages/types && npm run type-check
```

### @all-influencer/utils - 유틸리티 함수

**위치**: `packages/utils/`

**용도**:
- 날짜 포맷팅 (`formatDate`, `formatRelativeTime`)
- 가격 포맷팅 (`formatPrice`, `formatCurrency`)
- 문자열 유틸리티 (`slugify`, `capitalize`)

**주요 파일**:
- `src/date.ts`: 날짜 관련 유틸리티
- `src/price.ts`: 가격 포맷팅
- `src/string.ts`: 문자열 유틸리티

**사용 예시**:
```typescript
// apps/web/src/app/users/page.tsx
import { formatDate } from '@all-influencer/utils';
```

### @all-influencer/ui - UI 컴포넌트

**위치**: `packages/ui/`

**용도**:
- 재사용 가능한 React 컴포넌트
- Tailwind CSS 기반 스타일링
- CVA (Class Variance Authority)를 사용한 variant 관리

**주요 컴포넌트**:
- `Button`: 버튼 컴포넌트 (variants: primary, secondary, outline 등)
- `Input`: 입력 필드 (validation states)
- `Card`: 카드 레이아웃
- `Typography`: 텍스트 스타일링

**현재 상태**: `apps/web`에서 사용되지 않음 (향후 사용 예정)

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
cd ../../apps/web
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
cd apps/web && npm run type-check
```

---

더 자세한 내용은 [rules.md](../rules.md)와 [api-spec.md](./api-spec.md)를 참고하세요.
