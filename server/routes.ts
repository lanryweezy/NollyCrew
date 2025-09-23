import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertUserRoleSchema, insertJobSchema, insertProjectSchema, insertJobApplicationSchema } from "@shared/schema";
import { z } from "zod";
import paystackapi from 'paystack-api';

// JWT secret - in production this should be from environment
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

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
    return res.status(403).json({ error: 'Invalid token' });
  }
};

import * as openidClient from 'openid-client';
import { URL } from 'url';

// Google Auth client
let googleConfig: openidClient.Configuration | undefined;

async function getGoogleConfig() {
  if (googleConfig) {
    return googleConfig;
  }

  try {
    const clientMetadata = {
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uris: ['http://localhost:5000/api/auth/google/callback'],
        response_types: ['code'],
    };
    const config = await openidClient.discovery(new URL('https://accounts.google.com'), process.env.GOOGLE_CLIENT_ID!, clientMetadata);
    googleConfig = config;
    return config;
  } catch (error) {
    console.error('Failed to discover google openid configuration', error);
    throw new Error('Failed to configure Google authentication');
  }
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/api/auth/google', async (req, res, next) => {
    try {
      const config = await getGoogleConfig();
      const code_verifier = openidClient.randomPKCECodeVerifier();
      const code_challenge = await openidClient.calculatePKCECodeChallenge(code_verifier);
      const scope = 'openid email profile';

      const authUrl = openidClient.buildAuthorizationUrl(config, {
        scope,
        code_challenge,
        code_challenge_method: 'S256',
      });

      res.cookie('code_verifier', code_verifier, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.redirect(authUrl.href);
    } catch (error) {
        next(error);
    }
  });

  app.get('/api/auth/google/callback', async (req, res, next) => {
    try {
        const config = await getGoogleConfig();
        const code_verifier = req.cookies.code_verifier;
        const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const tokenSet = await openidClient.authorizationCodeGrant(config, new URL(currentUrl), { pkceCodeVerifier: code_verifier });
        const claims = tokenSet.claims();

        let user = await storage.getUserByEmail(claims.email!);

        if (!user) {
          const newUser = {
            email: claims.email!,
            firstName: claims.given_name || '',
            lastName: claims.family_name || '',
            avatar: claims.picture || null,
          };
          // Create a dummy password hash, as it's required by the schema
          const passwordHash = await bcrypt.hash(openidClient.randomNonce(), 10);
          user = await storage.createUser({ ...newUser, passwordHash });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.redirect(`/?token=${token}`);
    } catch (error) {
      next(error);
    }
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
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
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const userRoles = await storage.getUserRoles(req.user.id);
      const { passwordHash: _, ...userWithoutPassword } = req.user;
      res.json({ user: userWithoutPassword, roles: userRoles });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Paystack Payment Routes
  const paystack = paystackapi(process.env.PAYSTACK_SECRET_KEY);

  app.post('/api/payment/paystack/initialize', authenticateToken, async (req: any, res) => {
    try {
      const { amount, email } = req.body;

      if (!amount || !email) {
        return res.status(400).json({ error: 'Amount and email are required' });
      }

      const response = await paystack.transaction.initialize({
        amount: amount * 100, // amount in kobo
        email,
        callback_url: 'http://localhost:5000/api/payment/paystack/callback',
      });

      res.json({ authorization_url: response.data.authorization_url });
    } catch (error) {
      console.error('Paystack initialization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/payment/paystack/callback', async (req, res) => {
    try {
      const { reference } = req.query;
      const response = await paystack.transaction.verify({ reference });

      if (response.data.status === 'success') {
        // Payment was successful, you can update your database here
        res.redirect('/payment/success');
      } else {
        res.redirect('/payment/error');
      }
    } catch (error) {
      console.error('Paystack callback error:', error);
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
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
