import type { Profile, UserRole, Job, Message, Project } from '@/types/database';

const API_BASE = '/api';

// ============================================
// TOKEN MANAGEMENT
// ============================================
let authToken: string | null = localStorage.getItem('nollycrew_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('nollycrew_token', token);
  } else {
    localStorage.removeItem('nollycrew_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// ============================================
// API FETCH HELPER
// ============================================
export async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ============================================
// AUTH
// ============================================
export const auth = {
  async signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName, first_name: firstName, last_name: lastName }),
      });
      if (data.token) setAuthToken(data.token);
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) setAuthToken(data.token);
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  async signOut() {
    setAuthToken(null);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  },

  async getUser() {
    try {
      const data = await apiFetch('/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },

  async getSession() {
    try {
      const data = await apiFetch('/auth/me');
      return data.user ? { user: data.user } : null;
    } catch {
      return null;
    }
  }
};

// ============================================
// PROFILES
// ============================================
export const profiles = {
  async get(userId: string): Promise<Profile | null> {
    try {
      const data = await apiFetch(`/users/${userId}`);
      return data.user;
    } catch {
      return null;
    }
  },

  async getByEmail(email: string): Promise<Profile | null> {
    return null;
  },

  async update(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const data = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.user;
    } catch {
      return null;
    }
  },

  async search(query: string, role?: string): Promise<(Profile & { user_roles: UserRole[] })[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.set('skills', query);
      if (role) params.set('role', role);
      const data = await apiFetch(`/talent/search?${params.toString()}`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
};

// ============================================
// USER ROLES
// ============================================
export const userRoles = {
  async get(userId: string): Promise<UserRole[]> {
    try {
      const data = await apiFetch('/profile/roles');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async create(role: Omit<UserRole, 'id' | 'created_at'>): Promise<UserRole | null> {
    try {
      const data = await apiFetch('/profile/roles', {
        method: 'POST',
        body: JSON.stringify(role),
      });
      return data;
    } catch {
      return null;
    }
  },

  async update(id: string, updates: Partial<UserRole>): Promise<UserRole | null> {
    return null;
  }
};

// ============================================
// JOBS
// ============================================
export const jobs = {
  async list(filters?: { type?: string; location?: string; limit?: number }): Promise<Job[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters?.location && filters.location !== 'all') params.set('location', filters.location);
      if (filters?.limit) params.set('limit', String(filters.limit));
      const data = await apiFetch(`/jobs?${params.toString()}`);
      return data.jobs || [];
    } catch {
      return [];
    }
  },

  async get(jobId: string): Promise<Job | null> {
    try {
      return await apiFetch(`/jobs/${jobId}`);
    } catch {
      return null;
    }
  },

  async create(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job | null> {
    try {
      const data = await apiFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify(job),
      });
      return data.job;
    } catch {
      return null;
    }
  },

  async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    return null;
  },

  async getApplications(jobId: string) {
    try {
      return await apiFetch(`/jobs/${jobId}/applications`);
    } catch {
      return [];
    }
  },

  async apply(jobId: string, applicantId: string, coverLetter?: string, proposedRate?: number) {
    try {
      const data = await apiFetch(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ coverLetter, proposedRate }),
      });
      return data.application;
    } catch {
      return null;
    }
  },

  async getMyApplications(userId: string) {
    try {
      return await apiFetch('/jobs?limit=50');
    } catch {
      return [];
    }
  },

  async getMyPostedJobs(userId: string) {
    try {
      const data = await apiFetch('/jobs?limit=50');
      return data.jobs || [];
    } catch {
      return [];
    }
  }
};

