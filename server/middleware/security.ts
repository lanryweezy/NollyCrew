import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Security middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
  
  next();
};

// XSS protection middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    }
  }
  
  // Sanitize body parameters
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  
  next();
};

// Simple string sanitization
const sanitizeString = (str: string): string => {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// NoSQL injection prevention
export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const checkObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes('$')) {
        logger.warn('Potential NoSQL injection attempt detected', {
          key,
          value: obj[key],
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return res.status(400).json({ error: 'Invalid input data' });
      }
      
      if (typeof obj[key] === 'object') {
        checkObject(obj[key]);
      }
    }
  };
  
  checkObject(req.query);
  checkObject(req.body);
  
  next();
};

// Helmet-like security middleware
export const securityMiddleware = [
  securityHeaders,
  sanitizeInput,
  preventNoSQLInjection
];