import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
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

  // Reset password
  app.post('/api/auth/reset-password', authRateLimiter, async (req, res) => {
    try {
      const { token, newPassword } = req.body as any;
      if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword required' });
      
      // Validate password strength
      if (!isValidPassword(newPassword)) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
        });
      }
      
      const payload = jwt.verify(token, RESET_TOKEN_SECRET) as any;
      const user = await storage.getUser(payload.userId);
      if (!user) return res.status(400).json({ error: 'Invalid token' });
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const updated = await storage.updateUser(user.id, { passwordHash } as any);
      const { passwordHash: _ph, ...userWithoutPassword } = updated as any;
      logger.info('Password reset successfully', { userId: user.id });
      res.json({ user: userWithoutPassword });
    } catch (error) {
      logger.warn('Password reset failed', { error: (error as Error).message });
      return res.status(400).json({ error: 'Invalid token' });
    }
  });

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

      if (!amount || !email) {
        return res.status(400).json({ error: 'Amount and email are required' });
      }

      const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const response = await paystack.transaction.initialize({
        amount: amount * 100, // amount in kobo
        email,
        callback_url: `${baseUrl}/api/payment/paystack/callback`,
      });

      res.json({ authorization_url: response.data.authorization_url });
    } catch (error) {
      logger.error('Paystack initialization error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/payment/paystack/callback', async (req, res) => {
    try {
      if (!paystack) {
        return res.status(500).json({ error: 'Payment system not configured' });
      }
      
      const { reference } = req.query;
      if (!reference || typeof reference !== 'string') {
        return res.status(400).json({ error: 'Reference is required' });
      }
      
      const response = await paystack.transaction.verify({ reference });

      if (response.data.status === 'success') {
        // Payment was successful, you can update your database here
        logger.info('Payment successful', { reference });
        res.redirect('/payment/success');
      } else {
        logger.warn('Payment failed', { reference, status: response.data.status });
        res.redirect('/payment/error');
      }
    } catch (error) {
      logger.error('Paystack callback error', { error: (error as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User roles routes
  app.get('/api/users/:userId/roles', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Users can only view their own roles unless admin (future feature)
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const roles = await storage.getUserRoles(userId);
      res.json({ roles });
    } catch (error) {
      console.error('Get user roles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users/:userId/roles', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Users can only add roles to their own profile
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const roleData = insertUserRoleSchema.parse({
        ...req.body,
        userId
      }) as any;

      // Check if user already has this role
      const existingRoles = await storage.getUserRoles(userId);
      const hasRole = existingRoles.some(r => r.role === roleData.role);
      if (hasRole) {
        return res.status(400).json({ error: 'User already has this role' });
      }

      const role = await storage.createUserRole(roleData);
      res.status(201).json({ role });
    } catch (error) {
      console.error('Create user role error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/users/:userId/roles/:roleId', authenticateToken, async (req: any, res) => {
    try {
      const { userId, roleId } = req.params;
      
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updates = req.body;
      const updatedRole = await storage.updateUserRole(roleId, updates);
      
      if (!updatedRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json({ role: updatedRole });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Jobs routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const { type, location, isActive, limit } = req.query;
      const filters: any = {};
      
      if (type) filters.type = type as string;
      if (location) filters.location = location as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (limit) filters.limit = parseInt(limit as string);

      const jobs = await storage.getJobs(filters);
      res.json({ jobs });
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/jobs', authenticateToken, async (req: any, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        postedById: req.user.id
      });

      const job = await storage.createJob(jobData);
      res.status(201).json({ job });
    } catch (error) {
      console.error('Create job error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/jobs/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({ job });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Job applications routes
  app.post('/api/jobs/:jobId/apply', authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      
      // Check if job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check if user already applied
      const existingApplications = await storage.getJobApplications({ 
        jobId, 
        applicantId: req.user.id 
      });
      if (existingApplications.length > 0) {
        return res.status(400).json({ error: 'You have already applied to this job' });
      }

      const applicationData = insertJobApplicationSchema.parse({
        ...req.body,
        jobId,
        applicantId: req.user.id
      });

      const application = await storage.createJobApplication(applicationData);
      res.status(201).json({ application });
    } catch (error) {
      console.error('Apply to job error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/users/:userId/applications', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const applications = await storage.getJobApplications({ applicantId: userId });
      res.json({ applications });
    } catch (error) {
      console.error('Get user applications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Projects routes
  app.get('/api/projects', async (req, res) => {
    try {
      const { status, createdById, limit } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (createdById) filters.createdById = createdById as string;
      if (limit) filters.limit = parseInt(limit as string);

      const projects = await storage.getProjects(filters);
      res.json({ projects });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects', authenticateToken, async (req: any, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        createdById: req.user.id
      });

      const project = await storage.createProject(projectData);
      res.status(201).json({ project });
    } catch (error) {
      console.error('Create project error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Project script upload + fake AI breakdown
  app.post('/api/projects/:projectId/script', authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const { scriptUrl } = req.body as { scriptUrl?: string };
      if (!scriptUrl) {
        return res.status(400).json({ error: 'scriptUrl is required' });
      }
      // Very basic fake breakdown for now
      const fakeBreakdown = {
        scenes: 24,
        characters: ['Lead', 'Support', 'Extra'],
        locations: ['Market', 'Apartment Interior'],
        estimatedCrew: { gaffer: 1, sound_engineer: 1, makeup_artist: 1, editor: 1, camera_operator: 2 },
        analyzedAt: new Date().toISOString(),
      };
      const updated = await storage.updateProject(projectId, {
        // @ts-ignore
        script: scriptUrl,
        // @ts-ignore
        scriptBreakdown: fakeBreakdown,
      } as any);
      if (!updated) return res.status(404).json({ error: 'Project not found' });
      res.json({ project: updated });
    } catch (error) {
      console.error('Project script error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analyze script to produce breakdown and maintain versions
  app.post('/api/projects/:projectId/script/analyze', authenticateToken, upload.single('scriptFile'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const { scriptUrl, scriptText } = req.body as { scriptUrl?: string; scriptText?: string };

      const project = await storage.getProject(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      let finalScriptText = scriptText || '';

      // If a PDF file was uploaded, extract text from it
      if (req.file) {
        try {
          const extractedText = await ai.extractTextFromPDF(req.file.buffer);
          finalScriptText = extractedText;
        } catch (error) {
          console.error('PDF extraction error:', error);
          return res.status(400).json({ error: 'Failed to extract text from PDF' });
        }
      }

      // Add job to queue for async processing
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
      
      // Add job to queue for async processing
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
      
      // Add job to queue for async processing
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
      
      // Add job to queue for async processing
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
  app.get('/api/users/:userId/profile', async (req, res) => {
    try {
      const { userId } = req.params as any;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const roles = await storage.getUserRoles(userId);
      res.json({ user: { ...user, passwordHash: undefined }, roles });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Audition request (message)
  app.post('/api/auditions/request', authenticateToken, async (req: any, res) => {
    try {
      const { recipientId, projectId, roleDescription } = req.body as any;
      if (!recipientId) return res.status(400).json({ error: 'recipientId required' });
      const message = await storage.createMessage({
        senderId: req.user.id,
        recipientId,
        subject: 'Audition Request',
        content: `You are invited to audition${projectId ? ' for project ' + projectId : ''}${roleDescription ? ' - ' + roleDescription : ''}.`,
      } as any);
      res.status(201).json({ message });
    } catch (error) {
      console.error('Audition request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Signed uploads (S3) with runtime dependency check
  app.post('/api/uploads/sign', authenticateToken, async (req: any, res) => {
    try {
      const { filename, contentType } = req.body as any;
      if (!filename || !contentType) {
        return res.status(400).json({ error: 'filename and contentType are required' });
      }

      const bucket = process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
      if (!bucket || !region || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        return res.status(501).json({ error: 'S3 not configured' });
      }

      // Lazy import AWS SDK v3 to avoid hard dependency when not configured
      let S3Client: any, PutObjectCommand: any, getSignedUrl: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        ({ getSignedUrl } = require('@aws-sdk/s3-request-presigner'));
      } catch (e) {
        return res.status(501).json({ error: 'AWS SDK not installed' });
      }

      const key = `uploads/${req.user.id}/${Date.now()}-${filename}`;
      const s3 = new S3Client({ region });
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
      res.json({ url, key, bucket, region });
    } catch (error) {
      console.error('Sign upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Schedule persistence (stored under scriptBreakdown.schedule)
  app.get('/api/projects/:projectId/schedule', authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      // @ts-ignore
      const sb = (project.scriptBreakdown as any) || {};
      res.json({ schedule: sb.schedule || [] });
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects/:projectId/schedule', authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const { schedule } = req.body as any;
      const project = await storage.getProject(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      // @ts-ignore
      const prev = (project.scriptBreakdown as any) || {};
      const merged = { ...prev, schedule };
      const updated = await storage.updateProject(projectId, {
        // @ts-ignore
        scriptBreakdown: merged,
      } as any);
      res.json({ project: updated });
    } catch (error) {
      console.error('Save schedule error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Project members routes
  app.get('/api/projects/:projectId/members', authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const members = await storage.getProjectMembers(projectId);
      res.json({ members });
    } catch (error) {
      console.error('Get project members error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects/:projectId/members', authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      // Ensure only project creator can add members
      const project = await storage.getProject(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.createdById !== req.user.id) {
        return res.status(403).json({ error: 'Only project creator can add members' });
      }
      const memberData = {
        ...req.body,
        projectId,
        userId: req.body.userId,
        role: req.body.role,
      };
      // Basic validation
      if (!memberData.userId || !memberData.role) {
        return res.status(400).json({ error: 'userId and role are required' });
      }
      const member = await storage.createProjectMember(memberData as any);
      res.status(201).json({ member });
    } catch (error) {
      console.error('Create project member error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Messaging routes
  app.get('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const otherUserId = req.query.otherUserId as string | undefined;
      const msgs = await storage.getMessages(req.user.id, otherUserId);
      res.json({ messages: msgs });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const parsed = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });
      const message = await storage.createMessage(parsed);
      res.status(201).json({ message });
    } catch (error) {
      console.error('Create message error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reviews routes
  app.get('/api/users/:userId/reviews', async (req, res) => {
    try {
      const { userId } = req.params;
      const userReviews = await storage.getUserReviews(userId);
      res.json({ reviews: userReviews });
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users/:userId/reviews', authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const parsed = insertReviewSchema.parse({
        ...req.body,
        reviewerId: req.user.id,
        revieweeId: userId,
      });
      const review = await storage.createReview(parsed);
      res.status(201).json({ review });
    } catch (error) {
      console.error('Create review error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Talent search
  app.get('/api/talent/search', async (req, res) => {
    try {
      const { role, location, skills, limit } = req.query as any;
      const skillsArr = typeof skills === 'string' ? skills.split(',') : Array.isArray(skills) ? skills : undefined;
      // @ts-ignore
      const results = await storage.searchTalent({ role, location, skills: skillsArr, limit: limit ? parseInt(limit) : undefined });
      res.json({ results });
    } catch (error) {
      console.error('Talent search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