// ============================================
// MESSAGES
// ============================================
export const messages = {
  async getInbox(userId: string): Promise<Message[]> {
    try {
      const data = await apiFetch('/messages');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async getThread(userId: string, otherUserId: string): Promise<Message[]> {
    try {
      const data = await apiFetch(`/messages?otherUserId=${otherUserId}`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async send(senderId: string, recipientId: string, content: string, subject?: string): Promise<Message | null> {
    try {
      return await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId, content, subject }),
      });
    } catch {
      return null;
    }
  },

  async markAsRead(id: string) {
    // no server endpoint yet
  },

  async getUnreadCount(userId: string): Promise<number> {
    return 0;
  }
};

// ============================================
// PROJECTS
// ============================================
export const projects = {
  async list(filters?: { createdById?: string; status?: string; limit?: number }): Promise<Project[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.limit) params.set('limit', String(filters.limit));
      const data = await apiFetch(`/projects?${params.toString()}`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async get(projectId: string): Promise<Project | null> {
    try {
      return await apiFetch(`/projects/${projectId}`);
    } catch {
      return null;
    }
  },

  async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    try {
      return await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
    } catch {
      return null;
    }
  },

  async getMembers(projectId: string) {
    try {
      return await apiFetch(`/projects/${projectId}/export`);
    } catch {
      return [];
    }
  }
};

// ============================================
// REVIEWS
// ============================================
export const reviews = {
  async getForUser(userId: string) {
    try {
      return await apiFetch(`/users/${userId}/reviews`);
    } catch {
      return [];
    }
  },

  async create(review: { reviewer_id: string; reviewee_id: string; project_id?: string; rating: number; comment?: string }) {
    try {
      return await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      });
    } catch {
      return null;
    }
  }
};

