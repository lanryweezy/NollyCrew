import * as dotenv from "dotenv";
dotenv.config();

import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertUserRoleSchema, insertJobSchema, insertProjectSchema, insertJobApplicationSchema, insertWaitlistSchema, insertMessageSchema, insertReviewSchema } from "../shared/schema";
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
import * as ai from './ai';
import pdf from 'pdf-parse';
import multer from 'multer';
import { 
  scriptAnalysisQueue, 
  scheduleOptimizationQueue, 
  castingRecommendationQueue, 
  marketingContentQueue,
  getJobStatus 
} from './queue';
import { 
  getCallSheetTemplates, 
  getCallSheetTemplate, 
  generateCallSheetHTML,
  CallSheetData 
} from './callSheetTemplates';
import { rateLimiter, authRateLimiter, apiRateLimiter } from './middleware/rateLimiter';
import { validateRequest, isValidEmail, isValidPassword } from './middleware/validation';
import { logger } from './utils/logger';
import { HealthChecker } from './utils/monitoring';

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

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { error: (error as Error).message });
    return res.status(403).json({ error: 'Invalid token' });
  }
};

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
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET, 
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
      const token = jwt.sign({ userId: req.user.id }, EMAIL_TOKEN_SECRET, { expiresIn: '1d' });
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
      const payload = jwt.verify(token, EMAIL_TOKEN_SECRET) as any;
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
        const token = jwt.sign({ userId: user.id }, RESET_TOKEN_SECRET, { expiresIn: '1h' });
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
      
      const payload = jwt.verify(token, RESET_TOKEN_SECRET) as any;
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
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET, 
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
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '30d' });
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
      const payload = jwt.verify(token, REFRESH_SECRET) as any;
      const user = await storage.getUser(payload.userId);
      if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
      const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
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
      const updates = req.body;
      const updatedUser = await storage.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
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
      const { status, limit } = req.query;
      const projects = await storage.getProjects({
        status: status as string,
        createdById: req.user.id,
        limit: limit ? parseInt(limit as string) : undefined
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
      const updates = req.body;
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
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob({
        ...jobData,
        postedById: req.user.id
      });
      res.status(201).json(job);
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
      const { status, roleType, limit } = req.query;
      const jobs = await storage.getJobs({
        status: status as string,
        roleType: roleType as string,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(jobs);
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
      
      const applicationData = insertJobApplicationSchema.parse(req.body);
      const application = await storage.createJobApplication({
        ...applicationData,
        jobId,
        applicantId: req.user.id
      });
      res.status(201).json(application);
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
          const data = await pdf(req.file.buffer);
          finalScriptText = data.text;
        } catch (error) {
          console.error('PDF extraction error:', error);
          return res.status(400).json({ error: 'Failed to extract text from PDF' });
        }
      } else if (req.body.scriptUrl) {
        scriptUrl = req.body.scriptUrl;
        // Fetch script from URL
        try {
          const response = await fetch(scriptUrl);
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/pdf')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = await pdf(buffer);
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
          const response = await fetch(project.script);
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/pdf')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = await pdf(buffer);
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
        const job = await scriptAnalysisQueue.add('analyze-script', {
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
  app.post('/api/ai/casting', async (req, res) => {
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
        const job = await castingRecommendationQueue.add('generate-recommendations', {
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
        const job = await scheduleOptimizationQueue.add('optimize-schedule', {
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
        const job = await marketingContentQueue.add('generate-content', {
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
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...reviewData,
        reviewerId: req.user.id
      });
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      console.error('Create review error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/users/:userId/reviews', async (req: any, res) => {
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

  return createServer(app);
}