CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DROP (dev 편의)
DROP TABLE IF EXISTS notifications       CASCADE;
DROP TABLE IF EXISTS messages            CASCADE;
DROP TABLE IF EXISTS ratings_reviews     CASCADE;
DROP TABLE IF EXISTS payments            CASCADE;
DROP TABLE IF EXISTS post_links          CASCADE;
DROP TABLE IF EXISTS content_submissions CASCADE;
DROP TABLE IF EXISTS bookings            CASCADE;
DROP TABLE IF EXISTS contracts           CASCADE;
DROP TABLE IF EXISTS campaign_applications CASCADE;
DROP TABLE IF EXISTS campaign_deliverables CASCADE;
DROP TABLE IF EXISTS campaigns           CASCADE;
DROP TABLE IF EXISTS analytics_snapshots CASCADE;
DROP TABLE IF EXISTS social_accounts     CASCADE;
DROP TABLE IF EXISTS influencer_categories CASCADE;
DROP TABLE IF EXISTS categories          CASCADE;
DROP TABLE IF EXISTS brand_profiles      CASCADE;
DROP TABLE IF EXISTS influencer_profiles CASCADE;
DROP TABLE IF EXISTS users               CASCADE;

-- USERS
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('influencer','brand','admin')),
  display_name    TEXT NOT NULL,
  phone           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INFLUENCER / BRAND PROFILE
CREATE TABLE influencer_profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  handle          TEXT UNIQUE NOT NULL,
  bio             TEXT,
  gender          TEXT CHECK (gender IN ('male','female','other') OR gender IS NULL),
  birthdate       DATE,
  location        TEXT,
  min_price_per_post NUMERIC(12,2) DEFAULT 0,
  availability_status TEXT DEFAULT 'open' -- open, busy, vacation
);

CREATE TABLE brand_profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL,
  website         TEXT,
  industry        TEXT,
  description     TEXT,
  budget_min      NUMERIC(12,2),
  budget_max      NUMERIC(12,2)
);

-- CATEGORY & M2M
CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  name            TEXT UNIQUE NOT NULL
);

CREATE TABLE influencer_categories (
  influencer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (influencer_id, category_id)
);

-- SOCIAL ACCOUNTS
CREATE TABLE social_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('youtube','instagram','tiktok','x','blog')),
  username        TEXT NOT NULL,
  url             TEXT,
  followers_count BIGINT NOT NULL DEFAULT 0,
  avg_engagement_rate NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_accounts_influencer ON social_accounts(influencer_id);

-- DAILY ANALYTICS SNAPSHOTS
CREATE TABLE analytics_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  snapshot_date     DATE NOT NULL,
  followers         BIGINT,
  impressions       BIGINT,
  engagements       BIGINT,
  likes             BIGINT,
  comments          BIGINT,
  shares            BIGINT,
  views             BIGINT,
  UNIQUE (social_account_id, snapshot_date)
);

-- CAMPAIGNS
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  budget_total    NUMERIC(12,2),
  currency        TEXT NOT NULL DEFAULT 'KRW',
  start_date      DATE,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'draft' -- draft, open, closed, completed, cancelled
);
CREATE INDEX idx_campaigns_brand_status ON campaigns(brand_id, status);

-- DELIVERABLES
CREATE TABLE campaign_deliverables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('post','short','story','reel','live','blog','x_post','other')),
  description     TEXT,
  quantity        INT NOT NULL DEFAULT 1,
  due_days        INT NOT NULL DEFAULT 7
);

-- APPLICATIONS
CREATE TABLE campaign_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch           TEXT,
  proposed_price  NUMERIC(12,2),
  status          TEXT NOT NULL DEFAULT 'applied' -- applied, shortlisted, accepted, rejected, withdrawn
                 CHECK (status IN ('applied','shortlisted','accepted','rejected','withdrawn')),
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, influencer_id)
);

-- CONTRACTS
CREATE TABLE contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreed_price    NUMERIC(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'KRW',
  terms           TEXT,
  signed_at       TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending' -- pending, active, completed, cancelled
                 CHECK (status IN ('pending','active','completed','cancelled'))
);

-- BOOKINGS (작업/촬영/게시 스케줄)
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  deliverable_id  UUID REFERENCES campaign_deliverables(id) ON DELETE SET NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  timezone        TEXT NOT NULL DEFAULT 'Asia/Seoul',
  status          TEXT NOT NULL DEFAULT 'scheduled' -- scheduled, in_progress, done, no_show, cancelled
                 CHECK (status IN ('scheduled','in_progress','done','no_show','cancelled'))
);

-- CONTENT SUBMISSIONS
CREATE TABLE content_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  deliverable_id  UUID REFERENCES campaign_deliverables(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  url             TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'submitted' -- submitted, approved, changes_requested, rejected
                 CHECK (status IN ('submitted','approved','changes_requested','rejected')),
  revision        INT NOT NULL DEFAULT 0
);

CREATE TABLE post_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('youtube','instagram','tiktok','x','blog')),
  url             TEXT NOT NULL,
  posted_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PAYMENTS
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'KRW',
  direction       TEXT NOT NULL CHECK (direction IN ('payout','refund')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at         TIMESTAMPTZ,
  external_ref    TEXT
);

-- RATINGS & REVIEWS
CREATE TABLE ratings_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MESSAGES
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  contract_id     UUID REFERENCES contracts(id) ON DELETE SET NULL,
  from_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  body            TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  data            JSONB,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
