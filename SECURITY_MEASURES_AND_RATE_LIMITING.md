# Security Measures and Rate Limiting for NollyCrewHub

This document outlines comprehensive security measures and rate limiting strategies for NollyCrewHub to protect the platform and its users in the Nollywood industry.

## 1. Authentication and Authorization Security

### JWT Token Security

#### Token Configuration
```javascript
// In utils/jwt.ts
import { sign, verify } from 'jsonwebtoken';

// Secure JWT signing options
const JWT_OPTIONS = {
  expiresIn: '7d',
  issuer: 'nollycrewhub',
  audience: 'nollycrewhub-users',
  algorithm: 'HS256' // Use HS256 or RS256 for production
};

// Refresh token options
const REFRESH_OPTIONS = {
  expiresIn: '30d',
  issuer: 'nollycrewhub',
  audience: 'nollycrewhub-users',
  algorithm: 'HS256'
};

export function signToken(payload: any, secret: string, options = {}) {
  return sign(payload, secret, { ...JWT_OPTIONS, ...options });
}

export function verifyToken(token: string, secret: string) {
  return verify(token, secret, { 
    issuer: 'nollycrewhub',
    audience: 'nollycrewhub-users'
  });
}
```

#### Token Storage Security
```javascript
// Secure cookie configuration
app.post('/api/auth/login', async (req, res) => {
  // ... authentication logic ...
  
  // Secure refresh token cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth', // Limit cookie scope
    domain: process.env.COOKIE_DOMAIN || undefined // Explicit domain if needed
  });
});
```

### Password Security

#### Strong Password Requirements
```javascript
// In middleware/validation.ts
export function isValidPassword(password: string): boolean {
  // Password must be at least 8 characters long
  if (password.length < 8) return false;
  
  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Must contain at least one number
  if (!/[0-9]/.test(password)) return false;
  
  // Must contain at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
}
```

#### Password Hashing
```javascript
// Using bcrypt with appropriate cost factor
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Balance between security and performance

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### Session Management

#### Session Security Configuration
```javascript
// Using express-session with secure settings
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pgPromise: pool, // Use existing database pool
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  },
  name: 'nollycrewhub.sid', // Custom session cookie name
  proxy: true // Trust proxy for secure cookies
}));
```

## 2. Input Validation and Sanitization

### Zod Schema Validation
The application already uses Zod for validation, which is excellent. Let's enhance it:

```javascript
// Enhanced user schema validation
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
  location: z.string().max(255).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(50).optional(),
  experience: z.string().max(5000).optional()
});

// Job schema validation
export const jobSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(10).max(10000),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  location: z.string().min(1).max(255),
  salary: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string().length(3)
  }).optional(),
  deadline: z.date().optional(),
  isActive: z.boolean().default(true)
});
```

### Sanitization Middleware
```javascript
// Input sanitization middleware
import sanitizeHtml from 'sanitize-html';

function sanitizeInput(req, res, next) {
  // Sanitize query parameters
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = sanitizeHtml(req.query[key], {
        allowedTags: [], // Remove all HTML tags
        allowedAttributes: {}
      });
    }
  }
  
  // Sanitize body parameters
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeHtml(req.body[key], {
        allowedTags: [], // Remove all HTML tags
        allowedAttributes: {}
      });
    }
  }
  
  next();
}

app.use(sanitizeInput);
```

## 3. Rate Limiting Implementation

### Multi-Tier Rate Limiting

#### Authentication Rate Limiting
```javascript
// In middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true // Don't count successful logins
});

// For login endpoint
app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  // ... login logic ...
});
```

#### API Rate Limiting
```javascript
// General API rate limiting
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to all API routes
app.use('/api/', apiRateLimiter);
```

#### Specific Endpoint Rate Limiting
```javascript
// For high-value endpoints like job applications
export const jobApplicationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 applications per hour
  message: {
    error: 'Too many job applications, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to job application endpoint
app.post('/api/jobs/:jobId/apply', 
  authenticateToken, 
  jobApplicationRateLimiter, 
  async (req, res) => {
    // ... application logic ...
  }
);
```

#### Waitlist Rate Limiting
```javascript
// Very strict rate limiting for waitlist signup
export const waitlistRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 signup per IP per hour
  message: {
    error: 'You have already signed up for the waitlist. Please check your email.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to waitlist endpoint
app.post('/api/waitlist', waitlistRateLimiter, async (req, res) => {
  // ... waitlist logic ...
});
```

### Redis-Based Rate Limiting (For Scaling)
```javascript
// Enhanced rate limiting with Redis for distributed systems
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limiter',
  points: 100, // Number of points
  duration: 15 * 60, // Per 15 minutes
  blockDuration: 60 * 60 // Block for 1 hour if consumed more than points
});

