# All Influencer API 사양서

본 문서는 `apps/api` NestJS 애플리케이션의 HTTP API 엔드포인트를 정리한 사양서입니다.  
모든 API는 기본 경로 `/api/v1`을 사용하며, 인증이 필요한 엔드포인트는 JWT 토큰을 httpOnly 쿠키로 전송합니다.

## 목차

- [기본 정보](#기본-정보)
- [인증 및 세션 관리](#인증-및-세션-관리)
- [사용자 관리](#사용자-관리)
- [인플루언서 마이페이지](#인플루언서-마이페이지)
- [광고주 마이페이지](#광고주-마이페이지)
- [API 사용 예시](#api-사용-예시)
- [업데이트 이력](#업데이트-이력)

---

## 기본 정보

- **Base URL**: `http://localhost:3001/api/v1` (개발 환경)
- **인증 방식**: JWT (Access Token + Refresh Token, httpOnly 쿠키)
- **응답 형식**: `{ success: boolean, data?: T, message?: string }` (ResponseInterceptor 적용)
- **문서**: Swagger UI - `http://localhost:3001/api-docs`
- **Content-Type**: `application/json`
- **에러 응답**: `{ success: false, message: string, statusCode: number }`

---

## 인증 및 세션 관리 (`/auth`)

인증 관련 엔드포인트입니다. 토큰은 httpOnly 쿠키로 관리되며, 바디에는 빈 문자열이 반환됩니다.

### 회원가입

**POST** `/auth/signup`

**설명**: 이메일과 비밀번호로 회원가입합니다. 성공 시 JWT 쿠키가 설정됩니다.

**요청**:
```typescript
{
  email: string;
  password: string;
  username: string;
  displayName: string;
  role?: 'INFLUENCER' | 'ADVERTISER';
}
```

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
      role: string;
      avatar: string | null;
    };
    accessToken: '';  // 쿠키로 전송
    refreshToken: ''; // 쿠키로 전송
    expiresIn: 900;   // 15분
  };
}
```

### 로그인

**POST** `/auth/login`

**설명**: 이메일과 비밀번호로 로그인합니다. 성공 시 JWT 쿠키가 설정됩니다.

**요청**:
```typescript
{
  email: string;
  password: string;
}
```

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
      role: string;
      avatar: string | null;
    };
    accessToken: '';  // 쿠키로 전송
    refreshToken: ''; // 쿠키로 전송
    expiresIn: 900;   // 15분
  };
}
```

### 토큰 갱신

**POST** `/auth/refresh`

**설명**: Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급합니다.

**요청**: 쿠키의 `refresh_token` 사용 (바디 없음)

**응답**: `200 OK`
```typescript
{
  success: true;
  message: '토큰이 갱신되었습니다.';
}
```

**쿠키**: 새로운 `access_token`과 `refresh_token`이 설정됩니다.

### 로그아웃

**POST** `/auth/logout`

**설명**: 현재 세션을 로그아웃합니다. JWT Guard 필요.

**요청**: JWT Guard (쿠키의 `access_token` 사용)

**응답**: `200 OK`
```typescript
{
  success: true;
  message: '로그아웃되었습니다.';
}
```

**쿠키**: `access_token`과 `refresh_token` 쿠키가 삭제됩니다.

### 전체 세션 로그아웃

**POST** `/auth/logout-all`

**설명**: 사용자의 모든 활성 세션을 로그아웃합니다. JWT Guard 필요.

**요청**: JWT Guard

**응답**: `200 OK`
```typescript
{
  success: true;
  sessionCount: number;  // 로그아웃된 세션 수
}
```

### 현재 사용자 정보

**GET** `/auth/me`

**설명**: 현재 로그인한 사용자 정보를 조회합니다. JWT Guard 필요.

**요청**: JWT Guard

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string;
      avatar: string | null;
      role: 'INFLUENCER' | 'ADVERTISER' | 'ADMIN';
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      bio: string | null;
      website: string | null;
      lastLoginAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
    identities: Array<{
      provider: 'GOOGLE' | 'KAKAO' | 'NAVER';
      email: string | null;
      linkedAt: Date;
    }>;
  };
}
```

### 활성 세션 목록

**GET** `/auth/sessions`

**설명**: 현재 사용자의 활성 세션 목록을 조회합니다. JWT Guard 필요.

**요청**: JWT Guard

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    activeSessionCount: number;
  };
}
```

---

## 사용자 관리 (`/users`)

사용자 CRUD 및 목록 조회 엔드포인트입니다.

### 사용자 목록 조회

**GET** `/users`

**설명**: 사용자 목록을 페이지네이션, 필터링, 검색으로 조회합니다. `@Public()` 데코레이터로 인증 불필요.

**Query Parameters**:
- `page?: number` (기본값: 1)
- `limit?: number` (기본값: 20)
- `role?: 'INFLUENCER' | 'ADVERTISER' | 'ADMIN'`
- `status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'`
- `search?: string` (이메일, 이름, 자기소개 검색)

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    items: Array<{
      id: string;
      email: string | null;
      displayName: string | null;
      avatar: string | null;
      role: string;
      status: string;
      bio: string | null;
      website: string | null;
      createdAt: Date;
      updatedAt: Date;
      lastLoginAt: Date | null;
    }>;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

### 사용자 생성

**POST** `/users`

**설명**: 새 사용자를 생성합니다. JWT Guard 필요.

**요청**:
```typescript
{
  email: string;
  username: string;
  password: string;
  displayName: string;
  role?: 'INFLUENCER' | 'ADVERTISER' | 'ADMIN';
  bio?: string;
  website?: string;
}
```

**응답**: `201 Created`
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    role: string;
    status: string;
    // ... 기타 필드
  };
}
```

### 사용자 상세 조회

**GET** `/users/:id`

**설명**: 특정 사용자의 상세 정보를 조회합니다. JWT Guard 필요.

**Path Parameters**:
- `id: string` (사용자 ID)

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatar: string | null;
    role: string;
    status: string;
    bio: string | null;
    website: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  };
}
```

