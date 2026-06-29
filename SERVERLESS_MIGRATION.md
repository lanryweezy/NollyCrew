# NollyCrew — Serverless Migration Plan

## Architecture: Next.js + Supabase (No Backend Server)

**Pattern from Kreathief/Artist Plan:**
```
Next.js Frontend → Supabase (DB + Auth + Realtime + Storage) → AI APIs
```

No Express server. No JWT. No PostgreSQL instance. No Redis. No Bull queues.

---

## What Supabase Replaces

| Old (Express) | New (Supabase) |
|---------------|----------------|
| PostgreSQL + Drizzle ORM | Supabase Database (Postgres) |
| JWT / Clerk Auth | Supabase Auth (email, Google, phone) |
| WebSocket + Pusher | Supabase Realtime |
| S3 + UploadThing | Supabase Storage |
| Redis + Bull Queues | Supabase Edge Functions / pg_cron |
| Rate Limiting middleware | Supabase Edge Functions |
| Server-side routes | Client-side Supabase queries |

---

## Database Schema (Supabase SQL)

### Tables

```sql
-- Users (managed by Supabase Auth + profiles table)
CREATE TABLE profiles (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles (multi-role support)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'actor', 'crew', 'producer'
  specialties TEXT[],
  experience TEXT,
  hourly_rate DECIMAL(10,2),
  availability TEXT DEFAULT 'available',
  portfolio JSONB,
  skills TEXT[],
  languages TEXT[],
  awards JSONB,
  credits JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  type TEXT NOT NULL, -- 'feature', 'short', 'series', 'commercial'
  status TEXT DEFAULT 'pre-production',
  budget DECIMAL(15,2),
  currency TEXT DEFAULT 'NGN',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  poster TEXT,
  trailer TEXT,
  script TEXT,
  script_breakdown JSONB,
  created_by_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  character TEXT,
  department TEXT,
  is_lead BOOLEAN DEFAULT false,
  permissions JSONB,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id, role)
);

-- Jobs / Casting Calls
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  posted_by_id UUID REFERENCES profiles(id),
  location TEXT NOT NULL,
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'NGN',
  payment_type TEXT,
  duration TEXT,
  requirements TEXT[],
  skills TEXT[],
  experience TEXT,
  deadline TIMESTAMPTZ,
  is_urgent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  portfolio JSONB,
  proposed_rate DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  UNIQUE(job_id, applicant_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  thread_id UUID,
  attachments JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow Transactions
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  job_id UUID REFERENCES jobs(id),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'escrow',
  paystack_reference TEXT,
  release_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referred_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reward_status TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Profiles: public read, owner write
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User Roles: public read, owner write
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public roles" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Users manage own roles" ON user_roles FOR ALL USING (auth.uid() = user_id);

-- Projects: owner CRUD, members read
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = created_by_id);
CREATE POLICY "Members view projects" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid())
);

-- Jobs: public read, poster write
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Users manage own jobs" ON jobs FOR ALL USING (auth.uid() = posted_by_id);

-- Messages: sender/receiver only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

---

## File Structure

```
nollycrew/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── talent/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── messages/page.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── supabase-server.ts  # Server-side client
│   │   └── utils.ts
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── Navigation.tsx
│   │   ├── Dashboard.tsx
│   │   └── ...
│   └── types/
│       └── database.ts         # Generated types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Create new Next.js project
2. Install Supabase SDK
3. Run database migrations
4. Set up Supabase Auth (email + Google)
5. Create profile management

### Phase 2: Core Features (Week 2)
1. Jobs/Casting calls CRUD
2. Talent search + profiles
3. Project management
4. Messaging system

### Phase 3: Payments + AI (Week 3)
1. Paystack integration (client-side)
2. Escrow system
3. AI script analysis (OpenAI/Gemini)

### Phase 4: Polish + Deploy (Week 4)
1. Real-time notifications
2. File uploads (Supabase Storage)
3. Deployment to Vercel

---

## Key Decisions

- **Framework**: Next.js 14 (App Router) — same as Artist Plan
- **Database**: Supabase (Postgres + Auth + Realtime + Storage)
- **Styling**: Tailwind + shadcn/ui — same component library
- **Payments**: Paystack (client-side SDK)
- **AI**: OpenAI / Gemini via API routes
- **Deployment**: Vercel (static + edge functions)
- **No server**: Everything runs on client + Supabase + Vercel Edge
