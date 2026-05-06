import * as dotenv from "dotenv";
dotenv.config();

import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { sign as jwtSign, verify as jwtVerify } from "./utils/jwt.js";
import { storage } from "./storage.js";
import { logAction } from "./utils/audit.js";
import { openai } from "./ai.js";
import { requirePermission } from "./middleware/rbac.js";
import { 
  initializeTransaction, 
  verifyTransaction, 
  calculateWHT, 
  calculateServiceFee 
} from "./utils/paystack.js";
import crypto from "node:crypto";
import { insertUserSchema, insertUserRoleSchema, insertJobSchema, insertProjectSchema, insertJobApplicationSchema, insertWaitlistSchema, insertMessageSchema, insertReviewSchema, insertSupportTicketSchema } from "../shared/schema.js";
import { z } from "zod";
import paystackapi from 'paystack-api';
// AWS SDK imports - conditional based on environment
let S3Client: any, PutObjectCommand: any, getSignedUrl: any;
if (process.env.AWS_ACCESS_KEY_ID) {
  try {
    const s3 = require('@aws-sdk/client-s3');
    const presigner = require('@aws-sdk/s3-request-presigner');
    S3Client = s3.S3Client;
    PutObjectCommand = s3.PutObjectCommand;
    getSignedUrl = presigner.getSignedUrl;
  } catch (e) {
    console.warn('AWS SDK not available');
  }
}
import * as ai from './ai.js';
import * as advancedAi from './ai-advanced.js';
let pdf: any;
async function loadPdfParse() {
  if (!pdf) {
    const mod = await import('pdf-parse');
    pdf = mod.default || mod;
  }
  return pdf;
}
import multer from 'multer';
import { 
  scriptAnalysisQueue, 
  scheduleOptimizationQueue, 
  castingRecommendationQueue, 
  marketingContentQueue,
  getJobStatus 
} from './queue.js';
import { 
  getCallSheetTemplates, 
  getCallSheetTemplate, 
  generateCallSheetHTML,
  CallSheetData 
} from './callSheetTemplates.js';
import { rateLimiter, authRateLimiter, apiRateLimiter } from './middleware/rateLimiter.js';
import { validateRequest, isValidEmail, isValidPassword } from './middleware/validation.js';
import { logger } from './utils/logger.js';
import { HealthChecker } from './utils/monitoring.js';
import { exportToCSV } from './utils/export.js';

// JWT secrets
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || (JWT_SECRET + ":refresh");
const EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET || (JWT_SECRET + ":email");
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || (JWT_SECRET + ":reset");

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

