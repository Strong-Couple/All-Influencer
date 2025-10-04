-- PostgreSQL 초기화 스크립트
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 데이터베이스 설정
ALTER DATABASE allinfluencer SET timezone TO 'Asia/Seoul';
