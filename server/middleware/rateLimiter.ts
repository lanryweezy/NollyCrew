import { Request, Response, NextFunction } from 'express';

// Check if we're in a test or development environment
const isTestEnv = process.env.NODE_ENV === 'test';
const isDevEnv = process.env.NODE_ENV === 'development';

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

// Rate limiting middleware
export const rateLimiter = (windowMs: number = 900000, maxRequests: number = 100) => {
  // Skip rate limiting in test or development environment
  if (isTestEnv || isDevEnv) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    const keys = Array.from(rateLimitStore.keys());
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = rateLimitStore.get(key);
      if (value && value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    
    const clientData = rateLimitStore.get(clientId);
    
    if (!clientData) {
      // First request from this client
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }
    
    if (clientData.resetTime < now) {
      // Reset window has passed
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      });
    }
    
    // Increment request count
    clientData.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientData.count);
    next();
  };
};

// Specific rate limiters for different endpoints
export const authRateLimiter = rateLimiter(900000, 5); // 5 requests per 15 minutes for auth
export const apiRateLimiter = rateLimiter(900000, 100); // 100 requests per 15 minutes for API
export const uploadRateLimiter = rateLimiter(3600000, 10); // 10 uploads per hour