### 사용자 정보 수정

**PATCH** `/users/:id`

**설명**: 사용자 정보를 수정합니다. JWT Guard 필요. 본인 또는 ADMIN만 수정 가능.

**Path Parameters**:
- `id: string` (사용자 ID)

**요청**:
```typescript
{
  displayName?: string;
  bio?: string;
  website?: string;
  avatar?: string;
}
```

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    // 업데이트된 사용자 정보
  };
}
```

### 사용자 삭제

**DELETE** `/users/:id`

**설명**: 사용자를 삭제합니다. JWT Guard 필요. ADMIN만 삭제 가능.

**Path Parameters**:
- `id: string` (사용자 ID)

**응답**: `200 OK`
```typescript
{
  success: true;
  message: '사용자가 삭제되었습니다.';
}
```

---

## 인플루언서 마이페이지 (`/my/influencer`)

인플루언서 전용 마이페이지 엔드포인트입니다. `JWT Guard`와 `ROLE=INFLUENCER` 권한이 필요합니다.

### 대시보드 요약

**GET** `/my/influencer/overview`

**설명**: 인플루언서 대시보드 요약 정보를 조회합니다.

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    profile: {
      headline: string | null;
      bio: string | null;
      categories: string[];
      followers: number;
      avgEngagement: number;
      ratePerPost: number | null;
      location: string | null;
      languages: string[];
      skills: string[];
      portfolioUrls: string[];
    };
    applications: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
      withdrawn: number;
    };
    scraps: {
      count: number;
    };
    stats: {
      totalFollowers: number;
      completedContracts: number;
      avgRating: number | null;
    };
  };
}
```

### 지원 목록

**GET** `/my/influencer/applications`

**설명**: 인플루언서의 지원 목록을 조회합니다.

**Query Parameters**:
- `status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'`
- `cursor?: string` (페이지네이션 커서)
- `limit?: number` (기본값: 20)

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    items: Array<{
      id: string;
      jobPost: {
        id: string;
        title: string;
        company: string;
        budget: number | null;
      };
      coverLetter: string | null;
      proposedRate: number | null;
      status: string;
      createdAt: Date;
    }>;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

### 스크랩 목록

**GET** `/my/influencer/scraps`

**설명**: 인플루언서가 스크랩한 공고 목록을 조회합니다.

