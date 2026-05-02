import * as dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";
// import './worker'; // no-op import when running web, worker will early-exit if env flag not set
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityMiddleware } from './middleware/security.js';
import { initializeWebSocketServer } from './websocket.js';
import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthing/router.js";
import { storage } from './storage.js';
import fs from 'fs/promises';
import { setupVite, log } from "./vite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PAYSTACK_SECRET_KEY',
    'PAYSTACK_PUBLIC_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    logger.error('FATAL: Missing required environment variables in production', { missingEnvVars });
    process.exit(1);
  }
}

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply security middleware
app.use(securityMiddleware);

// Configurable CORS for separated API deployments
if (process.env.CORS_ORIGIN) {
  const allowedOrigin = process.env.CORS_ORIGIN;
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers') || 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
}

// Add request ID and logging middleware
app.use((req, res, next) => {
  // Simple request id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).rid = Math.random().toString(36).slice(2, 10);
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      logger.info(`[${(req as any).rid}] ${logLine}`);
    }
  });

  next();
});

(async () => {
  // Enforce JWT secret in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      logger.error('FATAL: JWT_SECRET must be set in production');
      process.exit(1);
    }
  }

  const server = await registerRoutes(app);

  app.use(
    "/api/uploadthing",
    createRouteHandler({
      router: ourFileRouter,
      config: {
        // Log information about the upload
        callbackUrl: process.env.UPLOADTHING_CALLBACK_URL,
      },
    })
  );

  // Initialize WebSocket server
  const wsServer = initializeWebSocketServer(server);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Serve static files and client app
    const distPath = path.join(__dirname, '../dist/public');
    const publicPath = path.join(__dirname, '../public');

    // Try serving from dist/public (production build) first, then fallback to public (static assets)
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    
    app.get('*', async (req, res) => {
      // API requests should already be handled by registerRoutes
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }

      const indexPath = path.join(distPath, 'index.html');
      const fallbackPath = path.join(publicPath, 'index.html');
      
      let activePath = indexPath;
      // Note: In a real environment, we'd use fs.access or similar properly
      // For now, staying consistent with previous logic but wrapped in a try/catch
      try {
        await fs.access(indexPath);
      } catch {
        activePath = fallbackPath;
      }

      try {
        let html = await fs.readFile(activePath, 'utf-8');
        
        // Default metadata
        let title = 'NollyCrew - All-in-One Nollywood Platform';
        let description = 'Connect actors, crew, and producers in the Nollywood industry. AI-powered script breakdown, casting calls, and project management.';
        let ogImage = 'https://nollycrew.com/og-image.png';

        // Dynamic metadata for Talent Profiles
        if (req.path.startsWith('/talent/')) {
          const userId = req.path.split('/')[2];
          if (userId) {
            const user = await storage.getUser(userId);
            const roles = await storage.getUserRoles(userId);
            if (user) {
              const roleNames = roles.map(r => r.role).join(', ');
              title = `${user.firstName} ${user.lastName} - ${roleNames} | NollyCrew`;
              description = user.bio || `${user.firstName} is a ${roleNames} on NollyCrew. Check out their portfolio and credits.`;
              if (user.avatar) ogImage = user.avatar;
            }
          }
        } 
        // Dynamic metadata for Jobs
        else if (req.path.startsWith('/jobs/')) {
          const jobId = req.path.split('/')[2];
          if (jobId) {
            const job = await storage.getJob(jobId);
            if (job) {
              title = `${job.title} - Job Opportunity | NollyCrew`;
              description = `New ${job.type} job in ${job.location}: ${job.description.substring(0, 150)}...`;
            }
          }
        }

        // Inject into HTML with more precise regexes
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
        html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
        html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
        
        // If og:image doesn't exist, add it after og:description
        if (html.includes('property="og:image"')) {
          html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${ogImage}">`);
        } else {
          html = html.replace(/(<meta property="og:description" content="[^"]*">)/, `$1\n    <meta property="og:image" content="${ogImage}">`);
        }

        res.send(html);
      } catch (error) {
        logger.error('Error serving index.html:', error);
        res.sendFile(activePath);
      }
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Check if we're running on Windows (reusePort is not supported)
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    server.listen(port, "0.0.0.0", () => {
      logger.info(`Server started on port ${port}`);
    });
  } else {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      logger.info(`Server started on port ${port}`);
    });
  }
})();