// ============================================
// AI TOOLS
// ============================================
export const aiTools = {
  async analyzeScript(scriptText: string) {
    try {
      return await apiFetch('/ai/analyze-script', {
        method: 'POST',
        body: JSON.stringify({ scriptText }),
      });
    } catch {
      return null;
    }
  },

  async directorChat(message: string, history: Array<{ role: string; content: string }> = []) {
    try {
      return await apiFetch('/ai/director-chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      });
    } catch {
      return null;
    }
  },

  async casting(role: string, requirements: string, location?: string, skills?: string[]) {
    try {
      return await apiFetch('/ai/casting', {
        method: 'POST',
        body: JSON.stringify({ role, requirements, location, skills }),
      });
    } catch {
      return null;
    }
  },

  async optimizeSchedule(projectId: string, scenes: any[], constraints?: any) {
    try {
      return await apiFetch('/ai/schedule/optimize', {
        method: 'POST',
        body: JSON.stringify({ projectId, scenes, ...constraints }),
      });
    } catch {
      return null;
    }
  },

  async generateMarketing(projectTitle: string, genre: string, synopsis: string, targetAudience?: string) {
    try {
      return await apiFetch('/ai/marketing/generate', {
        method: 'POST',
        body: JSON.stringify({ projectTitle, genre, synopsis, targetAudience }),
      });
    } catch {
      return null;
    }
  },

  async translateScript(scriptText: string, targetLanguage: string) {
    try {
      return await apiFetch('/ai/translate', {
        method: 'POST',
        body: JSON.stringify({ scriptText, targetLanguage }),
      });
    } catch {
      return null;
    }
  },

  async analyzeSentiment(scriptText: string) {
    try {
      return await apiFetch('/ai/sentiment', {
        method: 'POST',
        body: JSON.stringify({ scriptText }),
      });
    } catch {
      return null;
    }
  },

  async generateReleaseForm(talentName: string, roleName: string, projectName: string, rate?: string) {
    try {
      return await apiFetch('/ai/legal/release-form', {
        method: 'POST',
        body: JSON.stringify({ talentName, roleName, projectName, rate }),
      });
    } catch {
      return null;
    }
  },

  async predictFatigue(scheduleDays: any[]) {
    try {
      return await apiFetch('/ai/predict-fatigue', {
        method: 'POST',
        body: JSON.stringify({ scheduleDays }),
      });
    } catch {
      return null;
    }
  },

  async analyzeVideo(videoUri: string, mimeType?: string) {
    try {
      return await apiFetch('/ai/video-analysis', {
        method: 'POST',
        body: JSON.stringify({ videoUri, mimeType }),
      });
    } catch {
      return null;
    }
  }
};

// ============================================
// ANALYTICS
// ============================================
export const analytics = {
  async getProjectSuccess() {
    try {
      return await apiFetch('/analytics/predict/project-success');
    } catch {
      return null;
    }
  },

  async getFinancialReport() {
    try {
      return await apiFetch('/analytics/financial-report');
    } catch {
      return null;
    }
  },

  async getPerformanceBenchmarks() {
    try {
      return await apiFetch('/analytics/performance-benchmarks');
    } catch {
      return null;
    }
  },

  async getTrendAnalysis() {
    try {
      return await apiFetch('/analytics/trend-analysis');
    } catch {
      return null;
    }
  }
};

// ============================================
// ADMIN
// ============================================
export const admin = {
  async getStats() {
    try {
      return await apiFetch('/admin/stats');
    } catch {
      return null;
    }
  },

  async getAuditLogs(params?: any) {
    try {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await apiFetch(`/admin/audit-logs${query}`);
    } catch {
      return [];
    }
  }
};

// ============================================
// SUBSCRIPTIONS
// ============================================
export const subscriptions = {
  async getPlans() {
    try {
      return await apiFetch('/subscriptions/plans');
    } catch {
      return [];
    }
  },

  async getMySubscription() {
    try {
      return await apiFetch('/subscriptions/me');
    } catch {
      return null;
    }
  },

  async initialize(planId: string) {
    try {
      return await apiFetch('/subscriptions/initialize', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
    } catch {
      return null;
    }
  }
};

// ============================================
// ESCROW
// ============================================
export const escrow = {
  async initialize(data: { jobId?: string; recipientId?: string; amount: number; projectId?: string }) {
    try {
      return await apiFetch('/escrow/initialize', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return null;
    }
  },

  async getTransactions() {
    try {
      return await apiFetch('/escrow/transactions');
    } catch {
      return [];
    }
  }
};

// ============================================
// SUPPORT TICKETS
// ============================================
export const support = {
  async getTickets() {
    try {
      return await apiFetch('/support/tickets');
    } catch {
      return [];
    }
  },

  async createTicket(data: { subject: string; description: string; category?: string }) {
    try {
      return await apiFetch('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return null;
    }
  }
};

// ============================================
// REFERRALS
// ============================================
export const referrals = {
  async get() {
    try {
      return await apiFetch('/referrals');
    } catch {
      return [];
    }
  },

  async create(referredEmail: string) {
    try {
      return await apiFetch('/referrals', {
        method: 'POST',
        body: JSON.stringify({ referredEmail }),
      });
    } catch {
      return null;
    }
  }
};

// ============================================
// KYC
// ============================================
export const kyc = {
  async getStatus() {
    try {
      return await apiFetch('/kyc/status');
    } catch {
      return { status: 'not_started' };
    }
  },

  async verify(type: string, idNumber: string) {
    try {
      return await apiFetch('/kyc/verify', {
        method: 'POST',
        body: JSON.stringify({ type, idNumber }),
      });
    } catch {
      return null;
    }
  }
};

// ============================================
// WAITLIST
// ============================================
export const waitlist = {
  async join(email: string, name?: string, source?: string) {
    try {
      await apiFetch('/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email, name, source }),
      });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================
// CALL SHEETS
// ============================================
export const callSheets = {
  async getTemplates() {
    try {
      const data = await apiFetch('/call-sheet/templates');
      return data.templates || [];
    } catch {
      return [];
    }
  },

  async generate(templateId: string, data: any) {
    try {
      return await apiFetch('/call-sheet/generate', {
        method: 'POST',
        body: JSON.stringify({ templateId, data }),
      });
    } catch {
      return null;
    }
  }
};
