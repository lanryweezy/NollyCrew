-- Initial schema migration for NollyCrewHub

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Waitlist table for collecting early-access emails
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    source TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users table with multi-role support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    website TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- User roles - supports multiple roles per user
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'actor', 'crew', 'producer'
    specialties TEXT[],
    experience TEXT,
    hourly_rate DECIMAL(10, 2),
    availability TEXT DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    portfolio JSONB, -- Links, images, videos
    skills TEXT[],
    languages TEXT[],
    awards JSONB,
    credits JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for user_roles table
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON user_roles(role);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    genre TEXT NOT NULL,
    type TEXT NOT NULL, -- 'feature', 'short', 'series', 'commercial', 'documentary'
    status TEXT NOT NULL DEFAULT 'pre-production', -- 'pre-production', 'production', 'post-production', 'completed', 'cancelled'
    budget DECIMAL(15, 2),
    currency TEXT NOT NULL DEFAULT 'NGN',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    location TEXT,
    poster TEXT,
    trailer TEXT,
    script TEXT, -- File path or content
    script_breakdown JSONB, -- AI-generated breakdown
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for projects table
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON projects(created_by_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_type_idx ON projects(type);

-- Project team members
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'director', 'producer', 'actor', 'cinematographer', etc.
    character TEXT, -- For actors
    department TEXT, -- 'camera', 'sound', 'editing', etc.
    is_lead BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for project_members table
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id);

-- Jobs/Casting calls
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- 'casting', 'crew', 'project'
    category TEXT NOT NULL, -- 'lead-actor', 'supporting-actor', 'cinematographer', etc.
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    posted_by_id UUID NOT NULL REFERENCES users(id),
    location TEXT NOT NULL,
    budget DECIMAL(10, 2),
    currency TEXT NOT NULL DEFAULT 'NGN',
    payment_type TEXT, -- 'fixed', 'hourly', 'daily', 'project'
    duration TEXT, -- '2 weeks', '3 months', etc.
    requirements TEXT[],
    skills TEXT[],
    experience TEXT, -- 'entry', 'mid', 'senior', 'expert'
    deadline TIMESTAMP,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for jobs table
CREATE INDEX IF NOT EXISTS jobs_posted_by_idx ON jobs(posted_by_id);
CREATE INDEX IF NOT EXISTS jobs_project_id_idx ON jobs(project_id);
CREATE INDEX IF NOT EXISTS jobs_type_idx ON jobs(type);
CREATE INDEX IF NOT EXISTS jobs_is_active_idx ON jobs(is_active);

-- Job applications
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    portfolio JSONB, -- Additional materials for this application
    proposed_rate DECIMAL(10, 2),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

-- Create indexes for job_applications table
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_applicant_id_idx ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON job_applications(status);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    thread_id UUID, -- Group related messages
    attachments JSONB,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_thread_id_idx ON messages(thread_id);

-- Reviews/Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
    comment TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for reviews table
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_reviewee_id_idx ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS reviews_project_id_idx ON reviews(project_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS unique_job_applicant ON job_applications(job_id, applicant_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_project_user ON project_members(project_id, user_id, role);