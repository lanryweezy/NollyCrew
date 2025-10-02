import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import './worker'; // no-op import when running web, worker will early-exit if env flag not set
import * as dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { securityMiddleware } from './middleware/security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

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

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Serve static files and client app
  app.use(express.static(path.join(__dirname, '../public')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`Server started on port ${port}`);
  });
})();