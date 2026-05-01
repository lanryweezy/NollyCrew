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
  type AuditLog,
  type InsertAuditLog,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type ApiKey,
  type InsertApiKey,
  type EscrowTransaction,
  type InsertEscrowTransaction,
  type KycVerification,
  type InsertKycVerification,
  type DailyProgressReport,
  type InsertDailyProgressReport,
  type SupportTicket,
  type InsertSupportTicket,
  type Referral,
  type InsertReferral,
  users,
  userRoles,
  projects,
  projectMembers,
  jobs,
  jobApplications,
  messages,
  reviews,
  auditLogs,
  subscriptionPlans,
  subscriptions,
  apiKeys,
  escrowTransactions,
  kycVerifications,
  dailyProgressReports,
  supportTickets,
  referrals
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, count, ilike } from "drizzle-orm";
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

  // Audit Logs
  getAuditLogs(filters?: { userId?: string; entityType?: string; entityId?: string; limit?: number }): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Subscriptions
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined>;

  // API Keys
  getApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<boolean>;

  // Escrow Transactions
  getEscrowTransactions(filters?: { senderId?: string; recipientId?: string; projectId?: string; status?: string; limit?: number }): Promise<EscrowTransaction[]>;
  createEscrowTransaction(transaction: InsertEscrowTransaction): Promise<EscrowTransaction>;
  updateEscrowTransaction(id: string, updates: Partial<InsertEscrowTransaction>): Promise<EscrowTransaction | undefined>;

  // KYC
  getKycVerifications(userId: string): Promise<KycVerification[]>;
  createKycVerification(verification: InsertKycVerification): Promise<KycVerification>;
  updateKycVerification(id: string, updates: Partial<InsertKycVerification>): Promise<KycVerification | undefined>;

  // DPR
  getDPRs(projectId: string): Promise<DailyProgressReport[]>;
  createDPR(report: InsertDailyProgressReport): Promise<DailyProgressReport>;

  // Support Tickets
  getSupportTickets(filters?: { userId?: string; status?: string; type?: string; limit?: number }): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;

  // Referrals
  getReferrals(userId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: string, updates: Partial<InsertReferral>): Promise<Referral | undefined>;

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
    const result = await db.insert(users).values(user as any).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates as any).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return db.query.userRoles.findMany({ where: eq(userRoles.userId, userId) });
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    const result = await db.insert(userRoles).values(role as any).returning();
    return result[0];
  }

  async updateUserRole(id: string, updates: Partial<InsertUserRole>): Promise<UserRole | undefined> {
    const result = await db.update(userRoles).set(updates as any).where(eq(userRoles.id, id)).returning();
    return result[0];
  }

  async deleteUserRole(id: string): Promise<boolean> {
    const result = await db.delete(userRoles).where(eq(userRoles.id, id));
    return (result.rowCount ?? 0) > 0;
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
    const result = await db.insert(projects).values(project as any).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects).set(updates as any).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getProjectMember(id: string): Promise<ProjectMember | undefined> {
    return db.query.projectMembers.findFirst({ where: eq(projectMembers.id, id) });
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return db.query.projectMembers.findMany({ where: eq(projectMembers.projectId, projectId) });
  }

  async createProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const result = await db.insert(projectMembers).values(member as any).returning();
    return result[0];
  }

  async updateProjectMember(id: string, updates: Partial<InsertProjectMember>): Promise<ProjectMember | undefined> {
    const result = await db.update(projectMembers).set(updates as any).where(eq(projectMembers.id, id)).returning();
    return result[0];
  }

  async deleteProjectMember(id: string): Promise<boolean> {
    const result = await db.delete(projectMembers).where(eq(projectMembers.id, id));
    return (result.rowCount ?? 0) > 0;
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
        location ? ilike ? ilike(j.location, `%${location}%`) : undefined : undefined,
      ),
      limit: limit && Number.isFinite(limit) ? Math.max(1, Math.min(100, limit)) : undefined,
    });
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
    const result = await db.insert(jobs).values(job as any).returning();
    return result[0];
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(updates as any).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return db.query.jobApplications.findFirst({ where: eq(jobApplications.id, id) });
  }

  async getJobApplications(filters?: { jobId?: string; applicantId?: string; status?: string }): Promise<JobApplication[]> {
    // @ts-ignore
    return db.query.jobApplications.findMany({ where: filters });
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const result = await db.insert(jobApplications).values(application as any).returning();
    return result[0];
  }

  async updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const result = await db.update(jobApplications).set(updates as any).where(eq(jobApplications.id, id)).returning();
    return result[0];
  }

  async getMessages(userId: string, otherUserId?: string): Promise<Message[]> {
    if (otherUserId) {
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

  async searchTalent(filters: { role?: string; location?: string; skills?: string[]; limit?: number }): Promise<UserRole[]> {
    const { role, location, skills, limit } = filters;
    // @ts-ignore
    let rows: UserRole[] = await db.query.userRoles.findMany({
      where: (ur: any, { and, eq }: any) => and(
        eq(ur.isActive, true),
        role ? eq(ur.role, role) : undefined,
      ),
      limit: Math.min(200, limit ?? 50),
    });
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
    const result = await db.insert(messages).values(message as any).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const result = await db.update(messages).set({ isRead: true } as any).where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return db.query.reviews.findMany({ where: eq(reviews.revieweeId, userId) });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review as any).returning();
    return result[0];
  }

  async getAuditLogs(filters?: { userId?: string; entityType?: string; entityId?: string; limit?: number }): Promise<AuditLog[]> {
    const { userId, entityType, entityId, limit } = filters || {};
    // @ts-ignore
    return db.query.auditLogs.findMany({
      where: (al: any, { and, eq }: any) => and(
        userId ? eq(al.userId, userId) : undefined,
        entityType ? eq(al.entityType, entityType) : undefined,
        entityId ? eq(al.entityId, entityId) : undefined,
      ),
      orderBy: [desc(auditLogs.createdAt)],
      limit: limit || 100,
    });
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(log as any).returning();
    return result[0];
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.query.subscriptionPlans.findMany({ where: eq(subscriptionPlans.isActive, true) });
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.id, id) });
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const result = await db.insert(subscriptionPlans).values(plan as any).returning();
    return result[0];
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    return db.query.subscriptions.findFirst({ 
      where: eq(subscriptions.userId, userId),
      orderBy: [desc(subscriptions.createdAt)]
    });
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription as any).returning();
    return result[0];
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set(updates as any).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return db.query.apiKeys.findMany({ where: eq(apiKeys.userId, userId) });
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    return db.query.apiKeys.findFirst({ where: eq(apiKeys.id, id) });
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const result = await db.insert(apiKeys).values(apiKey as any).returning();
    return result[0];
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getEscrowTransactions(filters?: { senderId?: string; recipientId?: string; projectId?: string; status?: string; limit?: number }): Promise<EscrowTransaction[]> {
    const { senderId, recipientId, projectId, status, limit } = filters || {};
    // @ts-ignore
    return db.query.escrowTransactions.findMany({
      where: (et: any, { and, eq }: any) => and(
        senderId ? eq(et.senderId, senderId) : undefined,
        recipientId ? eq(et.recipientId, recipientId) : undefined,
        projectId ? eq(et.projectId, projectId) : undefined,
        status ? eq(et.status, status) : undefined,
      ),
      orderBy: [desc(escrowTransactions.createdAt)],
      limit: limit || 50,
    });
  }

  async createEscrowTransaction(transaction: InsertEscrowTransaction): Promise<EscrowTransaction> {
    const result = await db.insert(escrowTransactions).values(transaction as any).returning();
    return result[0];
  }

  async updateEscrowTransaction(id: string, updates: Partial<InsertEscrowTransaction>): Promise<EscrowTransaction | undefined> {
    const result = await db.update(escrowTransactions).set(updates as any).where(eq(escrowTransactions.id, id)).returning();
    return result[0];
  }

  async getKycVerifications(userId: string): Promise<KycVerification[]> {
    return db.query.kycVerifications.findMany({ 
      where: eq(kycVerifications.userId, userId),
      orderBy: [desc(kycVerifications.createdAt)]
    });
  }

  async createKycVerification(verification: InsertKycVerification): Promise<KycVerification> {
    const result = await db.insert(kycVerifications).values(verification as any).returning();
    return result[0];
  }

  async updateKycVerification(id: string, updates: Partial<InsertKycVerification>): Promise<KycVerification | undefined> {
    const result = await db.update(kycVerifications).set(updates as any).where(eq(kycVerifications.id, id)).returning();
    return result[0];
  }

  async getDPRs(projectId: string): Promise<DailyProgressReport[]> {
    return db.query.dailyProgressReports.findMany({
      where: eq(dailyProgressReports.projectId, projectId),
      orderBy: [desc(dailyProgressReports.reportDate)]
    });
  }

  async createDPR(report: InsertDailyProgressReport): Promise<DailyProgressReport> {
    const result = await db.insert(dailyProgressReports).values(report as any).returning();
    return result[0];
  }

  async getSupportTickets(filters?: { userId?: string; status?: string; type?: string; limit?: number }): Promise<SupportTicket[]> {
    const { userId, status, type, limit } = filters || {};
    // @ts-ignore
    return db.query.supportTickets.findMany({
      where: (st: any, { and, eq }: any) => and(
        userId ? eq(st.userId, userId) : undefined,
        status ? eq(st.status, status) : undefined,
        type ? eq(st.type, type) : undefined,
      ),
      orderBy: [desc(supportTickets.createdAt)],
      limit: limit || 100,
    });
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const result = await db.insert(supportTickets).values(ticket as any).returning();
    return result[0];
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const result = await db.update(supportTickets).set({ ...updates, updatedAt: new Date() } as any).where(eq(supportTickets.id, id)).returning();
    return result[0];
  }

  async getReferrals(userId: string): Promise<Referral[]> {
    return db.query.referrals.findMany({
      where: eq(referrals.referrerId, userId),
      orderBy: [desc(referrals.createdAt)]
    });
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(referral as any).returning();
    return result[0];
  }

  async updateReferral(id: string, updates: Partial<InsertReferral>): Promise<Referral | undefined> {
    const result = await db.update(referrals).set(updates as any).where(eq(referrals.id, id)).returning();
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
  private auditLogs = new Map<string, AuditLog>();
  private subscriptionPlans = new Map<string, SubscriptionPlan>();
  private subscriptions = new Map<string, Subscription>();
  private apiKeys = new Map<string, ApiKey>();
  private escrowTransactions = new Map<string, EscrowTransaction>();
  private kycVerifications = new Map<string, KycVerification>();
  private dailyProgressReports = new Map<string, DailyProgressReport>();
  private supportTickets = new Map<string, SupportTicket>();
  private referrals = new Map<string, Referral>();

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
      permissions: m.permissions || null,
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

  async getAuditLogs(filters?: { userId?: string; entityType?: string; entityId?: string; limit?: number }): Promise<AuditLog[]> {
    let result = Array.from(this.auditLogs.values());
    if (filters?.userId) result = result.filter(l => l.userId === filters.userId);
    if (filters?.entityType) result = result.filter(l => l.entityType === filters.entityType);
    if (filters?.entityId) result = result.filter(l => l.entityId === filters.entityId);
    result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = Math.random().toString(36).substring(2, 11);
    const l = log as any;
    const newLog: AuditLog = {
      id,
      userId: l.userId || null,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      previousData: l.previousData || null,
      newData: l.newData || null,
      ipAddress: l.ipAddress || null,
      userAgent: l.userAgent || null,
      createdAt: new Date()
    };
    this.auditLogs.set(id, newLog);
    return newLog;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(p => p.isActive);
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = Math.random().toString(36).substring(2, 11);
    const p = plan as any;
    const newPlan: SubscriptionPlan = {
      id,
      name: p.name,
      description: p.description || null,
      price: p.price,
      currency: p.currency || 'NGN',
      interval: p.interval || 'monthly',
      features: p.features || null,
      isActive: p.isActive ?? true,
      createdAt: new Date()
    };
    this.subscriptionPlans.set(id, newPlan);
    return newPlan;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const subs = Array.from(this.subscriptions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return subs[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = Math.random().toString(36).substring(2, 11);
    const s = subscription as any;
    const newSub: Subscription = {
      id,
      userId: s.userId,
      planId: s.planId,
      status: s.status,
      startDate: s.startDate ? new Date(s.startDate) : new Date(),
      endDate: new Date(s.endDate),
      paystackSubscriptionCode: s.paystackSubscriptionCode || null,
      paystackEmailToken: s.paystackEmailToken || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptions.set(id, newSub);
    return newSub;
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const sub = this.subscriptions.get(id);
    if (!sub) return undefined;
    const updatedSub = { ...sub, ...updates, updatedAt: new Date() } as any;
    this.subscriptions.set(id, updatedSub);
    return updatedSub;
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(k => k.userId === userId);
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = Math.random().toString(36).substring(2, 11);
    const k = apiKey as any;
    const newKey: ApiKey = {
      id,
      userId: k.userId,
      name: k.name,
      keyHash: k.keyHash,
      lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : null,
      expiresAt: k.expiresAt ? new Date(k.expiresAt) : null,
      createdAt: new Date()
    };
    this.apiKeys.set(id, newKey);
    return newKey;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  async getEscrowTransactions(filters?: { senderId?: string; recipientId?: string; projectId?: string; status?: string; limit?: number }): Promise<EscrowTransaction[]> {
    let result = Array.from(this.escrowTransactions.values());
    if (filters?.senderId) result = result.filter(t => t.senderId === filters.senderId);
    if (filters?.recipientId) result = result.filter(t => t.recipientId === filters.recipientId);
    if (filters?.projectId) result = result.filter(t => t.projectId === filters.projectId);
    if (filters?.status) result = result.filter(t => t.status === filters.status);
    result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result;
  }

  async createEscrowTransaction(transaction: InsertEscrowTransaction): Promise<EscrowTransaction> {
    const id = Math.random().toString(36).substring(2, 11);
    const t = transaction as any;
    const newTransaction: EscrowTransaction = {
      id,
      projectId: t.projectId || null,
      jobId: t.jobId || null,
      senderId: t.senderId,
      recipientId: t.recipientId,
      amount: t.amount,
      currency: t.currency || 'NGN',
      status: t.status || 'escrow',
      paystackReference: t.paystackReference || null,
      releaseDate: t.releaseDate ? new Date(t.releaseDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.escrowTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateEscrowTransaction(id: string, updates: Partial<InsertEscrowTransaction>): Promise<EscrowTransaction | undefined> {
    const trans = this.escrowTransactions.get(id);
    if (!trans) return undefined;
    const updatedTrans = { ...trans, ...updates, updatedAt: new Date() } as any;
    this.escrowTransactions.set(id, updatedTrans);
    return updatedTrans;
  }

  async getKycVerifications(userId: string): Promise<KycVerification[]> {
    return Array.from(this.kycVerifications.values())
      .filter(v => v.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createKycVerification(verification: InsertKycVerification): Promise<KycVerification> {
    const id = Math.random().toString(36).substring(2, 11);
    const v = verification as any;
    const newVerification: KycVerification = {
      id,
      userId: v.userId,
      type: v.type,
      status: v.status || 'pending',
      provider: v.provider || null,
      providerReference: v.providerReference || null,
      idNumberMasked: v.idNumberMasked || null,
      notes: v.notes || null,
      verifiedAt: v.verifiedAt ? new Date(v.verifiedAt) : null,
      createdAt: new Date()
    };
    this.kycVerifications.set(id, newVerification);
    return newVerification;
  }

  async updateKycVerification(id: string, updates: Partial<InsertKycVerification>): Promise<KycVerification | undefined> {
    const kyc = this.kycVerifications.get(id);
    if (!kyc) return undefined;
    const updatedKyc = { ...kyc, ...updates } as any;
    this.kycVerifications.set(id, updatedKyc);
    return updatedKyc;
  }

  async getDPRs(projectId: string): Promise<DailyProgressReport[]> {
    return Array.from(this.dailyProgressReports.values())
      .filter(r => r.projectId === projectId)
      .sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
  }

  async createDPR(report: InsertDailyProgressReport): Promise<DailyProgressReport> {
    const id = Math.random().toString(36).substring(2, 11);
    const r = report as any;
    const newReport: DailyProgressReport = {
      id,
      projectId: r.projectId,
      reportDate: new Date(r.reportDate),
      scenesPlanned: r.scenesPlanned || null,
      scenesShot: r.scenesShot || null,
      crewPresent: r.crewPresent || null,
      highlights: r.highlights || null,
      challenges: r.challenges || null,
      createdAt: new Date()
    };
    this.dailyProgressReports.set(id, newReport);
    return newReport;
  }

  async getSupportTickets(filters?: { userId?: string; status?: string; type?: string; limit?: number }): Promise<SupportTicket[]> {
    let result = Array.from(this.supportTickets.values());
    if (filters?.userId) result = result.filter(t => t.userId === filters.userId);
    if (filters?.status) result = result.filter(t => t.status === filters.status);
    if (filters?.type) result = result.filter(t => t.type === filters.type);
    result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = Math.random().toString(36).substring(2, 11);
    const t = ticket as any;
    const newTicket: SupportTicket = {
      id,
      userId: t.userId,
      projectId: t.projectId || null,
      subject: t.subject,
      description: t.description,
      type: t.type,
      status: t.status || 'open',
      priority: t.priority || 'medium',
      metadata: t.metadata || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.supportTickets.set(id, newTicket);
    return newTicket;
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    const updatedTicket = { ...ticket, ...updates, updatedAt: new Date() } as any;
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getReferrals(userId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(r => r.referrerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = Math.random().toString(36).substring(2, 11);
    const r = referral as any;
    const newReferral: Referral = {
      id,
      referrerId: r.referrerId,
      referredEmail: r.referredEmail,
      status: r.status || 'pending',
      rewardStatus: r.rewardStatus || 'none',
      createdAt: new Date()
    };
    this.referrals.set(id, newReferral);
    return newReferral;
  }

  async updateReferral(id: string, updates: Partial<InsertReferral>): Promise<Referral | undefined> {
    const ref = this.referrals.get(id);
    if (!ref) return undefined;
    const updatedRef = { ...ref, ...updates } as any;
    this.referrals.set(id, updatedRef);
    return updatedRef;
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
