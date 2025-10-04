# All-Influencer 플랫폼 PostgreSQL 개발 DB

올인플루언서 플랫폼의 PostgreSQL 데이터베이스 개발 환경 설정 및 사용법입니다.

## 📋 구성 요소

- **PostgreSQL 15**: 메인 데이터베이스
- **Adminer 4**: 웹 기반 DB 관리 도구
- **Docker Compose**: 컨테이너 오케스트레이션

## 🚀 빠른 시작

### 1️⃣ 컨테이너 시작

```bash
npm run db:up
```

### 2️⃣ SQL 파일 컨테이너로 복사

```bash
docker cp db/sql/001_schema.sql allinfluencer-postgres:/sql/001_schema.sql
docker cp db/sql/002_seed.sql allinfluencer-postgres:/sql/002_seed.sql
```

### 3️⃣ 스키마 생성

```bash
npm run db:migrate
```

### 4️⃣ 더미 데이터 생성

```bash
npm run db:seed
```

### 5️⃣ Adminer 접속 (웹 UI)

- **URL**: http://localhost:8080
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: allinfluencer
- **Password**: allinfluencer
- **Database**: allinfluencer

## 📊 데이터베이스 구조

### 핵심 테이블

- **users**: 사용자 (인플루언서/브랜드/관리자)
- **influencer_profiles**: 인플루언서 프로필
- **brand_profiles**: 브랜드 프로필
- **campaigns**: 캠페인
- **social_accounts**: 소셜 미디어 계정
- **contracts**: 계약
- **payments**: 결제/정산

### 관계형 테이블

- **influencer_categories**: 인플루언서-카테고리 매핑
- **campaign_applications**: 캠페인 지원
- **content_submissions**: 콘텐츠 제출
- **ratings_reviews**: 평가/리뷰

## 🛠️ 유용한 명령어

### 컨테이너 관리

```bash
# 컨테이너 시작
npm run db:up

# 컨테이너 중지 (데이터 삭제)
npm run db:down

# 로그 확인
npm run db:logs

# 컨테이너 상태 확인
docker ps
```

### 직접 DB 접속

```bash
# PostgreSQL CLI 접속
docker exec -it allinfluencer-postgres psql -U allinfluencer -d allinfluencer

# SQL 파일 직접 실행
docker exec -i allinfluencer-postgres psql -U allinfluencer -d allinfluencer < db/sql/001_schema.sql
```

## 🔍 검증 쿼리

데이터가 올바르게 생성되었는지 확인하는 쿼리들:

```sql
-- 사용자 수 확인
SELECT COUNT(*) FROM users;
-- 결과: 5명 (인플루언서 2, 브랜드 2, 관리자 1)

-- 캠페인 목록 확인
SELECT title, status FROM campaigns;
-- 결과: '여름 프로모션 숏폼', '결제앱 신규유저 유치'

-- 소셜 계정 확인
SELECT * FROM social_accounts LIMIT 5;
-- 결과: 인플루언서들의 YouTube/Instagram 계정

-- 분석 스냅샷 확인
SELECT COUNT(*) FROM analytics_snapshots;
-- 결과: 3개 (3일간 데이터)

-- 계약 상태 확인
SELECT agreed_price, status FROM contracts;
-- 결과: 1,200,000 KRW 활성 계약

-- 결제 상태 확인
SELECT amount, direction, status FROM payments;
-- 결과: 지급 완료된 정산 내역
```

## 📁 파일 구조

```
db/
├── postgres/
│   └── docker-compose.yml    # Docker 설정
├── sql/
│   ├── 001_schema.sql        # 스키마 생성
│   └── 002_seed.sql          # 더미 데이터
├── data/                     # PostgreSQL 데이터 볼륨
└── README.md                 # 이 파일
```

## 🔒 연결 정보

### PostgreSQL 연결

```
Host: localhost
Port: 5433
Database: allinfluencer
Username: allinfluencer
Password: allinfluencer
```

### Adminer 웹 접속

```
URL: http://localhost:8080
System: PostgreSQL
Server: postgres (컨테이너 이름)
Username: allinfluencer
Password: allinfluencer
Database: allinfluencer
```

## ⚠️ 주의사항

1. **데이터 영속성**: `db/data/` 디렉터리에 데이터가 저장됩니다.
2. **포트 충돌**: 5432, 8080 포트가 사용 중이면 충돌할 수 있습니다.
3. **개발 환경**: 프로덕션 환경에서는 보안 설정을 강화해야 합니다.

## 🧹 초기화

데이터베이스를 완전히 초기화하려면:

```bash
# 1. 컨테이너 및 볼륨 삭제
npm run db:down

# 2. 데이터 디렉터리 삭제 (선택)
rm -rf db/data

# 3. 다시 시작
npm run db:up

# 4. 마이그레이션/시드 재실행
npm run db:migrate
npm run db:seed
```

## 📚 추가 리소스

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Adminer 사용법](https://www.adminer.org/)
- [Docker Compose 가이드](https://docs.docker.com/compose/)