**Query Parameters**:
- `cursor?: string`
- `limit?: number` (기본값: 20)

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    items: Array<{
      id: string;
      jobPost: {
        id: string;
        title: string;
        description: string;
        budget: number | null;
        categories: string[];
        platforms: string[];
        deadline: Date | null;
        status: string;
      };
      createdAt: Date;
    }>;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

### 스크랩 추가

**POST** `/my/influencer/scraps`

**설명**: 공고를 스크랩합니다.

**요청**:
```typescript
{
  jobPostId: string;
}
```

**응답**: `201 Created`
```typescript
{
  success: true;
  message: '스크랩되었습니다.';
}
```

### 스크랩 삭제

**DELETE** `/my/influencer/scraps/:scrapId`

**설명**: 스크랩을 삭제합니다.

**Path Parameters**:
- `scrapId: string`

**응답**: `200 OK`
```typescript
{
  success: true;
  message: '스크랩이 삭제되었습니다.';
}
```

---

## 광고주 마이페이지 (`/my/advertiser`)

광고주 전용 마이페이지 엔드포인트입니다. `JWT Guard`와 `ROLE=ADVERTISER` 권한이 필요합니다.

### 대시보드 요약

**GET** `/my/advertiser/overview`

**설명**: 광고주 대시보드 요약 정보를 조회합니다.

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    company: {
      name: string;
      industry: string;
      description: string | null;
    };
    jobPosts: {
      total: number;
      open: number;
      closed: number;
      completed: number;
      cancelled: number;
    };
    recentStats: {
      recentApplications: number;  // 최근 30일
      activeContracts: number;
      avgRating: number | null;
    };
  };
}
```

### 구인공고 목록

**GET** `/my/advertiser/job-posts`

**설명**: 광고주의 구인공고 목록을 조회합니다.

**Query Parameters**:
- `status?: 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'`
- `cursor?: string`
- `limit?: number` (기본값: 20)

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      budget: number | null;
      categories: string[];
      platforms: string[];
      deadline: Date | null;
      status: string;
      createdAt: Date;
    }>;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

### 지원자 목록

**GET** `/my/advertiser/job-posts/:jobPostId/applicants`

**설명**: 특정 공고의 지원자 목록을 조회합니다.

**Path Parameters**:
- `jobPostId: string`

**Query Parameters**:
- `status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'`
- `cursor?: string`
- `limit?: number` (기본값: 20)

**응답**: `200 OK`
```typescript
{
  success: true;
  data: {
    jobPost: {
      id: string;
      title: string;
      description: string;
    };
    items: Array<{
      id: string;
      user: {
        id: string;
        displayName: string;
        avatar: string | null;
      };
      coverLetter: string | null;
      proposedRate: number | null;
      status: string;
      createdAt: Date;
    }>;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

---

## API 사용 예시

### 프론트엔드에서 사용자 목록 조회

```typescript
// apps/web/src/services/users.ts
import { apiClient } from '@all-influencer/sdk';

export async function fetchUsers(params: FetchUsersParams) {
  const response = await apiClient.getUsers({
    page: params.page,
    limit: params.limit,
    role: params.role,
    status: params.status,
    search: params.search,
  });
  
  return {
    items: response.data.items,
    meta: response.data.meta,
  };
}
```

### 백엔드에서 사용자 조회

```typescript
// apps/api/src/modules/users/controllers/users.controller.ts
@Get()
@Public()  // 인증 불필요
async getUsers(@Query() query: QueryUsersDto) {
  return await this.usersService.findAll(query);
}
```

### 인증이 필요한 API 호출

```typescript
// 프론트엔드에서 자동으로 httpOnly 쿠키 전송
const response = await apiClient.getMe();
// 쿠키는 브라우저가 자동으로 전송하므로 별도 설정 불필요
```

---

## 업데이트 이력

- **2024-11-15**: 초기 API 사양서 작성 (Auth, Users, Advertiser MyPage)
- **2024-11-XX**: 인플루언서 마이페이지 엔드포인트 추가
- 향후 모듈 추가 시 본 문서를 업데이트합니다.

---

더 자세한 내용은 Swagger UI (`http://localhost:3001/api-docs`)를 참고하세요.