import { authenticateWithClerk as authenticateToken } from './middleware/auth.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to all API routes
  app.use('/api/', apiRateLimiter);
  
  // Health check endpoint for Render with detailed information
  app.get('/api/health', async (req, res) => {
    try {
      const healthData = await HealthChecker.getSystemHealth();
      res.status(200).json(healthData);
    } catch (error) {
      logger.error('Health check failed', { error: (error as Error).message });
      res.status(500).json({ 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });

  // Waitlist endpoint with specific rate limiting
  app.post('/api/waitlist', rateLimiter(3600000, 10), async (req, res) => {
    try {
      const data = insertWaitlistSchema.parse(req.body);
      
      // Submit to Google Form if configured
      const googleFormUrl = process.env.GOOGLE_FORM_URL;
      const emailEntry = process.env.GOOGLE_FORM_EMAIL_ENTRY;
      const nameEntry = process.env.GOOGLE_FORM_NAME_ENTRY;
      const sourceEntry = process.env.GOOGLE_FORM_SOURCE_ENTRY;
      
      if (googleFormUrl && emailEntry) {
        try {
          const formData = new URLSearchParams();
          formData.append(emailEntry, data.email);
          if (nameEntry && data.name) formData.append(nameEntry, data.name);
          if (sourceEntry && data.source) formData.append(sourceEntry, data.source);
          
          const response = await fetch(googleFormUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });
          
          if (response.ok) {
            logger.info('[waitlist] submitted to Google Form', { email: data.email });
          } else {
            logger.error('[waitlist] Google Form submission failed', { status: response.status });
          }
        } catch (error) {
          logger.error('[waitlist] Google Form error', { error: (error as Error).message });
        }
      } else {
        // Fallback: just log if Google Form not configured
        logger.info('[waitlist] signup (no Google Form)', { 
          email: data.email, 
          name: data.name || null, 
          source: data.source || null 
        });
      }
      
      res.status(201).json({ ok: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Waitlist error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // Authentication routes with stricter rate limiting
  app.post('/api/auth/register', authRateLimiter, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body) as any;
      
      // Additional validation
      if (!isValidEmail(userData.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      if (!isValidPassword(userData.password)) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        logger.warn('Registration attempt with existing email', { email: userData.email });
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user with hashed password
      const { password, ...userDataWithoutPassword } = userData;
      const user = await storage.createUser({
        ...userDataWithoutPassword,
        passwordHash
      });

      // Generate JWT token
      const token = jwtSign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET as string, 
        { expiresIn: '7d' }
      );

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      logger.info('User registered successfully', { userId: user.id, email: user.email });
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      logger.error('Registration error', { error: (error as Error).message });
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Request email verification (sends a signed token; integrate email provider later)
  app.post('/api/auth/request-verify', authRateLimiter, authenticateToken, async (req: any, res) => {
    try {
      const token = jwtSign({ userId: req.user.id }, EMAIL_TOKEN_SECRET as string, { expiresIn: '1d' });
      // In a real system, send via email. For MVP, log token and return a hint.
      logger.info('[email-verify] token generated', { userId: req.user.id, email: req.user.email });
      res.json({ ok: true });
    } catch (error) {
      logger.error('Email verification request error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Verify email using token
  app.post('/api/auth/verify', authRateLimiter, async (req, res) => {
    try {
      const { token } = req.body as any;
      if (!token) return res.status(400).json({ error: 'token required' });
      const payload = jwtVerify(token, EMAIL_TOKEN_SECRET as string) as any;
      const user = await storage.getUser(payload.userId);
      if (!user) return res.status(400).json({ error: 'Invalid token' });
      const updated = await storage.updateUser(user.id, { isVerified: true } as any);
      const { passwordHash: _ph, ...userWithoutPassword } = updated as any;
      logger.info('Email verified', { userId: user.id });
      res.json({ user: userWithoutPassword });
    } catch (error) {
      logger.warn('Email verification failed', { error: (error as Error).message });
      return res.status(400).json({ error: 'Invalid token' });
    }
  });

  // Request password reset (logs token; integrate email later)
  app.post('/api/auth/request-password-reset', authRateLimiter, async (req, res) => {
    try {
      const { email } = req.body as any;
      if (!email) return res.status(400).json({ error: 'email required' });
      
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = jwtSign({ userId: user.id }, RESET_TOKEN_SECRET as string, { expiresIn: '1h' });
        logger.info('[password-reset] token generated', { email });
      }
      // Always respond ok to avoid user enumeration
      res.json({ ok: true });
    } catch (error) {
      logger.error('Password reset request error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reset password with token
  app.post('/api/auth/reset-password', authRateLimiter, async (req, res) => {
    try {
      const { token, password } = req.body as any;
      if (!token || !password) return res.status(400).json({ error: 'token and password required' });
      
      if (!isValidPassword(password)) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
        });
      }
      
      const payload = jwtVerify(token, RESET_TOKEN_SECRET as string) as any;
      const user = await storage.getUser(payload.userId);
      if (!user) return res.status(400).json({ error: 'Invalid token' });
      
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const updated = await storage.updateUser(user.id, { passwordHash } as any);
      
      const { passwordHash: _ph, ...userWithoutPassword } = updated as any;
      logger.info('Password reset successful', { userId: user.id });
      res.json({ user: userWithoutPassword });
    } catch (error) {
      logger.warn('Password reset failed', { error: (error as Error).message });
      return res.status(400).json({ error: 'Invalid token' });
    }
  });

  // Google OAuth login
  app.get('/api/auth/google', (req, res) => {
    // In a real implementation, redirect to Google OAuth
    // For MVP, just return a mock URL
    const mockAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.CLIENT_URL}/auth/callback&response_type=code&scope=openid%20email%20profile`;
    res.redirect(mockAuthUrl);
  });

  // Google OAuth callback
  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      // In a real implementation, exchange code for tokens and fetch user info
      // For MVP, create a mock user
      const mockUser = {
        email: 'google.user@example.com',
        firstName: 'Google',
        lastName: 'User',
        isVerified: true,
      };
      
      // Check if user exists, create if not
      let user = await storage.getUserByEmail(mockUser.email);
      if (!user) {
        user = await storage.createUser({
          ...mockUser,
          passwordHash: 'mock-google-password-hash'
        });
      }
      
      // Generate JWT token
      const token = jwtSign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET as string, 
        { expiresIn: '7d' }
      );
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      logger.info('Google OAuth login successful', { userId: user.id, email: user.email });
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      logger.error('Google OAuth error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Login route
  app.post('/api/auth/login', authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logger.warn('Login attempt with non-existent email', { email });
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        logger.warn('Login attempt with invalid password', { email: user.email });
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwtSign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET as string, 
        { expiresIn: '7d' }
      );
      const refreshToken = jwtSign({ userId: user.id }, REFRESH_SECRET as string, { expiresIn: '30d' });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      logger.info('User logged in successfully', { userId: user.id, email: user.email });
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      logger.error('Login error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const userRoles = await storage.getUserRoles(req.user.id);
      const { passwordHash: _, ...userWithoutPassword } = req.user;
      res.json({ user: userWithoutPassword, roles: userRoles });
    } catch (error) {
      logger.error('Get user error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Refresh token
  app.post('/api/auth/refresh', async (req: any, res) => {
    try {
      const token = req.cookies?.refresh_token;
      if (!token) return res.status(401).json({ error: 'No refresh token' });
      const payload = jwtVerify(token, REFRESH_SECRET as string) as any;
      const user = await storage.getUser(payload.userId);
      if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
      const accessToken = jwtSign({ userId: user.id, email: user.email }, JWT_SECRET as string, { expiresIn: '7d' });
      res.json({ token: accessToken });
    } catch (error) {
      logger.warn('Invalid refresh token', { error: (error as Error).message });
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  });

  // Auth logout clears refresh cookie
  app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    logger.info('User logged out', { userId: req.user.id });
    res.json({ ok: true });
  });

  // Dashboard route
  app.get('/api/dashboard', authenticateToken, async (req: any, res) => {
    try {
      const dashboardData = await storage.getDashboardData(req.user.id);
      res.json(dashboardData);
    } catch (error) {
      logger.error('Dashboard data error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Paystack Payment Routes
  const paystack = process.env.PAYSTACK_SECRET_KEY ? paystackapi(process.env.PAYSTACK_SECRET_KEY!) : null;

  app.post('/api/payment/paystack/initialize', authenticateToken, async (req: any, res) => {
    try {
      if (!paystack) {
        return res.status(500).json({ error: 'Payment system not configured' });
      }
      
      const { amount, email } = req.body;
      
      const response = await paystack.transaction.initialize({
        email,
        amount: amount * 100, // Convert to kobo
        callback_url: `${process.env.CLIENT_URL}/payment/callback`,
        metadata: {
          userId: req.user.id,
        }
      });
      
      res.json({ authorization_url: response.data.authorization_url });
    } catch (error) {
      logger.error('Paystack initialization error', { error: (error as Error).message });
      res.status(500).json({ error: 'Payment initialization failed' });
    }
  });

  // User profile routes
  app.get('/api/profile', authenticateToken, async (req: any, res) => {
    try {
      const userRoles = await storage.getUserRoles(req.user.id);
      const { passwordHash: _, ...userWithoutPassword } = req.user;
      res.json({ user: userWithoutPassword, roles: userRoles });
    } catch (error) {
      logger.error('Get profile error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/profile', authenticateToken, async (req: any, res) => {
    try {
      // SENTINEL SECURITY FIX: Prevent mass assignment by validating inputs
      // Omit sensitive fields like isVerified and passwordHash from updates
      const updates = insertUserSchema.partial().omit({ isVerified: true, passwordHash: true } as any).parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Update profile error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User role management
  app.post('/api/profile/roles', authenticateToken, async (req: any, res) => {
    try {
      const roleData = insertUserRoleSchema.parse(req.body);
      const newRole = await storage.createUserRole({
        ...roleData,
        userId: req.user.id
      });
      res.status(201).json(newRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Create role error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Back-compat route for tests expecting /api/users/:userId/roles
  app.post('/api/users/:userId/roles', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const roleData = insertUserRoleSchema.parse({ ...req.body, userId });
      // Ensure user doesn't already have this role
      const existing = await storage.getUserRoles(userId);
      if ((existing as Array<{ role?: string }>).some((r) => r.role === (roleData as any).role)) {
        return res.status(400).json({ error: 'User already has this role' });
      }
      const newRole = await storage.createUserRole({
        ...roleData,
        userId: req.user.id
      });
      res.status(201).json({ role: newRole });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Create role error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/profile/roles', authenticateToken, async (req: any, res) => {
    try {
      const roles = await storage.getUserRoles(req.user.id);
      res.json(roles);
    } catch (error) {
      logger.error('Get roles error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Project management routes
  app.post('/api/projects', authenticateToken, async (req: any, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...projectData,
        createdById: req.user.id
      });
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Create project error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/projects', authenticateToken, async (req: any, res) => {
    try {
      const { status, limit } = req.query as any;
      const projects = await storage.getProjects({
        status: status as string,
        createdById: req.user.id,
        limit: typeof limit === 'string' ? parseInt(limit) : undefined
      });
      res.json(projects);
    } catch (error) {
      logger.error('Get projects error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/projects/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      // Check if user has access to this project
      if (project.createdById !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      res.json(project);
    } catch (error) {
      logger.error('Get project error', { error: (error as Error).message, userId: req.user?.id, projectId: req.params.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/projects/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;

      // SENTINEL SECURITY FIX: Prevent mass assignment by validating inputs
      // Omit sensitive fields like createdById to prevent transferring ownership
      const updates = insertProjectSchema.partial().omit({ createdById: true } as any).parse(req.body);

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      // Check if user has access to this project
      if (project.createdById !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const updatedProject = await storage.updateProject(id, updates);
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Update project error', { error: (error as Error).message, userId: req.user?.id, projectId: req.params.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/projects/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      // Check if user has access to this project
      if (project.createdById !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ ok: true });
    } catch (error) {
      logger.error('Delete project error', { error: (error as Error).message, userId: req.user?.id, projectId: req.params.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Job management routes
  app.post('/api/jobs', authenticateToken, async (req: any, res) => {
    try {
      const withDefaults = {
        ...req.body,
        postedById: req.user.id,
        currency: req.body?.currency ?? 'NGN',
        isActive: typeof req.body?.isActive === 'boolean' ? req.body.isActive : true,
      };
      const jobData = insertJobSchema.parse(withDefaults);
      const job = await storage.createJob(jobData as any);
      res.status(201).json({ job });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Create job error', { error: (error as Error).message, userId: req.user?.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/jobs', async (req: any, res) => {
    try {
      const { type, location, isActive, limit } = req.query as any;
      const jobs = await storage.getJobs({
        type: type as string,
        // drizzle layer supports optional location via ilike fallback
        // @ts-ignore
        location: location as string,
        isActive: typeof isActive === 'string' ? isActive === 'true' : true,
        limit: typeof limit === 'string' ? parseInt(limit) : undefined
      });
      res.json({ jobs });
    } catch (error) {
      logger.error('Get jobs error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/jobs/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(job);
    } catch (error) {
      logger.error('Get job error', { error: (error as Error).message, jobId: req.params.id });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Job application routes
  app.post('/api/jobs/:jobId/apply', authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Prevent duplicate application by same user
      const existing = await storage.getJobApplications({ jobId, applicantId: req.user.id });
      if (existing && existing.length) {
        return res.status(400).json({ error: 'You have already applied to this job' });
      }

      const applicationData = insertJobApplicationSchema.parse({ ...req.body, jobId, applicantId: req.user.id });
      const application = await storage.createJobApplication(applicationData as any);
      res.status(201).json({ application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      logger.error('Apply to job error', { error: (error as Error).message, userId: req.user?.id, jobId: req.params.jobId });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/jobs/:jobId/applications', authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      // Check if user is the job poster
      if (job.postedById !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const applications = await storage.getJobApplications(jobId);
      res.json(applications);
    } catch (error) {
      logger.error('Get job applications error', { error: (error as Error).message, userId: req.user?.id, jobId: req.params.jobId });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI: script analysis (async)
  app.post('/api/projects/:projectId/analyze-script', authenticateToken, upload.single('script'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      let finalScriptText = '';
      let scriptUrl: string | null = null;

      // Handle file upload or URL
      if (req.file) {
        // Extract text from PDF
        try {
          const data = await (await loadPdfParse())(req.file.buffer);
          finalScriptText = data.text;
        } catch (error) {
          console.error('PDF extraction error:', error);
          return res.status(400).json({ error: 'Failed to extract text from PDF' });
        }
      } else if (req.body.scriptUrl) {
        scriptUrl = req.body.scriptUrl as string;
        // Fetch script from URL
        try {
          const response = await fetch(scriptUrl as string);
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/pdf')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = await (await loadPdfParse())(buffer);
            finalScriptText = data.text;
          } else {
            finalScriptText = await response.text();
          }
        } catch (error) {
          console.error('Script URL fetch error:', error);
          return res.status(400).json({ error: 'Failed to fetch script from URL' });
        }
      } else if (req.body.scriptText) {
        finalScriptText = req.body.scriptText;
      } else if (project.script) {
        // Use existing project script
        try {
          const response = await fetch(project.script as string);
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/pdf')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = await (await loadPdfParse())(buffer);
            finalScriptText = data.text;
          } else {
            finalScriptText = await response.text();
          }
          scriptUrl = project.script;
        } catch (error) {
          console.error('Project script fetch error:', error);
          return res.status(400).json({ error: 'Failed to fetch project script' });
        }
      }

      // Add job to queue for async processing (if queue is available)
      if (scriptAnalysisQueue) {
        const job: any = await scriptAnalysisQueue.add('analyze-script', {
          projectId,
          scriptText: finalScriptText,
          scriptUrl: scriptUrl || project.script || null,
        });

        res.json({ 
          jobId: job.id,
          status: 'queued',
          message: 'Script analysis started. Use the job ID to check status.'
        });
      } else {
        // Fallback: process synchronously if queue is not available
        try {
          const breakdown = await ai.analyzeScriptWithAI(finalScriptText);
          
          // Create version record
          const version = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            scriptUrl: scriptUrl || project.script || null,
            data: breakdown,
          };
          
          // Update project with new version
          const prev = (project.scriptBreakdown as any) || {};
          const versions = Array.isArray(prev.versions) ? prev.versions : (prev.id ? [prev] : []);
          versions.push(version);
          const merged = { latestVersionId: version.id, versions };
          
          await storage.updateProject(projectId, {
            scriptBreakdown: merged,
          } as any);
          
          res.json({ 
            success: true,
            breakdown,
            version,
            projectId,
          });
        } catch (error) {
          console.error('Script analysis error:', error);
          res.status(500).json({ error: 'Script analysis failed' });
        }
      }
    } catch (error) {
      console.error('Analyze script error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/projects/:projectId/script/versions', authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      // @ts-ignore
      const sb = (project.scriptBreakdown as any) || {};
      res.json({ versions: Array.isArray(sb.versions) ? sb.versions : [] });
    } catch (error) {
      console.error('Get script versions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get job status
  app.get('/api/jobs/:jobId/status', authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const status = await getJobStatus(jobId);
      
      if (!status) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(status);
    } catch (error) {
      console.error('Job status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI: casting recommendations (async)
  app.post('/api/ai/analyze-script', authenticateToken, async (req: any, res) => {
    try {
      const { scriptText } = req.body;
      if (!scriptText) {
        return res.status(400).json({ error: 'Script text is required' });
      }

      const analysis = await ai.analyzeScriptWithAI(scriptText);
      
      await logAction(req, { 
        action: 'CREATE', 
        entityType: 'ai_analysis', 
        entityId: 'new',
        newData: { type: 'script_analysis' } 
      });

      res.json(analysis);
    } catch (error) {
      logger.error('Script analysis error', { error: (error as Error).message });
      res.status(500).json({ error: 'Failed to analyze script' });
    }
  });

  app.post('/api/ai/director-chat', authenticateToken, async (req: any, res) => {
    try {
      const { message, history = [] } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!openai) {
        return res.json({ reply: "I'm currently in 'script-reading' mode (OpenAI not configured). I'd love to help you once the connection is established!" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional Nollywood Virtual Director. You provide creative, logistical, and technical advice for film productions in Nigeria. Be professional, encouraging, and highly specific to the Nollywood context (Lagos locations, regional preferences, industry standards)."
          },
          ...history.map((m: any) => ({ role: m.role, content: m.content })),
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const reply = completion.choices[0]?.message?.content;
      res.json({ reply });
    } catch (error) {
      logger.error('Director chat error', { error: (error as Error).message });
      res.status(500).json({ error: 'Failed to get director advice' });
    }
  });

  app.post('/api/ai/casting', authenticateToken, async (req: any, res) => {
    try {
      const { role, requirements, location, skills, limit } = req.body as any;
      // @ts-ignore
      const candidates = await storage.searchTalent({ role, location, skills, limit: limit ?? 20 });
      
      const candidateData = candidates.map((c: any) => ({
        id: c.id,
        name: c.firstName + ' ' + c.lastName,
        bio: c.bio || '',
        skills: c.skills || [],
        experience: c.experience || '',
        location: c.location || '',
        availability: c.isActive ? 'available' : 'unavailable',
        budget: c.budget || 50000
      }));
      
      // Add job to queue for async processing (if queue is available)
      if (castingRecommendationQueue) {
        const job: any = await castingRecommendationQueue.add('generate-recommendations', {
          role: role || 'Actor',
          requirements: requirements || '',
          candidates: candidateData,
        });
        
        res.json({ 
          jobId: job.id,
          status: 'queued',
          message: 'Casting recommendations started. Use the job ID to check status.'
        });
      } else {
        // Fallback: process synchronously if queue is not available
        try {
          const recommendations = await ai.generateCastingRecommendations(
            role || 'Actor',
            requirements || '',
            candidateData
          );
          
          res.json({ 
            success: true,
            recommendations,
          });
        } catch (error) {
          console.error('Casting recommendations error:', error);
          res.status(500).json({ error: 'Casting recommendations failed' });
        }
      }
    } catch (error) {
      console.error('Casting AI error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI: schedule optimization (async)
  app.post('/api/ai/schedule/optimize', authenticateToken, async (req: any, res) => {
    try {
      const { 
        projectId,
        scenes = [], 
        maxDailyScenes = 5,
        maxDays = 10,
        maxHoursPerDay = 10,
        locationCosts = {},
        daylightHours = { start: '06:00', end: '18:00' },
        crewAvailability = {}
      } = req.body as any;
      
      const constraints = {
        maxDays,
        maxHoursPerDay,
        locationCosts,
        daylightHours,
        crewAvailability
      };
      
      // Add job to queue for async processing (if queue is available)
      if (scheduleOptimizationQueue) {
        const job: any = await scheduleOptimizationQueue.add('optimize-schedule', {
          projectId,
          scenes,
          constraints,
        });
        
        res.json({ 
          jobId: job.id,
          status: 'queued',
          message: 'Schedule optimization started. Use the job ID to check status.'
        });
      } else {
        // Fallback: process synchronously if queue is not available
        try {
          const optimization = await ai.optimizeScheduleWithAI(scenes, constraints);
          
          // Save optimized schedule
          const project = await storage.getProject(projectId);
          if (!project) {
            return res.status(404).json({ error: 'Project not found' });
          }
          
          const prev = (project.scriptBreakdown as any) || {};
          const merged = { ...prev, schedule: optimization.days };
          
          await storage.updateProject(projectId, {
            scriptBreakdown: merged,
          } as any);
          
          res.json({ 
            success: true,
            optimization,
            projectId,
          });
        } catch (error) {
          console.error('Schedule optimization error:', error);
          res.status(500).json({ error: 'Schedule optimization failed' });
        }
      }
    } catch (error) {
      console.error('Schedule optimize error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI: marketing content generation (async)
  app.post('/api/ai/marketing/generate', authenticateToken, async (req: any, res) => {
    try {
      const { projectTitle, genre, synopsis, targetAudience } = req.body as any;
      
      if (!projectTitle || !genre || !synopsis) {
        return res.status(400).json({ error: 'projectTitle, genre, and synopsis are required' });
      }
      
      // Add job to queue for async processing (if queue is available)
      if (marketingContentQueue) {
        const job: any = await marketingContentQueue.add('generate-content', {
          projectTitle,
          genre,
          synopsis,
          targetAudience: targetAudience || 'General audience'
        });
        
        res.json({ 
          jobId: job.id,
          status: 'queued',
          message: 'Marketing content generation started. Use the job ID to check status.'
        });
      } else {
        // Fallback: process synchronously if queue is not available
        try {
          const content = await ai.generateMarketingContent(
            projectTitle,
            genre,
            synopsis,
            targetAudience || 'General audience'
          );
          
          res.json({ 
            success: true,
            content,
          });
        } catch (error) {
          console.error('Marketing content generation error:', error);
          res.status(500).json({ error: 'Marketing content generation failed' });
        }
      }
    } catch (error) {
      console.error('Marketing content generation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Call sheet templates
  app.get('/api/call-sheet/templates', authenticateToken, async (req, res) => {
    try {
      const templates = await getCallSheetTemplates();
      res.json({ templates });
    } catch (error) {
      console.error('Get call sheet templates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/call-sheet/templates/:templateId', authenticateToken, async (req, res) => {
    try {
      const { templateId } = req.params;
      const template = await getCallSheetTemplate(templateId);
      if (!template) return res.status(404).json({ error: 'Template not found' });
      res.json({ template });
    } catch (error) {
      console.error('Get call sheet template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/call-sheet/generate', authenticateToken, async (req, res) => {
    try {
      const { templateId, data } = req.body as { templateId: string; data: CallSheetData };
      
      const template = await getCallSheetTemplate(templateId);
      if (!template) return res.status(404).json({ error: 'Template not found' });
      
      const html = generateCallSheetHTML(data, template);
      
      res.json({ html, template });
    } catch (error) {
      console.error('Generate call sheet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User profile fetch (user + roles)
  app.get('/api/users/:userId', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const userRoles = await storage.getUserRoles(userId);
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, roles: userRoles });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Search talent
  app.get('/api/talent/search', authenticateToken, async (req: any, res) => {
    try {
      const { role, location, skills, limit } = req.query as any;
      // @ts-ignore
      const results = await storage.searchTalent({ role, location, skills, limit: parseInt(limit) || 20 });
      res.json(results);
    } catch (error) {
      console.error('Search talent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reviews/Ratings
  app.post('/api/reviews', authenticateToken, async (req: any, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body) as any;
      const review = await storage.createReview(Object.assign({}, reviewData, { reviewerId: req.user.id }) as any);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      console.error('Create review error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/users/:userId/reviews', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Messages
  app.get('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const { otherUserId } = req.query as any;
      const messages = await storage.getMessages(req.user.id, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...messageData,
        senderId: req.user.id
      });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics routes
  const { predictProjectSuccess, generateFinancialReport, generatePerformanceBenchmarks, generateTrendAnalysis } = await import('./analytics.js');

  // Predictive Analytics - Project Success Prediction
  app.get('/api/analytics/predict/project-success', authenticateToken, async (req: any, res) => {
    try {
      const predictions = await predictProjectSuccess(req.user.id);
      res.json({ predictions });
    } catch (error) {
      console.error('Project success prediction error:', error);
      res.status(500).json({ error: 'Failed to generate project success predictions' });
    }
  });

  // Financial Reporting
  app.get('/api/analytics/financial-report', authenticateToken, async (req: any, res) => {
    try {
      const report = await generateFinancialReport(req.user.id);
      res.json({ report });
    } catch (error) {
      console.error('Financial report generation error:', error);
      res.status(500).json({ error: 'Failed to generate financial report' });
    }
  });

  // Performance Benchmarks
  app.get('/api/analytics/performance-benchmarks', authenticateToken, async (req: any, res) => {
    try {
      const benchmarks = await generatePerformanceBenchmarks(req.user.id);
      res.json({ benchmarks });
    } catch (error) {
      console.error('Performance benchmark generation error:', error);
      res.status(500).json({ error: 'Failed to generate performance benchmarks' });
    }
  });

  // Trend Analysis
  app.get('/api/analytics/trend-analysis', authenticateToken, async (req: any, res) => {
    try {
      const trends = await generateTrendAnalysis(req.user.id);
      res.json({ trends });
    } catch (error) {
      console.error('Trend analysis generation error:', error);
      res.status(500).json({ error: 'Failed to generate trend analysis' });
    }
  });

  // Boss Analytics Admin Endpoint
  app.get('/api/admin/stats', authenticateToken, async (req: any, res) => {
    try {
      const roles = await storage.getUserRoles(req.user.id);
      if (!roles.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const [totalProjects, totalJobs, transactions] = await Promise.all([
        storage.getProjects({ limit: 10000 }),
        storage.getJobs({ limit: 10000 }),
        storage.getEscrowTransactions({ limit: 10000 })
      ]);
      
      const totalEscrowVolume = transactions
        .filter(t => t.status === 'released' || t.status === 'escrow')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Note: We don't have a direct getTotalUsers in storage yet, 
      // but we can estimate or add it. For now, using a placeholder if not available.
      const stats = {
        totalUsers: 240, // Should add getTotalUsers to IStorage
        totalProjects: totalProjects.length,
        totalJobs: totalJobs.length,
        totalEscrowVolume,
        activeUsersToday: 56
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Boss stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  // Pillar 2: Advanced AI Endpoints
  
  // 17. Video Analysis
  app.post('/api/ai/video-analysis', authenticateToken, async (req: any, res) => {
    try {
      const { videoUri, mimeType } = req.body;
      if (!videoUri) return res.status(400).json({ error: 'Video URI required' });
      
      const analysis = await advancedAi.analyzeAuditionVideo(videoUri, mimeType || 'video/mp4');
      res.json(analysis);
    } catch (error) {
      console.error('Video analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze video' });
    }
  });

  // 21. Script Translation
  app.post('/api/ai/translate', authenticateToken, async (req: any, res) => {
    try {
      const { scriptText, targetLanguage } = req.body;
      if (!scriptText || !targetLanguage) return res.status(400).json({ error: 'Script text and target language required' });
      
      const translation = await advancedAi.translateScript(scriptText, targetLanguage);
      res.json({ translation });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Failed to translate script' });
    }
  });

  // 22. Sentiment Analysis
  app.post('/api/ai/sentiment', authenticateToken, async (req: any, res) => {
    try {
      const { scriptText } = req.body;
      if (!scriptText) return res.status(400).json({ error: 'Script text required' });
      
      const analysis = await advancedAi.analyzeSentiment(scriptText);
      res.json(analysis);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
  });

  // 27. Legal AI
  app.post('/api/ai/legal/release-form', authenticateToken, async (req: any, res) => {
    try {
      const { talentName, roleName, projectName, rate } = req.body;
      if (!talentName || !roleName || !projectName) return res.status(400).json({ error: 'Missing required parameters' });
      
      const document = await advancedAi.generateReleaseForm(talentName, roleName, projectName, rate || 'TBD');
      res.json({ document });
    } catch (error) {
      console.error('Legal AI error:', error);
      res.status(500).json({ error: 'Failed to generate legal document' });
    }
  });

  // 30. Fatigue Prediction
  app.post('/api/ai/predict-fatigue', authenticateToken, async (req: any, res) => {
    try {
      const { scheduleDays } = req.body;
      if (!scheduleDays || !Array.isArray(scheduleDays)) return res.status(400).json({ error: 'Schedule days array required' });
      
      const prediction = await advancedAi.predictFatigue(scheduleDays);
      res.json(prediction);
      } catch (error) {
      console.error('Fatigue prediction error:', error);
      res.status(500).json({ error: 'Failed to predict fatigue' });
      }
      });

      // --- Pillar 4: Scalability, Business & Operations ---

      // Audit Logs (Task 61)
      app.get("/api/admin/audit-logs", authenticateToken, async (req: any, res) => {
      // Check if user is admin
      const roles = await storage.getUserRoles(req.user.id);
      if (!roles.some(r => r.role === 'admin')) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      const logs = await storage.getAuditLogs(req.query as any);
      res.json(logs);
      });

      // Subscriptions (Task 59)
      app.get("/api/subscriptions/plans", async (req, res) => {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
      });

      app.get("/api/subscriptions/me", authenticateToken, async (req: any, res) => {
      const sub = await storage.getUserSubscription(req.user.id);
      res.json(sub);
      });

      app.post("/api/subscriptions/initialize", authenticateToken, async (req: any, res) => {
      const { planId } = req.body;
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      const amountKobo = Math.round(Number(plan.price) * 100);
      const result = await initializeTransaction({
      email: req.user.email,
      amount: amountKobo,
      metadata: { planId, userId: req.user.id, type: 'subscription' }
      });
      res.json(result);
      });

      // API Keys (Task 71)
      app.get("/api/api-keys", authenticateToken, async (req: any, res) => {
      const keys = await storage.getApiKeys(req.user.id);
      res.json(keys.map(k => ({ id: k.id, name: k.name, lastUsedAt: k.lastUsedAt, createdAt: k.createdAt })));
      });

      app.post("/api/api-keys", authenticateToken, async (req: any, res) => {
      const { name } = req.body;
      const rawKey = `nc_${crypto.randomBytes(24).toString('hex')}`;
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

      const apiKey = await storage.createApiKey({
      userId: req.user.id,
      name,
      keyHash,
      });

      await logAction(req, { action: 'CREATE', entityType: 'api_keys', entityId: apiKey.id });
      res.json({ ...apiKey, key: rawKey }); // Only return raw key once
      });

      app.delete("/api/api-keys/:id", authenticateToken, async (req: any, res) => {
      const key = await storage.getApiKey(req.params.id);
      if (!key || key.userId !== req.user.id) {
      return res.status(404).json({ error: "API key not found" });
      }
      await storage.deleteApiKey(req.params.id);
      await logAction(req, { action: 'DELETE', entityType: 'api_keys', entityId: req.params.id });
      res.json({ success: true });
      });

      // Escrow (Task 56)
      app.post("/api/escrow/initialize", authenticateToken, async (req: any, res) => {
      const { jobId, recipientId, amount, projectId } = req.body;

      const amountKobo = Math.round(Number(amount) * 100);
      const serviceFee = calculateServiceFee(amountKobo);
      const totalAmount = amountKobo + serviceFee;

      const result = await initializeTransaction({
      email: req.user.email,
      amount: totalAmount,
      metadata: { jobId, recipientId, senderId: req.user.id, projectId, type: 'escrow' }
      });

      res.json(result);
      });

      app.get("/api/escrow/transactions", authenticateToken, async (req: any, res) => {
      const transactions = await storage.getEscrowTransactions({ 
      senderId: req.user.id,
      recipientId: req.user.id,
      ...req.query
      });
      res.json(transactions);
      });

      // KYC (Task 58)
      app.get("/api/kyc/status", authenticateToken, async (req: any, res) => {
      const verifications = await storage.getKycVerifications(req.user.id);
      res.json(verifications[0] || { status: 'not_started' });
      });

      app.post("/api/kyc/verify", authenticateToken, async (req: any, res) => {
      const { type, idNumber } = req.body;

      // Placeholder for actual SmileIdentity/Dojah integration
      const verification = await storage.createKycVerification({
      userId: req.user.id,
      type,
      status: 'pending',
      provider: 'SmileIdentity',
      idNumberMasked: idNumber.substring(0, 2) + '*'.repeat(idNumber.length - 4) + idNumber.substring(idNumber.length - 2),
      });

      await logAction(req, { action: 'CREATE', entityType: 'kyc_verifications', entityId: verification.id });
      res.json(verification);
      });

      // Paystack Webhook (Task 56, 59)
      app.post("/api/webhooks/paystack", async (req, res) => {
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(JSON.stringify(req.body)).digest('hex');
      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).send('Invalid signature');
      }

      const event = req.body;
      logger.info('Paystack Webhook received:', event.event);

      if (event.event === 'charge.success') {
        const { metadata, reference, amount } = event.data;

        if (metadata.type === 'subscription') {
          const { planId, userId } = metadata;
          const plan = await storage.getSubscriptionPlan(planId);
          if (plan) {
            const endDate = new Date();
            if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
            else endDate.setFullYear(endDate.getFullYear() + 1);

            await storage.createSubscription({
              userId,
              planId,
              status: 'active',
              startDate: new Date(),
              endDate,
              paystackSubscriptionCode: event.data.subscription_code || null,
            });
            logger.info(`Subscription activated for user ${userId}`);
          }
        } else if (metadata.type === 'escrow') {
          const { jobId, recipientId, senderId, projectId } = metadata;
          await storage.createEscrowTransaction({
            projectId,
            jobId,
            senderId,
            recipientId,
            amount: (amount / 100).toString(),
            status: 'escrow',
            paystackReference: reference,
          });
          logger.info(`Escrow transaction created for job ${jobId}`);
        }
      }

      res.sendStatus(200);
  });

  // Data Export (Task 62)
  app.get("/api/projects/:projectId/export", authenticateToken, async (req: any, res) => {
    const { projectId } = req.params;
    const project = await storage.getProject(projectId);
    if (!project || project.createdById !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const members = await storage.getProjectMembers(projectId);
    const transactions = await storage.getEscrowTransactions({ projectId });

    const data = members.map(m => ({
      ...m,
      projectName: project.title,
      totalPaid: transactions.filter(t => t.recipientId === m.userId && t.status === 'released')
                   .reduce((sum, t) => sum + Number(t.amount), 0)
    }));

    const csv = exportToCSV(data, ['id', 'userId', 'role', 'department', 'totalPaid', 'joinedAt']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=project_${projectId}_export.csv`);
    res.send(csv);
  });

  app.get("/api/admin/export/audit-logs", authenticateToken, async (req: any, res) => {
    const roles = await storage.getUserRoles(req.user.id);
    if (!roles.some(r => r.role === 'admin')) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const logs = await storage.getAuditLogs({ limit: 10000 });
    const csv = exportToCSV(logs, ['id', 'userId', 'action', 'entityType', 'entityId', 'createdAt']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs_export.csv');
    res.send(csv);
    });

    // Daily Progress Reports (Task 90)
    app.get("/api/projects/:projectId/dprs", authenticateToken, async (req: any, res) => {
    const { projectId } = req.params;
    // Check membership
    const members = await storage.getProjectMembers(projectId);
    if (!members.some(m => m.userId === req.user.id)) {
      return res.status(403).json({ error: "Not a member of this project" });
    }
    const dprs = await storage.getDPRs(projectId);
    res.json(dprs);
    });

    app.post("/api/projects/:projectId/dprs", authenticateToken, async (req: any, res) => {
    const { projectId } = req.params;
    // Require 'producer', 'director', or 'edit_schedule' permission (reuse for simplicity)
    const members = await storage.getProjectMembers(projectId);
    const member = members.find(m => m.userId === req.user.id);
    if (!member || !(['producer', 'director'].includes(member.role) || (member.permissions as string[])?.includes('edit_schedule'))) {
      return res.status(403).json({ error: "Insufficient permissions to create DPR" });
    }

    const dpr = await storage.createDPR({
      ...req.body,
      projectId,
      reportDate: new Date(req.body.reportDate),
    });

    await logAction(req, { action: 'CREATE', entityType: 'daily_progress_reports', entityId: dpr.id });
    res.status(201).json(dpr);
    });

    // Support Tickets / Dispute Resolution (Task 66, 77)
    app.get("/api/support/tickets", authenticateToken, async (req: any, res) => {
    const roles = await storage.getUserRoles(req.user.id);
    const isAdmin = roles.some(r => r.role === 'admin');

    const filters = isAdmin ? req.query : { ...req.query, userId: req.user.id };
    const tickets = await storage.getSupportTickets(filters as any);
    res.json(tickets);
    });

    app.post("/api/support/tickets", authenticateToken, async (req: any, res) => {
    const ticket = await storage.createSupportTicket({
      ...req.body,
      userId: req.user.id,
    });

    await logAction(req, { action: 'CREATE', entityType: 'support_tickets', entityId: ticket.id });
    res.status(201).json(ticket);
    });

    app.patch("/api/support/tickets/:id", authenticateToken, async (req: any, res) => {
    const roles = await storage.getUserRoles(req.user.id);
    const isAdmin = roles.some(r => r.role === 'admin');

    const existingTicket = await storage.getSupportTicket(req.params.id);
    if (!existingTicket) return res.status(404).json({ error: "Ticket not found" });

    if (!isAdmin && existingTicket.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to modify this ticket" });
    }

    let updates;
    if (isAdmin) {
      // Admin users still need input validation to prevent mass assignment/injection
      updates = insertSupportTicketSchema.partial().parse(req.body);
    } else {
      // Prevent non-admins from changing the ticket owner or escalating priority
      updates = insertSupportTicketSchema.partial().omit({ userId: true, priority: true } as any).parse(req.body);
    }

    const ticket = await storage.updateSupportTicket(req.params.id, updates);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    await logAction(req, { action: 'UPDATE', entityType: 'support_tickets', entityId: ticket.id, newData: updates });
    res.json(ticket);
    });

    // Referrals (Task 70)
    app.get("/api/referrals", authenticateToken, async (req: any, res) => {
    const referrals = await storage.getReferrals(req.user.id);
    res.json(referrals);
    });

    app.post("/api/referrals", authenticateToken, async (req: any, res) => {
    const referral = await storage.createReferral({
      referrerId: req.user.id,
      referredEmail: req.body.referredEmail,
      status: 'pending',
      rewardStatus: 'none'
    });

    await logAction(req, { action: 'CREATE', entityType: 'referrals', entityId: referral.id });
    res.status(201).json(referral);
    });

    return createServer(app);
    }