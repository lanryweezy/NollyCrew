-- Add claimed_at and verification fields to profiles
-- Run this after 001_initial_schema.sql

-- New columns for claim system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'claimed', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claim_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS known_works JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS imdb_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry_role TEXT; -- 'actor', 'director', 'producer', 'crew'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Index for claim lookups
CREATE INDEX IF NOT EXISTS idx_profiles_claim_status ON profiles(claim_status);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(first_name, last_name);

-- Claim requests table
CREATE TABLE IF NOT EXISTS claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_method TEXT, -- 'email', 'phone', 'reference', 'document'
  verification_data JSONB,
  notes TEXT,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, user_id)
);

-- RLS for claim_requests
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own claim requests" ON claim_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create claim requests" ON claim_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update claim requests" ON claim_requests FOR UPDATE USING (true); -- TODO: add admin role check
