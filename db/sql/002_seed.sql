-- USERS
INSERT INTO users (email, password_hash, role, display_name, phone) VALUES
('influencer1@example.com', 'hash_influencer1', 'influencer', '마다다1', '010-1111-2222'),
('influencer2@example.com', 'hash_influencer2', 'influencer', '마다다2', '010-3333-4444'),
('brand1@example.com',      'hash_brand1',      'brand',      '브랜드A', '02-111-2222'),
('brand2@example.com',      'hash_brand2',      'brand',      '브랜드B', '02-333-4444'),
('admin@example.com',       'hash_admin',       'admin',      '관리자',  NULL);

-- INFLUENCER PROFILES
INSERT INTO influencer_profiles (user_id, handle, bio, gender, location, min_price_per_post, availability_status)
SELECT id, 'madada1', '경제/테크 이슈 해설', 'male', 'Seoul', 300000, 'open' FROM users WHERE email='influencer1@example.com';
INSERT INTO influencer_profiles (user_id, handle, bio, gender, location, min_price_per_post, availability_status)
SELECT id, 'madada2', '소비/리뷰 숏폼 전문', 'female', 'Busan', 200000, 'open' FROM users WHERE email='influencer2@example.com';

-- BRAND PROFILES
INSERT INTO brand_profiles (user_id, company_name, website, industry, description, budget_min, budget_max)
SELECT id, 'A컴퍼니', 'https://a.example.com', '전자상거래', 'D2C 가전', 1000000, 10000000 FROM users WHERE email='brand1@example.com';
INSERT INTO brand_profiles (user_id, company_name, website, industry, description, budget_min, budget_max)
SELECT id, 'B컴퍼니', 'https://b.example.com', '핀테크', '모바일 결제 서비스', 500000, 5000000 FROM users WHERE email='brand2@example.com';

-- CATEGORIES
INSERT INTO categories (name) VALUES
('경제'),('테크'),('라이프스타일'),('푸드'),('뷰티'),('게임');

-- INFLUENCER ↔ CATEGORIES
INSERT INTO influencer_categories (influencer_id, category_id)
SELECT u.id, c.id FROM users u, categories c
WHERE u.email='influencer1@example.com' AND c.name IN ('경제','테크');
INSERT INTO influencer_categories (influencer_id, category_id)
SELECT u.id, c.id FROM users u, categories c
WHERE u.email='influencer2@example.com' AND c.name IN ('라이프스타일','뷰티');

-- SOCIAL ACCOUNTS
INSERT INTO social_accounts (influencer_id, platform, username, url, followers_count, avg_engagement_rate)
SELECT u.id, 'youtube', 'madada1_yt', 'https://youtube.com/@madada1', 120000, 5.2 FROM users u WHERE u.email='influencer1@example.com';
INSERT INTO social_accounts (influencer_id, platform, username, url, followers_count, avg_engagement_rate)
SELECT u.id, 'instagram', 'madada1_ig', 'https://instagram.com/madada1', 80000, 4.1 FROM users u WHERE u.email='influencer1@example.com';
INSERT INTO social_accounts (influencer_id, platform, username, url, followers_count, avg_engagement_rate)
SELECT u.id, 'youtube', 'madada2_yt', 'https://youtube.com/@madada2', 90000, 6.0 FROM users u WHERE u.email='influencer2@example.com';

-- ANALYTICS SNAPSHOTS (최근 3일)
INSERT INTO analytics_snapshots (social_account_id, snapshot_date, followers, impressions, engagements, likes, comments, shares, views)
SELECT sa.id, CURRENT_DATE - 2, sa.followers_count-200, 150000, 9000, 7000, 1200, 300, 130000 FROM social_accounts sa WHERE sa.username='madada1_yt';
INSERT INTO analytics_snapshots (social_account_id, snapshot_date, followers, impressions, engagements, likes, comments, shares, views)
SELECT sa.id, CURRENT_DATE - 1, sa.followers_count-100, 170000, 10000, 7900, 1300, 350, 150000 FROM social_accounts sa WHERE sa.username='madada1_yt';
INSERT INTO analytics_snapshots (social_account_id, snapshot_date, followers, impressions, engagements, likes, comments, shares, views)
SELECT sa.id, CURRENT_DATE, sa.followers_count, 180000, 11000, 8500, 1400, 400, 160000 FROM social_accounts sa WHERE sa.username='madada1_yt';

-- CAMPAIGNS
INSERT INTO campaigns (brand_id, title, description, budget_total, currency, start_date, end_date, status)
SELECT u.id, '여름 프로모션 숏폼', '여름 신제품 런칭 숏폼 캠페인', 5000000, 'KRW', CURRENT_DATE, CURRENT_DATE + 30, 'open' FROM users u WHERE u.email='brand1@example.com';
INSERT INTO campaigns (brand_id, title, description, budget_total, currency, start_date, end_date, status)
SELECT u.id, '결제앱 신규유저 유치', '튜토리얼/리뷰 영상', 8000000, 'KRW', CURRENT_DATE, CURRENT_DATE + 45, 'draft' FROM users u WHERE u.email='brand2@example.com';

