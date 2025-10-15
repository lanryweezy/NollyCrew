import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Waitlist table for collecting early-access emails
export const waitlist = pgTable("waitlist", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    email: text("email").notNull().unique(),
    name: text("name"),
    source: text("source"), // optional: landing, referral, etc
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
// Users table with multi-role support
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    avatar: text("avatar"),
    bio: text("bio"),
    location: text("location"),
    phone: text("phone"),
    website: text("website"),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        emailIdx: index("users_email_idx").on(table.email),
    };
});
// User roles - supports multiple roles per user
export const userRoles = pgTable("user_roles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'actor', 'crew', 'producer'
    specialties: text("specialties").array(),
    experience: text("experience"),
    hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
    availability: text("availability").default("available"), // 'available', 'busy', 'unavailable'
    portfolio: jsonb("portfolio"), // Links, images, videos
    skills: text("skills").array(),
    languages: text("languages").array(),
    awards: jsonb("awards"),
    credits: jsonb("credits"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("user_roles_user_id_idx").on(table.userId),
        roleIdx: index("user_roles_role_idx").on(table.role),
    };
});
// Projects table
export const projects = pgTable("projects", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description").notNull(),
    genre: text("genre").notNull(),
    type: text("type").notNull(), // 'feature', 'short', 'series', 'commercial', 'documentary'
    status: text("status").notNull().default("pre-production"), // 'pre-production', 'production', 'post-production', 'completed', 'cancelled'
    budget: decimal("budget", { precision: 15, scale: 2 }),
    currency: text("currency").notNull().default("NGN"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    location: text("location"),
    poster: text("poster"),
    trailer: text("trailer"),
    script: text("script"), // File path or content
    scriptBreakdown: jsonb("script_breakdown"), // AI-generated breakdown
    createdById: varchar("created_by_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        createdByIdx: index("projects_created_by_idx").on(table.createdById),
        statusIdx: index("projects_status_idx").on(table.status),
        typeIdx: index("projects_type_idx").on(table.type),
    };
});
// Project team members
export const projectMembers = pgTable("project_members", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'director', 'producer', 'actor', 'cinematographer', etc.
    character: text("character"), // For actors
    department: text("department"), // 'camera', 'sound', 'editing', etc.
    isLead: boolean("is_lead").notNull().default(false),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => {
    return {
        projectIdIdx: index("project_members_project_id_idx").on(table.projectId),
        userIdIdx: index("project_members_user_id_idx").on(table.userId),
        uniqueProjectUser: unique("unique_project_user").on(table.projectId, table.userId, table.role),
    };
});
// Jobs/Casting calls
export const jobs = pgTable("jobs", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull(), // 'casting', 'crew', 'project'
    category: text("category").notNull(), // 'lead-actor', 'supporting-actor', 'cinematographer', etc.
    projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
    postedById: varchar("posted_by_id").notNull().references(() => users.id),
    location: text("location").notNull(),
    budget: decimal("budget", { precision: 10, scale: 2 }),
    currency: text("currency").notNull().default("NGN"),
    paymentType: text("payment_type"), // 'fixed', 'hourly', 'daily', 'project'
    duration: text("duration"), // '2 weeks', '3 months', etc.
    requirements: text("requirements").array(),
    skills: text("skills").array(),
    experience: text("experience"), // 'entry', 'mid', 'senior', 'expert'
    deadline: timestamp("deadline"),
    isUrgent: boolean("is_urgent").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        postedByIdx: index("jobs_posted_by_idx").on(table.postedById),
        projectIdIdx: index("jobs_project_id_idx").on(table.projectId),
        typeIdx: index("jobs_type_idx").on(table.type),
        isActiveIdx: index("jobs_is_active_idx").on(table.isActive),
    };
});
// Job applications
export const jobApplications = pgTable("job_applications", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
    applicantId: varchar("applicant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    coverLetter: text("cover_letter"),
    portfolio: jsonb("portfolio"), // Additional materials for this application
    proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
    status: text("status").notNull().default("pending"), // 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'
    appliedAt: timestamp("applied_at").notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
}, (table) => {
    return {
        jobIdIdx: index("job_applications_job_id_idx").on(table.jobId),
        applicantIdIdx: index("job_applications_applicant_id_idx").on(table.applicantId),
        statusIdx: index("job_applications_status_idx").on(table.status),
        uniqueJobApplicant: unique("unique_job_applicant").on(table.jobId, table.applicantId),
    };
});
// Messages
export const messages = pgTable("messages", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    senderId: varchar("sender_id").notNull().references(() => users.id),
    recipientId: varchar("recipient_id").notNull().references(() => users.id),
    subject: text("subject"),
    content: text("content").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    threadId: varchar("thread_id"), // Group related messages
    attachments: jsonb("attachments"),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
}, (table) => {
    return {
        senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
        recipientIdIdx: index("messages_recipient_id_idx").on(table.recipientId),
        threadIdIdx: index("messages_thread_id_idx").on(table.threadId),
    };
});
// Reviews/Ratings
export const reviews = pgTable("reviews", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
    revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
    projectId: varchar("project_id").references(() => projects.id),
    rating: integer("rating").notNull(), // 1-5 stars
    comment: text("comment"),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
    return {
        reviewerIdIdx: index("reviews_reviewer_id_idx").on(table.reviewerId),
        revieweeIdIdx: index("reviews_reviewee_id_idx").on(table.revieweeId),
        projectIdIdx: index("reviews_project_id_idx").on(table.projectId),
        ratingIdx: index("reviews_rating_idx").on(table.rating),
    };
});
// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    passwordHash: true,
}).extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
    id: true,
    createdAt: true,
});
export const insertProjectSchema = createInsertSchema(projects).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
    id: true,
    joinedAt: true,
});
export const insertJobSchema = createInsertSchema(jobs).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
    id: true,
    appliedAt: true,
    reviewedAt: true,
});
export const insertMessageSchema = createInsertSchema(messages).omit({
    id: true,
    sentAt: true,
});
export const insertReviewSchema = createInsertSchema(reviews).omit({
    id: true,
    createdAt: true,
}).extend({
    rating: z.number().min(1).max(5),
});
// Waitlist insert schema
export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
    id: true,
    createdAt: true,
}).extend({
    email: z.string().email(),
    name: z.string().optional(),
    source: z.string().optional(),
});
