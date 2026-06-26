-- NollyCrew Supabase Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- USER ROLES (actor, crew, producer)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('actor', 'crew', 'producer')),
  specialties TEXT[],
  experience TEXT,
  hourly_rate DECIMAL(10,2),
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  portfolio JSONB DEFAULT '[]',
  skills TEXT[],
  languages TEXT[],
  awards JSONB DEFAULT '[]',
  credits JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feature', 'short', 'series', 'commercial', 'documentary')),
  status TEXT DEFAULT 'pre-production' CHECK (status IN ('pre-production', 'production', 'post-production', 'completed', 'cancelled')),
  budget DECIMAL(15,2),
  currency TEXT DEFAULT 'NGN',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  poster TEXT,
  trailer TEXT,
  script TEXT,
  script_breakdown JSONB,
  created_by_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_created_by ON projects(created_by_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================
-- PROJECT MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  character TEXT,
  department TEXT,
  is_lead BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '[]',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id, role)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- ============================================
-- JOBS (casting calls + crew positions)
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('casting', 'crew', 'project')),
  category TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  posted_by_id UUID NOT NULL REFERENCES profiles(id),
  location TEXT NOT NULL,
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'NGN',
  payment_type TEXT CHECK (payment_type IN ('fixed', 'hourly', 'daily', 'project')),
  duration TEXT,
  requirements TEXT[],
  skills TEXT[],
  experience TEXT CHECK (experience IN ('entry', 'mid', 'senior', 'expert')),
  deadline TIMESTAMPTZ,
  is_urgent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_posted_by ON jobs(posted_by_id);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_location ON jobs(location);

-- ============================================
-- JOB APPLICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  portfolio JSONB,
  proposed_rate DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  thread_id UUID,
  attachments JSONB DEFAULT '[]',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- ============================================
-- ESCROW TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  job_id UUID REFERENCES jobs(id),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'escrow' CHECK (status IN ('escrow', 'released', 'disputed', 'refunded')),
  paystack_reference TEXT,
  release_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SUPPORT TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dispute', 'bug', 'feature_request', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WAITLIST
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public roles are viewable" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Users can manage own roles" ON user_roles FOR ALL USING (auth.uid() = user_id);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public projects are viewable" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = created_by_id);
CREATE POLICY "Creators can update own projects" ON projects FOR UPDATE USING (auth.uid() = created_by_id);
CREATE POLICY "Creators can delete own projects" ON projects FOR DELETE USING (auth.uid() = created_by_id);

-- Project Members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members are viewable" ON project_members FOR SELECT USING (true);
CREATE POLICY "Project creators can manage members" ON project_members FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND created_by_id = auth.uid())
);

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active jobs are viewable by everyone" ON jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = posted_by_id);
CREATE POLICY "Posters can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = posted_by_id);
CREATE POLICY "Posters can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = posted_by_id);

-- Job Applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posters can view applications for their jobs" ON job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND posted_by_id = auth.uid())
);
CREATE POLICY "Applicants can view own applications" ON job_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Users can apply to jobs" ON job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Posters can update application status" ON job_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND posted_by_id = auth.uid())
);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can mark as read" ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reviews are viewable" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Escrow
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON escrow_transactions FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can create transactions" ON escrow_transactions FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Support Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (true);
