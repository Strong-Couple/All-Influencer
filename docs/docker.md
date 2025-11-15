# Docker 가이드

이 문서는 프로젝트에서 제공하는 Docker 구성 요소와 사용 방법을 설명합니다.

## 목차

- [구성 파일](#구성-파일)
- [PostgreSQL 컨테이너](#postgresql-컨테이너)
- [컨테이너 상태 확인](#컨테이너-상태-확인)
- [데이터 관리](#데이터-관리)
- [문제 해결](#문제-해결)
- [권장 워크플로우](#권장-워크플로우)

---

## 구성 파일

| 경로 | 설명 |
| --- | --- |
| `docker-compose.yml` | PostgreSQL 컨테이너 (루트 디렉토리) |

현재 필수 요소는 PostgreSQL 컨테이너입니다. API/웹 앱은 로컬 Node 프로세스로 실행하는 것이 기본입니다.

---

## PostgreSQL 컨테이너

### 기본 명령

```bash
# 컨테이너 시작
npm run db:up

# 컨테이너 종료 + 볼륨 삭제
npm run db:down

# 로그 확인
npm run db:logs

# 컨테이너 재시작
docker compose restart postgres
```

### 컨테이너 설정

`docker-compose.yml` 주요 설정:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: allinfluencer-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: allinfluencer
      POSTGRES_USER: allinfluencer
      POSTGRES_PASSWORD: allinfluencer
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql:/sql:ro  # SQL 스크립트 마운트
```

**주요 설정**:
- **이미지**: `postgres:16-alpine` (경량 PostgreSQL 16)
- **포트**: `5432:5432` (호스트:컨테이너)
- **환경변수**: 데이터베이스, 사용자, 비밀번호
- **볼륨**: 
  - `postgres_data`: 데이터 영구 저장
  - `./sql`: SQL 스크립트 읽기 전용 마운트

### 접속 정보

| 항목 | 값 |
| --- | --- |
| Host | localhost |
| Port | 5432 |
| Database | allinfluencer |
| Username | allinfluencer |
| Password | allinfluencer |
| Connection String | `postgresql://allinfluencer:allinfluencer@localhost:5432/allinfluencer` |

---

## 컨테이너 상태 확인

### 기본 명령

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a

# 컨테이너 상세 정보
docker inspect allinfluencer-postgres

# 컨테이너 로그 확인
docker logs allinfluencer-postgres

# 실시간 로그 스트리밍
docker logs -f allinfluencer-postgres
```

### 컨테이너 내부 접속

```bash
# PostgreSQL CLI 접속
docker exec -it allinfluencer-postgres psql -U allinfluencer -d allinfluencer

# SQL 명령 실행
docker exec -i allinfluencer-postgres psql -U allinfluencer -d allinfluencer -c "SELECT version();"

# SQL 파일 실행
docker exec -i allinfluencer-postgres psql -U allinfluencer -d allinfluencer -f /sql/001_schema.sql
```

---

## 데이터 관리

### 볼륨 관리

```bash
# 볼륨 목록 확인
docker volume ls

# 볼륨 상세 정보
docker volume inspect all-influencer_postgres_data

# 볼륨 삭제 (주의: 데이터 삭제)
docker volume rm all-influencer_postgres_data
```

### 데이터 백업

```bash
# 덤프 생성
docker exec allinfluencer-postgres pg_dump -U allinfluencer allinfluencer > backup_$(date +%Y%m%d).sql

# 덤프 복구
docker exec -i allinfluencer-postgres psql -U allinfluencer -d allinfluencer < backup_20241115.sql
```

### 데이터 초기화

```bash
# 컨테이너 및 볼륨 완전 삭제
npm run db:down

# 볼륨 수동 삭제 (필요 시)
docker volume rm all-influencer_postgres_data

# 재시작 및 마이그레이션
npm run db:up
npm run db:migrate
npm run db:seed
```

---

## 문제 해결

### 포트 충돌 (5432)

**증상**: `Error: listen EADDRINUSE: address already in use :::5432`

**해결 방법**:

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :5432

# 프로세스 종료
kill -9 <PID>

# 또는 다른 PostgreSQL 서비스 중지
brew services stop postgresql  # macOS Homebrew
sudo systemctl stop postgresql  # Linux
```

### 컨테이너가 시작되지 않음

**증상**: `docker ps`에서 컨테이너가 보이지 않음

**해결 방법**:

```bash
# 컨테이너 로그 확인
docker logs allinfluencer-postgres

# 컨테이너 재시작
docker compose restart postgres

# 완전 재시작
npm run db:down
npm run db:up
```

### 데이터베이스 연결 실패

**증상**: 애플리케이션에서 데이터베이스 연결 오류

**해결 방법**:

```bash
# 컨테이너 상태 확인
docker ps | grep postgres

# 컨테이너 내부에서 연결 테스트
docker exec -it allinfluencer-postgres psql -U allinfluencer -d allinfluencer -c "SELECT 1;"

# 환경 변수 확인
cat apps/api/.env | grep DATABASE_URL
```

### 볼륨 권한 오류

**증상**: `Permission denied` 오류

**해결 방법**:

```bash
# 볼륨 권한 확인
docker volume inspect all-influencer_postgres_data

# 컨테이너 재생성
npm run db:down
npm run db:up
```

---

## 권장 워크플로우

### 개발 시작 시

```bash
# 1. 데이터베이스 컨테이너 시작
npm run db:up

# 2. 환경 변수 설정 확인
cat apps/api/.env | grep DATABASE_URL

# 3. Prisma Client 생성
cd apps/api && npm run db:generate

# 4. 애플리케이션 실행
npm run dev
```

### 개발 종료 시

```bash
# 컨테이너 유지 (데이터 보존)
# 아무 작업 없음

# 또는 데이터 초기화가 필요한 경우
npm run db:down
```

### 프로덕션 배포 시

- Docker Compose를 사용하지 않고, 관리형 PostgreSQL 서비스 (AWS RDS, Google Cloud SQL 등) 사용 권장
- 환경 변수 `DATABASE_URL`을 프로덕션 데이터베이스로 변경

---

## 데이터베이스 관리 도구

### DBeaver 사용 (권장)

DBeaver는 강력한 데이터베이스 관리 도구입니다:

**연결 정보**:
- **Host**: localhost
- **Port**: 5432
- **Database**: allinfluencer
- **Username**: allinfluencer
- **Password**: allinfluencer

**설치**: [DBeaver 공식 사이트](https://dbeaver.io/download/)

### Prisma Studio

Prisma Studio는 Prisma 스키마 기반 데이터베이스 GUI입니다:

```bash
cd apps/api
npx prisma studio
```

**URL**: http://localhost:5555

## 전체 스택 실행

**현재 권장 방식**:
- 데이터베이스: Docker 컨테이너 (`docker-compose.yml`)
- API/웹: 로컬 Node 프로세스 (`npm run dev`)

이 방식의 장점:
- 빠른 개발 속도 (Hot Reload)
- 디버깅 용이
- 로컬 환경과 유사

추후 API/웹도 컨테이너로 묶을 수 있도록 `docker-compose.yml`에 서비스를 추가할 수 있습니다.

---

Docker Desktop 혹은 CLI 로그에서 에러가 발생하면 `docs/db.md`를 함께 참고하세요.
