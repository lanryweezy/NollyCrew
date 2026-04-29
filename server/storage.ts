
import crypto from "node:crypto";
import { 
  type User, 
  type InsertUser, 
  type UserRole, 
  type InsertUserRole,
  type Project, 
  type InsertProject,
  type ProjectMember,
  type InsertProjectMember,
  type Job, 
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  users,
  userRoles,
  projects,
  projectMembers,
  jobs,
  jobApplications,
  messages,
  reviews
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, count } from "drizzle-orm";
import { logger } from "./utils/logger.js";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'password'> & { passwordHash: string }): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // User roles
  getUserRoles(userId: string): Promise<UserRole[]>;
  createUserRole(role: InsertUserRole): Promise<UserRole>;
  updateUserRole(id: string, updates: Partial<InsertUserRole>): Promise<UserRole | undefined>;
  deleteUserRole(id: string): Promise<boolean>;
  
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(filters?: { status?: string; createdById?: string; limit?: number }): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Project members
  getProjectMember(id: string): Promise<ProjectMember | undefined>;
  getProjectMembers(projectId: string): Promise<ProjectMember[]>;
  createProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  updateProjectMember(id: string, updates: Partial<InsertProjectMember>): Promise<ProjectMember | undefined>;
  deleteProjectMember(id: string): Promise<boolean>;
  
  // Jobs
  getJob(id: string): Promise<Job | undefined>;
  getJobs(filters?: { type?: string; location?: string; isActive?: boolean; limit?: number }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  
  // Job applications
  getJobApplication(id: string): Promise<JobApplication | undefined>;
  getJobApplications(filters?: { jobId?: string; applicantId?: string; status?: string }): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined>;
  
  // Messages
  getMessages(userId: string, otherUserId?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
  
  // Reviews
  getUserReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Search
  searchTalent(filters: { role?: string; location?: string; skills?: string[]; limit?: number }): Promise<UserRole[]>;

  // Dashboard
  getDashboardData(userId: string): Promise<any>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async createUser(user: Omit<InsertUser, 'password'> & { passwordHash: string }): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return db.query.userRoles.findMany({ where: eq(userRoles.userId, userId) });
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    const result = await db.insert(userRoles).values(role).returning();
    return result[0];
  }

  async updateUserRole(id: string, updates: Partial<InsertUserRole>): Promise<UserRole | undefined> {
    const result = await db.update(userRoles).set(updates).where(eq(userRoles.id, id)).returning();
    return result[0];
  }

  async deleteUserRole(id: string): Promise<boolean> {
    const result = await db.delete(userRoles).where(eq(userRoles.id, id));
    return result.rowCount > 0;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return db.query.projects.findFirst({ where: eq(projects.id, id) });
  }

  async getProjects(filters?: { status?: string; createdById?: string; limit?: number }): Promise<Project[]> {
    const { status, createdById, limit } = filters || {};
    // @ts-ignore
    const rows: Project[] = await db.query.projects.findMany({
      where: (p: any, { and, eq }: any) => and(
        status ? eq(p.status, status) : undefined,
        createdById ? eq(p.createdById, createdById) : undefined,
      ),
      limit: limit && Number.isFinite(limit) ? Math.max(1, Math.min(100, limit)) : undefined,
    });
    return rows;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  async getProjectMember(id: string): Promise<ProjectMember | undefined> {
    return db.query.projectMembers.findFirst({ where: eq(projectMembers.id, id) });
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return db.query.projectMembers.findMany({ where: eq(projectMembers.projectId, projectId) });
  }

  async createProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const result = await db.insert(projectMembers).values(member).returning();
    return result[0];
  }

  async updateProjectMember(id: string, updates: Partial<InsertProjectMember>): Promise<ProjectMember | undefined> {
    const result = await db.update(projectMembers).set(updates).where(eq(projectMembers.id, id)).returning();
    return result[0];
  }

  async deleteProjectMember(id: string): Promise<boolean> {
    const result = await db.delete(projectMembers).where(eq(projectMembers.id, id));
    return result.rowCount > 0;
  }

  async getJob(id: string): Promise<Job | undefined> {
    return db.query.jobs.findFirst({ where: eq(jobs.id, id) });
  }

  async getJobs(filters?: { type?: string; location?: string; isActive?: boolean; limit?: number }): Promise<Job[]> {
    const { type, location, isActive, limit } = filters || {};
    // @ts-ignore
    const rows: Job[] = await db.query.jobs.findMany({
      where: (j: any, { and, eq, ilike }: any) => and(
        type ? eq(j.type, type) : undefined,
        typeof isActive === 'boolean' ? eq(j.isActive, isActive) : undefined,
        // drizzle's ilike may not be available depending on dialect; fallback later if needed
        location ? ilike ? ilike(j.location, `%${location}%`) : undefined : undefined,
      ),
      limit: limit && Number.isFinite(limit) ? Math.max(1, Math.min(100, limit)) : undefined,
    });
    // Fallback for location filter if ilike not present
    if (location && (!rows.length || typeof rows[0] === 'undefined')) {
      // @ts-ignore
      const all: Job[] = await db.query.jobs.findMany({
        where: (j: any, { and, eq }: any) => and(
          type ? eq(j.type, type) : undefined,
          typeof isActive === 'boolean' ? eq(j.isActive, isActive) : undefined,
        ),
      });
      return all.filter(j => j.location?.toLowerCase().includes(location.toLowerCase())).slice(0, limit ?? 50);
    }
    return rows;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return result.rowCount > 0;
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return db.query.jobApplications.findFirst({ where: eq(jobApplications.id, id) });
  }

  async getJobApplications(filters?: { jobId?: string; applicantId?: string; status?: string }): Promise<JobApplication[]> {
    // @ts-ignore
    return db.query.jobApplications.findMany({ where: filters });
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const result = await db.insert(jobApplications).values(application).returning();
    return result[0];
  }

  async updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const result = await db.update(jobApplications).set(updates).where(eq(jobApplications.id, id)).returning();
    return result[0];
  }

  async getMessages(userId: string, otherUserId?: string): Promise<Message[]> {
    if (otherUserId) {
      // Fetch messages between two users (both directions) ordered by time
      // @ts-ignore
      return db.query.messages.findMany({
        where: (m: any, { and, or, eq }: any) => and(
          or(
            and(eq(m.senderId, userId), eq(m.recipientId, otherUserId)),
            and(eq(m.senderId, otherUserId), eq(m.recipientId, userId))
          )
        ),
        orderBy: (m: any, { asc }: any) => [asc(m.sentAt)],
      });
    }
    // @ts-ignore
    return db.query.messages.findMany({
      where: (m: any, { or, eq }: any) => or(eq(m.senderId, userId), eq(m.recipientId, userId)),
      orderBy: (m: any, { asc }: any) => [asc(m.sentAt)],
    });
  }

  // Talent search helpers
  async searchTalent(filters: { role?: string; location?: string; skills?: string[]; limit?: number }): Promise<UserRole[]> {
    const { role, location, skills, limit } = filters;
    // Base query by role/isActive in DB
    // @ts-ignore
    let rows: UserRole[] = await db.query.userRoles.findMany({
      where: (ur: any, { and, eq }: any) => and(
        eq(ur.isActive, true),
        role ? eq(ur.role, role) : undefined,
      ),
      limit: Math.min(200, limit ?? 50),
    });
    // Join with users for location filter
    if (location) {
      const userIds = Array.from(new Set(rows.map(r => r.userId)));
      // @ts-ignore
      const userRows: User[] = await db.query.users.findMany({
        where: (u: any, { inArray }: any) => inArray(u.id, userIds),
      });
      const usersById = new Map<string, User>(userRows.map(u => [u.id, u]));
      rows = rows.filter(r => {
        const u = usersById.get(r.userId);
        return u?.location?.toLowerCase().includes(location.toLowerCase());
      });
    }
    if (skills && skills.length > 0) {
      rows = rows.filter(r => (r.skills || []).some(s => skills.some(k => s.toLowerCase().includes(k.toLowerCase()))));
    }
    return rows.slice(0, limit ?? 50);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const result = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
    return result.rowCount > 0;
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return db.query.reviews.findMany({ where: eq(reviews.revieweeId, userId) });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getDashboardData(userId: string): Promise<any> {
    const [
      recentProjects,
      recentApplications,
      unreadMessagesCountResult,
      userProfile,
    ] = await Promise.all([
      db.query.projects.findMany({
        where: eq(projects.createdById, userId),
        orderBy: [desc(projects.createdAt)],
        limit: 3,
      }),
      db.select({
          id: jobApplications.id,
          jobId: jobApplications.jobId,
          status: jobApplications.status,
          appliedAt: jobApplications.appliedAt,
          jobTitle: jobs.title,
          coverLetter: jobApplications.coverLetter,
        })
        .from(jobApplications)
        .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
        .where(eq(jobApplications.applicantId, userId))
        .orderBy(desc(jobApplications.appliedAt))
        .limit(3),
      db.select({ count: count() })
        .from(messages)
        .where(and(eq(messages.recipientId, userId), eq(messages.isRead, false))),
      this.getUser(userId),
    ]);

    return {
      recentProjects,
      recentApplications,
      unreadMessagesCount: unreadMessagesCountResult[0]?.count || 0,
      notifications: [],
      recentActivity: [],
      connections: [],
      user: userProfile ? { id: userProfile.id, email: userProfile.email, firstName: userProfile.firstName, lastName: userProfile.lastName } : null,
    };
  }
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private userRoles = new Map<string, UserRole>();
  private projects = new Map<string, Project>();
  private projectMembers = new Map<string, ProjectMember>();
  private jobs = new Map<string, Job>();
  private jobApplications = new Map<string, JobApplication>();
  private messages = new Map<string, Message>();
  private reviews = new Map<string, Review>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(user: Omit<InsertUser, 'password'> & { passwordHash: string }): Promise<User> {
    const id = Math.random().toString(36).substring(2, 11);
    const u = user as any;
    const newUser: User = {
      id,
      email: u.email,
      passwordHash: u.passwordHash,
      firstName: u.firstName,
      lastName: u.lastName,
      isVerified: false,
      avatar: u.avatar || null,
      bio: u.bio || null,
      location: u.location || null,
      phone: u.phone || null,
      website: u.website || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(r => r.userId === userId);
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    const id = Math.random().toString(36).substring(2, 11);
    const r = role as any;
    const newRole: UserRole = {
      id,
      userId: r.userId,
      role: r.role,
      isActive: r.isActive ?? true,
      experience: r.experience || null,
      hourlyRate: r.hourlyRate || null,
      availability: r.availability || 'available',
      portfolio: r.portfolio || null,
      skills: r.skills || null,
      languages: r.languages || null,
      awards: r.awards || null,
      credits: r.credits || null,
      specialties: r.specialties || null,
      createdAt: new Date()
    };
    this.userRoles.set(id, newRole);
    return newRole;
  }

  async updateUserRole(id: string, updates: Partial<InsertUserRole>): Promise<UserRole | undefined> {
    const role = this.userRoles.get(id);
    if (!role) return undefined;
    const updatedRole = { ...role, ...updates };
    this.userRoles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteUserRole(id: string): Promise<boolean> {
    return this.userRoles.delete(id);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(filters?: { status?: string; createdById?: string; limit?: number }): Promise<Project[]> {
    let result = Array.from(this.projects.values());
    if (filters?.status) result = result.filter(p => p.status === filters.status);
    if (filters?.createdById) result = result.filter(p => p.createdById === filters.createdById);
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = Math.random().toString(36).substring(2, 11);
    const p = project as any;
    const newProject: Project = {
      id,
      title: p.title,
      description: p.description,
      genre: p.genre,
      type: p.type,
      createdById: p.createdById,
      status: p.status || 'pre-production',
      budget: p.budget || null,
      currency: p.currency || 'NGN',
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
      location: p.location || null,
      poster: p.poster || null,
      trailer: p.trailer || null,
      script: p.script || null,
      scriptBreakdown: p.scriptBreakdown || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getProjectMember(id: string): Promise<ProjectMember | undefined> {
    return this.projectMembers.get(id);
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return Array.from(this.projectMembers.values()).filter(m => m.projectId === projectId);
  }

  async createProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const id = Math.random().toString(36).substring(2, 11);
    const m = member as any;
    const newMember: ProjectMember = {
      id,
      userId: m.userId,
      role: m.role,
      projectId: m.projectId,
      character: m.character || null,
      department: m.department || null,
      isLead: m.isLead ?? false,
      joinedAt: new Date()
    };
    this.projectMembers.set(id, newMember);
    return newMember;
  }

  async updateProjectMember(id: string, updates: Partial<InsertProjectMember>): Promise<ProjectMember | undefined> {
    const member = this.projectMembers.get(id);
    if (!member) return undefined;
    const updatedMember = { ...member, ...updates };
    this.projectMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteProjectMember(id: string): Promise<boolean> {
    return this.projectMembers.delete(id);
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(filters?: { type?: string; location?: string; isActive?: boolean; limit?: number }): Promise<Job[]> {
    let result = Array.from(this.jobs.values());
    if (filters?.type) result = result.filter(j => j.type === filters.type);
    if (filters?.location) result = result.filter(j => j.location.toLowerCase().includes(filters.location!.toLowerCase()));
    if (filters?.isActive !== undefined) result = result.filter(j => j.isActive === filters.isActive);
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const id = Math.random().toString(36).substring(2, 11);
    const j = job as any;
    const newJob: Job = {
      id,
      title: j.title,
      description: j.description,
      type: j.type,
      category: j.category,
      postedById: j.postedById,
      location: j.location,
      projectId: j.projectId || null,
      budget: j.budget || null,
      currency: j.currency || 'NGN',
      paymentType: j.paymentType || null,
      duration: j.duration || null,
      requirements: j.requirements || null,
      skills: j.skills || null,
      experience: j.experience || null,
      deadline: j.deadline ? new Date(j.deadline) : null,
      isUrgent: j.isUrgent ?? false,
      isActive: j.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const updatedJob = { ...job, ...updates, updatedAt: new Date() };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async getJobApplications(filters?: { jobId?: string; applicantId?: string; status?: string }): Promise<JobApplication[]> {
    let result = Array.from(this.jobApplications.values());
    if (filters?.jobId) result = result.filter(a => a.jobId === filters.jobId);
    if (filters?.applicantId) result = result.filter(a => a.applicantId === filters.applicantId);
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    return result;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const id = Math.random().toString(36).substring(2, 11);
    const a = application as any;
    const newApp: JobApplication = {
      id,
      jobId: a.jobId,
      applicantId: a.applicantId,
      coverLetter: a.coverLetter || null,
      portfolio: a.portfolio || null,
      proposedRate: a.proposedRate || null,
      status: a.status || 'pending',
      appliedAt: new Date(),
      reviewedAt: null,
      reviewNotes: null
    };
    this.jobApplications.set(id, newApp);
    return newApp;
  }

  async updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const app = this.jobApplications.get(id);
    if (!app) return undefined;
    const updatedApp = { ...app, ...updates };
    this.jobApplications.set(id, updatedApp);
    return updatedApp;
  }

  async getMessages(userId: string, otherUserId?: string): Promise<Message[]> {
    let result = Array.from(this.messages.values()).filter(m => m.senderId === userId || m.recipientId === userId);
    if (otherUserId) {
      result = result.filter(m => m.senderId === otherUserId || m.recipientId === otherUserId);
    }
    return result.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = Math.random().toString(36).substring(2, 11);
    const m = message as any;
    const newMessage: Message = {
      id,
      senderId: m.senderId,
      recipientId: m.recipientId,
      content: m.content,
      subject: m.subject || null,
      isRead: false,
      threadId: m.threadId || null,
      attachments: m.attachments || null,
      sentAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const msg = this.messages.get(id);
    if (!msg) return false;
    this.messages.set(id, { ...msg, isRead: true });
    return true;
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.revieweeId === userId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = Math.random().toString(36).substring(2, 11);
    const r = review as any;
    const newReview: Review = {
      id,
      reviewerId: r.reviewerId,
      revieweeId: r.revieweeId,
      rating: r.rating,
      projectId: r.projectId || null,
      comment: r.comment || null,
      isPublic: r.isPublic ?? true,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async searchTalent(filters: { role?: string; location?: string; skills?: string[]; limit?: number }): Promise<UserRole[]> {
    let roles = Array.from(this.userRoles.values()).filter(r => r.isActive);
    if (filters.role) roles = roles.filter(r => r.role === filters.role);

    if (filters.location) {
      roles = roles.filter(r => {
        const user = this.users.get(r.userId);
        return user?.location?.toLowerCase().includes(filters.location!.toLowerCase());
      });
    }

    if (filters.skills && filters.skills.length > 0) {
      roles = roles.filter(r => (r.skills || []).some(s => filters.skills!.some(k => s.toLowerCase().includes(k.toLowerCase()))));
    }

    if (filters.limit) roles = roles.slice(0, filters.limit);
    return roles;
  }

  async getDashboardData(userId: string): Promise<any> {
    const recentProjects = (await this.getProjects({ createdById: userId, limit: 3 }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const recentApplications = (await this.getJobApplications({ applicantId: userId }))
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())
      .slice(0, 3)
      .map(app => ({
        ...app,
        jobTitle: this.jobs.get(app.jobId)?.title || 'Unknown Job'
      }));

    const unreadMessagesCount = Array.from(this.messages.values())
      .filter(m => m.recipientId === userId && !m.isRead).length;

    const userProfile = await this.getUser(userId);

    return {
      recentProjects,
      recentApplications,
      unreadMessagesCount,
      notifications: [],
      recentActivity: [],
      connections: [],
      user: userProfile ? { id: userProfile.id, email: userProfile.email, firstName: userProfile.firstName, lastName: userProfile.lastName } : null,
    };
  }
}

const databaseUrl = process.env.DATABASE_URL;
const storageProvider = process.env.STORAGE_PROVIDER;

let storage: IStorage;

if (storageProvider === 'mem' || !databaseUrl) {
  logger.info('Using MemStorage (In-memory storage)');
  storage = new MemStorage();
} else {
  logger.info('Using DbStorage (PostgreSQL storage)');
  storage = new DbStorage();
}

export { storage };
