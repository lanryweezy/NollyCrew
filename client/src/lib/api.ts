import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile, UserRole, Job, Message, Project } from '@/types/database';

// ============================================
// AUTH
// ============================================
export const auth = {
  async signUp(email: string, password: string, firstName: string, lastName: string) {
    if (!isSupabaseConfigured()) return { user: null, error: 'Supabase not configured' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } }
    });
    return { user: data.user, error };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) return { user: null, error: 'Supabase not configured' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  async signOut() {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  },

  async getUser() {
    if (!isSupabaseConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};

// ============================================
// PROFILES
// ============================================
export const profiles = {
  async get(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
  },

  async getByEmail(email: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
    return data;
  },

  async update(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
    return data;
  },

  async search(query: string, role?: string): Promise<(Profile & { user_roles: UserRole[] })[]> {
    if (!isSupabaseConfigured()) return [];
    let queryBuilder = supabase
      .from('profiles')
      .select('*, user_roles(*)')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);
    if (role) {
      queryBuilder = queryBuilder.eq('user_roles.role', role);
    }
    const { data } = await queryBuilder;
    return data || [];
  }
};

// ============================================
// USER ROLES
// ============================================
export const userRoles = {
  async get(userId: string): Promise<UserRole[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('user_roles').select('*').eq('user_id', userId);
    return data || [];
  },

  async create(role: Omit<UserRole, 'id' | 'created_at'>): Promise<UserRole | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('user_roles').insert(role).select().single();
    return data;
  },

  async update(id: string, updates: Partial<UserRole>): Promise<UserRole | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('user_roles').update(updates).eq('id', id).select().single();
    return data;
  }
};

// ============================================
// JOBS
// ============================================
export const jobs = {
  async list(filters?: { type?: string; location?: string; limit?: number }): Promise<Job[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase
      .from('jobs')
      .select('*, poster:profiles!posted_by_id(id, first_name, last_name, avatar)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    if (filters?.location && filters.location !== 'all') {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    const { data } = await query;
    return data || [];
  },

  async get(jobId: string): Promise<Job | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase
      .from('jobs')
      .select('*, poster:profiles!posted_by_id(id, first_name, last_name, avatar, bio)')
      .eq('id', jobId)
      .single();
    return data;
  },

  async create(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('jobs').insert(job).select().single();
    return data;
  },

  async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    return data;
  },

  async getApplications(jobId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('job_applications')
      .select('*, applicant:profiles(id, first_name, last_name, avatar)')
      .eq('job_id', jobId);
    return data || [];
  },

  async apply(jobId: string, applicantId: string, coverLetter?: string, proposedRate?: number) {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase
      .from('job_applications')
      .insert({ job_id: jobId, applicant_id: applicantId, cover_letter: coverLetter, proposed_rate: proposedRate })
      .select()
      .single();
    return data;
  },

  async getMyApplications(userId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('job_applications')
      .select('*, job:jobs(id, title, type, location, posted_by_id)')
      .eq('applicant_id', userId)
      .order('applied_at', { ascending: false });
    return data || [];
  },

  async getMyPostedJobs(userId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('posted_by_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }
};

// ============================================
// MESSAGES
// ============================================
export const messages = {
  async getInbox(userId: string): Promise<Message[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(id, first_name, last_name, avatar)')
      .eq('recipient_id', userId)
      .order('sent_at', { ascending: false });
    return data || [];
  },

  async getThread(userId: string, otherUserId: string): Promise<Message[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('sent_at', { ascending: true });
    return data || [];
  },

  async send(senderId: string, recipientId: string, content: string, subject?: string): Promise<Message | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, recipient_id: recipientId, content, subject })
      .select()
      .single();
    return data;
  },

  async markAsRead(id: string) {
    if (!isSupabaseConfigured()) return;
    await supabase.from('messages').update({ is_read: true }).eq('id', id);
  },

  async getUnreadCount(userId: string): Promise<number> {
    if (!isSupabaseConfigured()) return 0;
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    return count || 0;
  }
};

// ============================================
// PROJECTS
// ============================================
export const projects = {
  async list(filters?: { createdById?: string; status?: string; limit?: number }): Promise<Project[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (filters?.createdById) {
      query = query.eq('created_by_id', filters.createdById);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    const { data } = await query;
    return data || [];
  },

  async get(projectId: string): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
    return data;
  },

  async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('projects').insert(project).select().single();
    return data;
  },

  async getMembers(projectId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('project_members')
      .select('*, user:profiles(id, first_name, last_name, avatar)')
      .eq('project_id', projectId);
    return data || [];
  }
};

// ============================================
// REVIEWS
// ============================================
export const reviews = {
  async getForUser(userId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles(id, first_name, last_name, avatar)')
      .eq('reviewee_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async create(review: { reviewer_id: string; reviewee_id: string; project_id?: string; rating: number; comment?: string }) {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.from('reviews').insert(review).select().single();
    return data;
  }
};

// ============================================
// WAITLIST
// ============================================
export const waitlist = {
  async join(email: string, name?: string, source?: string) {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
    const { error } = await supabase.from('waitlist').insert({ email, name, source });
    return { success: !error, error };
  }
};
