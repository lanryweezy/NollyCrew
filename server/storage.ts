
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
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
    // @ts-ignore
    return db.query.projects.findMany({ where: filters });
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
    // @ts-ignore
    return db.query.jobs.findMany({ where: filters });
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
    // @ts-ignore
    return db.query.messages.findMany({ where: { userId, otherUserId } });
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
}

export const storage = new DbStorage();