-- DELIVERABLES (for campaign 1)
INSERT INTO campaign_deliverables (campaign_id, type, description, quantity, due_days)
SELECT c.id, 'short', '15~30초 숏츠', 2, 10 FROM campaigns c WHERE c.title='여름 프로모션 숏폼';
INSERT INTO campaign_deliverables (campaign_id, type, description, quantity, due_days)
SELECT c.id, 'story', '스토리 3컷', 3, 7 FROM campaigns c WHERE c.title='여름 프로모션 숏폼';

-- APPLICATIONS
INSERT INTO campaign_applications (campaign_id, influencer_id, pitch, proposed_price, status)
SELECT c.id, u.id, '테크형 숏폼 구성 제안드립니다.', 700000, 'applied'
FROM campaigns c, users u
WHERE c.title='여름 프로모션 숏폼' AND u.email='influencer1@example.com';

INSERT INTO campaign_applications (campaign_id, influencer_id, pitch, proposed_price, status)
SELECT c.id, u.id, '라이프스타일 톤으로 자연 광고 제작', 600000, 'applied'
FROM campaigns c, users u
WHERE c.title='여름 프로모션 숏폼' AND u.email='influencer2@example.com';

-- CONTRACT (influencer1 accepted)
INSERT INTO contracts (campaign_id, influencer_id, agreed_price, currency, terms, signed_at, status)
SELECT c.id, u.id, 1200000, 'KRW', '납품 2건, 수정 1회, 저작권 귀속 협의', now(), 'active'
FROM campaigns c, users u
WHERE c.title='여름 프로모션 숏폼' AND u.email='influencer1@example.com';

-- BOOKING (첫 촬영/게시 일정)
INSERT INTO bookings (contract_id, deliverable_id, scheduled_at, timezone, status)
SELECT ct.id, d.id, now() + interval '3 days', 'Asia/Seoul', 'scheduled'
FROM contracts ct
JOIN campaigns c ON c.id = ct.campaign_id
JOIN campaign_deliverables d ON d.campaign_id = c.id AND d.type='short'
JOIN users u ON u.id = ct.influencer_id
WHERE c.title='여름 프로모션 숏폼' AND u.email='influencer1@example.com'
LIMIT 1;

-- SUBMISSION
INSERT INTO content_submissions (contract_id, deliverable_id, url, notes, status, revision)
SELECT ct.id, d.id, 'https://youtu.be/dummy123', '초안 제출', 'submitted', 0
FROM contracts ct
JOIN campaigns c ON c.id = ct.campaign_id
JOIN campaign_deliverables d ON d.campaign_id = c.id AND d.type='short'
WHERE c.title='여름 프로모션 숏폼'
LIMIT 1;

-- POST LINK
INSERT INTO post_links (submission_id, platform, url)
SELECT cs.id, 'youtube', 'https://youtu.be/dummy123'
FROM content_submissions cs
ORDER BY cs.submitted_at DESC
LIMIT 1;

-- PAYMENT (payout)
INSERT INTO payments (contract_id, amount, currency, direction, status, requested_at, paid_at, external_ref)
SELECT ct.id, 1200000, 'KRW', 'payout', 'paid', now() - interval '1 day', now(), 'PG-TEST-001'
FROM contracts ct
JOIN campaigns c ON c.id = ct.campaign_id
WHERE c.title='여름 프로모션 숏폼'
LIMIT 1;

-- REVIEWS (상호 평가)
INSERT INTO ratings_reviews (from_user_id, to_user_id, campaign_id, rating, comment)
SELECT b.id, i.id, c.id, 5, '커뮤니케이션 훌륭, 납기 준수'
FROM users b, users i, campaigns c
WHERE b.email='brand1@example.com' AND i.email='influencer1@example.com' AND c.title='여름 프로모션 숏폼';

INSERT INTO ratings_reviews (from_user_id, to_user_id, campaign_id, rating, comment)
SELECT i.id, b.id, c.id, 5, '브리프 명확, 결제 빠름'
FROM users b, users i, campaigns c
WHERE b.email='brand1@example.com' AND i.email='influencer1@example.com' AND c.title='여름 프로모션 숏폼';

-- MESSAGES
INSERT INTO messages (campaign_id, from_user_id, to_user_id, body)
SELECT c.id, b.id, i.id, '안녕하세요, 브리프 공유드립니다.'
FROM users b, users i, campaigns c
WHERE b.email='brand1@example.com' AND i.email='influencer1@example.com' AND c.title='여름 프로모션 숏폼';

-- NOTIFICATIONS
INSERT INTO notifications (user_id, type, data)
SELECT u.id, 'campaign_opened', jsonb_build_object('campaign','여름 프로모션 숏폼')
FROM users u WHERE u.email IN ('influencer1@example.com','influencer2@example.com');
