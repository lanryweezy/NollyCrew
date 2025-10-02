import { authService } from './auth';

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) (headers as any)['Authorization'] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const err = await res.json();
      message = err.error || message;
    } catch {}
    // Attempt refresh on 401 and retry once
    if (res.status === 401) {
      try {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          const retryHeaders: HeadersInit = { ...headers, 'Authorization': `Bearer ${refreshed}` };
          res = await fetch(url, { ...options, headers: retryHeaders, credentials: 'include' });
          if (res.ok) return res.json();
        }
      } catch {}
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Projects
  async listProjects(params?: { status?: string; createdById?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.createdById) query.set('createdById', params.createdById);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<{ projects: any[] }>(`/api/projects${qs ? `?${qs}` : ''}`);
  },
  async uploadProjectScript(projectId: string, scriptUrl: string) {
    return apiFetch<{ project: any }>(`/api/projects/${projectId}/script`, {
      method: 'POST',
      body: JSON.stringify({ scriptUrl }),
    });
  },
  // Async job starters (script analysis)
  async analyzeProjectScriptStart(projectId: string, payload: { scriptUrl?: string; scriptText?: string }) {
    return apiFetch<{ jobId: string; status: string; message: string }>(`/api/projects/${projectId}/script/analyze`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async getScriptVersions(projectId: string) {
    return apiFetch<{ versions: any[] }>(`/api/projects/${projectId}/script/versions`);
  },
  // Project members
  async getProjectMembers(projectId: string) {
    return apiFetch<{ members: any[] }>(`/api/projects/${projectId}/members`);
  },
  async addProjectMember(projectId: string, payload: { userId: string; role: string; character?: string; department?: string; isLead?: boolean; }) {
    return apiFetch<{ member: any }>(`/api/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Messaging
  async listMessages(otherUserId?: string) {
    const qs = otherUserId ? `?otherUserId=${encodeURIComponent(otherUserId)}` : '';
    return apiFetch<{ messages: any[] }>(`/api/messages${qs}`);
  },
  async sendMessage(payload: { recipientId: string; content: string; subject?: string; attachments?: any }) {
    return apiFetch<{ message: any }>(`/api/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Reviews
  async listUserReviews(userId: string) {
    return apiFetch<{ reviews: any[] }>(`/api/users/${userId}/reviews`);
  },
  async createUserReview(userId: string, payload: { rating: number; comment?: string; projectId?: string; isPublic?: boolean }) {
    return apiFetch<{ review: any }>(`/api/users/${userId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Talent search
  async searchTalent(params: { role?: string; location?: string; skills?: string[]; limit?: number }) {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.location) query.set('location', params.location);
    if (params.skills && params.skills.length) query.set('skills', params.skills.join(','));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<{ results: any[] }>(`/api/talent/search${qs ? `?${qs}` : ''}`);
  },

  // AI
  // Async job starters (AI services)
  async aiCastingStart(payload: { role: string; location?: string; skills?: string[]; limit?: number }) {
    return apiFetch<{ jobId: string; status: string; message: string }>(`/api/ai/casting`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async aiOptimizeScheduleStart(payload: { projectId?: string; scenes: any[]; maxDailyScenes?: number; maxDays?: number; maxHoursPerDay?: number; locationCosts?: Record<string, number>; daylightHours?: { start: string; end: string }; crewAvailability?: Record<string, any> }) {
    return apiFetch<{ jobId: string; status: string; message: string }>(`/api/ai/schedule/optimize`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Profiles and auditions
  async getUserProfile(userId: string) {
    return apiFetch<{ user: any; roles: any[] }>(`/api/users/${userId}/profile`);
  },
  async requestAudition(payload: { recipientId: string; projectId?: string; roleDescription?: string }) {
    return apiFetch<{ message: any }>(`/api/auditions/request`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Uploads
  async signUpload(filename: string, contentType: string) {
    return apiFetch<{ url: string; fields?: Record<string, string> }>(`/api/uploads/sign`, {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  },

  // AI endpoints
  async generateMarketingContent(projectTitle: string, genre: string, synopsis: string, targetAudience?: string) {
    return apiFetch<{ jobId: string; status: string; message: string }>('/api/ai/marketing/generate', {
      method: 'POST',
      body: JSON.stringify({ projectTitle, genre, synopsis, targetAudience }),
    });
  },

  // Job status endpoints
  async getJobStatus(jobId: string) {
    return apiFetch<{
      id: string;
      type: string;
      status: 'waiting' | 'active' | 'completed' | 'failed';
      progress: number;
      result?: any;
      error?: string;
      createdAt: string;
      completedAt?: string;
    }>(`/api/jobs/${jobId}/status`);
  },
};