export async function rateLimitMiddleware(req, res, next) {
  try {
    const rateLimiterRes = await rateLimiter.consume(req.ip);
    res.set({
      'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext)
    });
    next();
  } catch (rateLimiterRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      remainingPoints: rateLimiterRes.remainingPoints,
      resetTime: new Date(Date.now() + rateLimiterRes.msBeforeNext)
    });
  }
}
```

## 4. Security Headers and CORS

### Security Headers Middleware
```javascript
// In middleware/security.ts
import helmet from 'helmet';

export function securityMiddleware(req, res, next) {
  // Apply Helmet security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  })(req, res, next);
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

// Apply globally
app.use(securityMiddleware);
```

### CORS Configuration
```javascript
// Configurable CORS for separated API deployments
if (process.env.CORS_ORIGIN) {
  const allowedOrigin = process.env.CORS_ORIGIN;
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 
      req.header('Access-Control-Request-Headers') || 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
}
```

## 5. Data Protection and Privacy

### Sensitive Data Handling
```javascript
// Mask sensitive data in logs
function maskSensitiveData(obj) {
  const masked = { ...obj };
  
  // Mask email addresses
  if (masked.email) {
    masked.email = masked.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }
  
  // Remove password fields
  delete masked.password;
  delete masked.passwordHash;
  delete masked.refreshToken;
  
  // Mask phone numbers
  if (masked.phone) {
    masked.phone = masked.phone.replace(/(\d{3})\d+(\d{2})/, '$1***$2');
  }
  
  return masked;
}

// Use in logging
logger.info('User registered', { 
  user: maskSensitiveData(userWithoutPassword) 
});
```

### Data Encryption at Rest
```javascript
// For sensitive fields that need encryption
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}
```

## 6. Nollywood-Specific Security Considerations

### Industry-Specific Threats
1. **Talent Scams**: Implement verification processes for high-profile users
2. **Intellectual Property Theft**: Protect script uploads and project details
3. **Payment Fraud**: Enhanced validation for financial transactions
4. **Social Engineering**: Educate users about phishing attempts

### Geographic Security Considerations
1. **Nigeria**: Comply with Nigeria Data Protection Regulation (NDPR)
2. **International**: Consider GDPR for European users
3. **Cross-Border Data Transfer**: Implement appropriate safeguards

### User Verification
```javascript
// Multi-level user verification
enum VerificationLevel {
  UNVERIFIED = 0,
  EMAIL_VERIFIED = 1,
  PHONE_VERIFIED = 2,
  IDENTITY_VERIFIED = 3,
  PROFESSIONAL_VERIFIED = 4
}

// Enhanced user model
interface User {
  id: string;
  email: string;
  phone?: string;
  verificationLevel: VerificationLevel;
  verifiedAt?: Date;
  verificationDocuments?: string[]; // Paths to verification documents
}
```

## 7. Security Monitoring and Auditing

### Security Event Logging
```javascript
// Log security-relevant events
function logSecurityEvent(eventType, details) {
  logger.warn(`SECURITY EVENT: ${eventType}`, {
    ...details,
    timestamp: new Date().toISOString(),
    severity: 'warning'
  });
}

// Examples of security events to log
app.post('/api/auth/login', async (req, res) => {
  // ... login logic ...
  
  if (loginFailed) {
    logSecurityEvent('FAILED_LOGIN', {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  if (tooManyAttempts) {
    logSecurityEvent('BRUTE_FORCE_ATTEMPT', {
      email: req.body.email,
      ip: req.ip,
      attempts: attemptCount
    });
  }
});
```

### Regular Security Audits
1. **Dependency Scanning**
   ```bash
   npm audit
   ```
   
2. **Static Analysis**
   ```bash
   # Use tools like SonarQube or CodeQL
   ```

3. **Penetration Testing**
   - Quarterly internal testing
   - Annual external penetration testing

## 8. Incident Response Plan

### Security Incident Response Steps
1. **Detection**: Monitor logs and alerts
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat and vulnerabilities
4. **Recovery**: Restore systems from clean backups
5. **Lessons Learned**: Document and improve processes

### Communication Plan
1. **Internal**: Notify security team immediately
2. **External**: Notify users if their data was compromised
3. **Regulatory**: Report to relevant authorities if required

## 9. Compliance Considerations

### Data Protection Regulations
1. **NDPR** (Nigeria Data Protection Regulation)
2. **GDPR** (General Data Protection Regulation) for EU users
3. **CCPA** (California Consumer Privacy Act) for California users

### Required Documentation
1. **Privacy Policy**: Clear data handling practices
2. **Terms of Service**: User responsibilities and platform rules
3. **Data Processing Agreement**: For business users
4. **Security Policy**: Technical and organizational measures

## Conclusion

Implementing comprehensive security measures and rate limiting is essential for protecting NollyCrewHub and its users in the Nollywood industry. The multi-layered approach including authentication security, input validation, rate limiting, security headers, and monitoring provides robust protection against common threats. Regular security audits and incident response planning ensure ongoing protection as the platform grows and evolves.