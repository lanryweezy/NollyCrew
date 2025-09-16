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
  type InsertReview
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private userRoles = new Map<string, UserRole>();
  private projects = new Map<string, Project>();
  private projectMembers = new Map<string, ProjectMember>();
  private jobs = new Map<string, Job>();
  private jobApplications = new Map<string, JobApplication>();
  private messages = new Map<string, Message>();
  private reviews = new Map<string, Review>();

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser,
      // Ensure all nullable fields are properly handled
      avatar: insertUser.avatar ?? null,
      bio: insertUser.bio ?? null,
      location: insertUser.location ?? null,
      phone: insertUser.phone ?? null,
      website: insertUser.website ?? null,
      id, 
      isVerified: false,
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // User roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(role => role.userId === userId);
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    const id = randomUUID();
    const userRole: UserRole = { 
      ...role,
      // Ensure all nullable fields are properly handled
      specialties: role.specialties ?? null,
      experience: role.experience ?? null,
      hourlyRate: role.hourlyRate ?? null,
      availability: role.availability ?? "available",
      portfolio: role.portfolio ?? null,
      skills: role.skills ?? null,
      languages: role.languages ?? null,
      awards: role.awards ?? null,
      credits: role.credits ?? null,
      id, 
      isActive: true,
      createdAt: new Date() 
    };
    this.userRoles.set(id, userRole);
    return userRole;
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

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(filters?: { status?: string; createdById?: string; limit?: number }): Promise<Project[]> {
    let projects = Array.from(this.projects.values());
    
    if (filters?.status) {
      projects = projects.filter(p => p.status === filters.status);
    }
    if (filters?.createdById) {
      projects = projects.filter(p => p.createdById === filters.createdById);
    }
    if (filters?.limit) {
      projects = projects.slice(0, filters.limit);
    }
    
    return projects;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const newProject: Project = { 
      ...project,
      // Ensure all nullable fields are properly handled
      budget: project.budget ?? null,
      currency: project.currency ?? "NGN",
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      location: project.location ?? null,
      poster: project.poster ?? null,
      trailer: project.trailer ?? null,
      script: project.script ?? null,
      scriptBreakdown: project.scriptBreakdown ?? null,
      status: project.status ?? "pre-production",
      id, 
      createdAt: now, 
      updatedAt: now 
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

  // Project members
  async getProjectMember(id: string): Promise<ProjectMember | undefined> {
    return this.projectMembers.get(id);
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return Array.from(this.projectMembers.values()).filter(member => member.projectId === projectId);
  }

  async createProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const id = randomUUID();
    const newMember: ProjectMember = {
      ...member,
      character: member.character ?? null,
      department: member.department ?? null,
      id,
      isLead: member.isLead ?? false,
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

  // Jobs
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(filters?: { type?: string; location?: string; isActive?: boolean; limit?: number }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters?.type) {
      jobs = jobs.filter(j => j.type === filters.type);
    }
    if (filters?.location) {
      jobs = jobs.filter(j => j.location?.includes(filters.location!));
    }
    if (filters?.isActive !== undefined) {
      jobs = jobs.filter(j => j.isActive === filters.isActive);
    }
    if (filters?.limit) {
      jobs = jobs.slice(0, filters.limit);
    }
    
    return jobs;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const id = randomUUID();
    const now = new Date();
    const newJob: Job = { 
      ...job,
      // Ensure all nullable fields are properly handled
      projectId: job.projectId ?? null,
      budget: job.budget ?? null,
      currency: job.currency ?? "NGN",
      paymentType: job.paymentType ?? null,
      duration: job.duration ?? null,
      requirements: job.requirements ?? null,
      skills: job.skills ?? null,
      experience: job.experience ?? null,
      deadline: job.deadline ?? null,
      id, 
      isActive: true,
      isUrgent: job.isUrgent ?? false,
      createdAt: now, 
      updatedAt: now 
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

  // Job applications
  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async getJobApplications(filters?: { jobId?: string; applicantId?: string; status?: string }): Promise<JobApplication[]> {
    let applications = Array.from(this.jobApplications.values());
    
    if (filters?.jobId) {
      applications = applications.filter(a => a.jobId === filters.jobId);
    }
    if (filters?.applicantId) {
      applications = applications.filter(a => a.applicantId === filters.applicantId);
    }
    if (filters?.status) {
      applications = applications.filter(a => a.status === filters.status);
    }
    
    return applications;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const id = randomUUID();
    const newApplication: JobApplication = { 
      ...application,
      // Ensure all nullable fields are properly handled
      coverLetter: application.coverLetter ?? null,
      portfolio: application.portfolio ?? null,
      proposedRate: application.proposedRate ?? null,
      id, 
      status: "pending",
      appliedAt: new Date(),
      reviewedAt: null,
      reviewNotes: null
    };
    this.jobApplications.set(id, newApplication);
    return newApplication;
  }

  async updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    if (updates.status && updates.status !== "pending") {
      updatedApplication.reviewedAt = new Date();
    }
    this.jobApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Messages
  async getMessages(userId: string, otherUserId?: string): Promise<Message[]> {
    let messages = Array.from(this.messages.values());
    
    if (otherUserId) {
      messages = messages.filter(m => 
        (m.senderId === userId && m.recipientId === otherUserId) ||
        (m.senderId === otherUserId && m.recipientId === userId)
      );
    } else {
      messages = messages.filter(m => m.senderId === userId || m.recipientId === userId);
    }
    
    return messages.sort((a, b) => a.sentAt!.getTime() - b.sentAt!.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = { 
      ...message,
      // Ensure all nullable fields are properly handled
      subject: message.subject ?? null,
      threadId: message.threadId ?? null,
      attachments: message.attachments ?? null,
      id, 
      isRead: false,
      sentAt: new Date() 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    message.isRead = true;
    this.messages.set(id, message);
    return true;
  }

  // Reviews
  async getUserReviews(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.revieweeId === userId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { 
      ...review,
      // Ensure all nullable fields are properly handled
      projectId: review.projectId ?? null,
      comment: review.comment ?? null,
      id, 
      isPublic: review.isPublic ?? true,
      createdAt: new Date() 
    };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();