-- Comprehensive Nollywood industry profiles
-- Run after 001 and 002

-- Extend profiles with full industry data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stage_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state_of_origin TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_email_verified BOOLEAN DEFAULT false;

-- Social media
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS imdb_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- Career
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_start_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_credits INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS awards_won INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS awards_nominated INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notable_works JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS filmography JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training JSONB DEFAULT '[]';

-- Rates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_rate_min DECIMAL(12,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_rate_max DECIMAL(12,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NGN';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT true;

-- Verification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_type TEXT; -- 'NIN', 'BVN', 'passport', 'drivers_license'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0; -- 0=none, 1=basic, 2=verified, 3=premium

-- Stats
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_appearances INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_inquiries INTEGER DEFAULT 0;

-- Social connections
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Data source tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_source TEXT; -- 'imdb', 'manual', 'social', 'scraped'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_completeness INTEGER DEFAULT 0; -- 0-100%
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_data_sync TIMESTAMPTZ;

-- Indexes for search
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_stage_name ON profiles(stage_name);
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram);
CREATE INDEX IF NOT EXISTS idx_profiles_twitter ON profiles(twitter);
CREATE INDEX IF NOT EXISTS idx_profiles_imdb_id ON profiles(imdb_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_level ON profiles(verification_level);
CREATE INDEX IF NOT EXISTS idx_profiles_industry_role ON profiles(industry_role);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_career_start ON profiles(career_start_year);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles 
  USING gin(to_tsvector('english', 
    coalesce(first_name, '') || ' ' || 
    coalesce(last_name, '') || ' ' || 
    coalesce(nickname, '') || ' ' || 
    coalesce(stage_name, '') || ' ' || 
    coalesce(location, '')
  ));

-- Followers/Following table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);
