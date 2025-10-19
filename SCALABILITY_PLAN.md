# Scalability Plan for NollyCrewHub

This document outlines a comprehensive scalability plan to ensure NollyCrewHub can handle the traffic demands of the entire Nollywood industry, from individual actors to major production houses.

## 1. Current Architecture Analysis

### Application Structure
- **Monolithic Architecture**: Single application serving both frontend and backend
- **Render Deployment**: Web service with PostgreSQL database
- **Stateful Components**: User sessions, WebSocket connections
- **External Services**: Paystack, OpenAI, Google OAuth

### Traffic Patterns
Based on the Nollywood industry, we can expect:
1. **Baseline Traffic**: Steady flow of users managing profiles and browsing jobs
2. **Periodic Spikes**: Film festival seasons, award ceremonies, major film releases
3. **Event-Driven Bursts**: Audition announcements, job posting periods
4. **Geographic Distribution**: Nigeria (primary), UK/US (diaspora), South Africa (regional)

## 2. Scalability Goals

### Performance Targets
- **Response Time**: < 500ms for 95% of requests
- **Uptime**: 99.9% availability
- **Concurrent Users**: Support 10,000+ concurrent users
- **Throughput**: Handle 1,000+ requests per second during peak times

### Growth Projections
- **Year 1**: 10,000 registered users
- **Year 2**: 50,000 registered users
- **Year 3**: 100,000+ registered users
- **Peak Events**: 10x normal traffic during major industry events

## 3. Horizontal Scaling Strategy

### Web Service Scaling
Render automatically scales web services based on traffic. To optimize:

#### Load Balancing Configuration
```javascript
// In server/index.ts - ensure proper handling of multiple instances
const server = app.listen(port, "0.0.0.0", () => {
  logger.info(`Server started on port ${port}`, {
    pid: process.pid,
    instanceId: process.env.RENDER_INSTANCE_ID || 'local'
  });
});
```

#### State Management for Scaling
```javascript
// Use Redis for shared session storage
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "nollycrewhub:sess:"
});

app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

### Database Scaling

#### Read Replicas
For read-heavy operations like job listings and talent searches:
```javascript
// Separate read/write connections
const writePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
});

const readPool = new Pool({
  connectionString: process.env.READ_REPLICA_URL,
  max: 20 // More connections for reads
});

// Route queries appropriately
class StorageService {
  async getJobs(filters) {
    // Read operation - use read replica
    return readPool.query('SELECT ...', [filters]);
  }
  
  async createJob(jobData) {
    // Write operation - use primary database
    return writePool.query('INSERT ...', [jobData]);
  }
}
```

#### Connection Pooling Optimization
```javascript
// Optimized pool configuration for scaling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increase for higher concurrency
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Faster timeout
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});
```

## 4. Caching Strategy

### Multi-Level Caching

#### Application-Level Caching
```javascript
// Redis caching for frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class CacheService {
  async getCachedJobs(filters, ttl = 900) { // 15 minutes default
    const key = `jobs:${JSON.stringify(filters)}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const jobs = await storage.getJobs(filters);
    await redis.setex(key, ttl, JSON.stringify(jobs));
    return jobs;
  }
  
  async invalidateJobsCache() {
    // Invalidate all job-related cache keys
    const keys = await redis.keys('jobs:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

#### HTTP-Level Caching
```javascript
// Cache headers for static content
app.use('/static', express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Cache headers for API responses
app.get('/api/jobs', async (req, res) => {
  const jobs = await cacheService.getCachedJobs(req.query);
  
  // Set cache headers
  res.set({
    'Cache-Control': 'public, max-age=900', // 15 minutes
    'ETag': generateETag(jobs)
  });
  
  res.json({ jobs });
});
```

### CDN Integration
As documented in the CDN implementation guide, use Cloudflare or similar to:
- Cache static assets globally
- Reduce server load
- Improve global response times

## 5. Asynchronous Processing

### Background Job Queue
The application already uses Bull for background jobs. Enhance for scaling:

```javascript
// Enhanced queue configuration for scaling
import Queue from 'bull';

const scriptAnalysisQueue = new Queue('script-analysis', process.env.REDIS_URL, {
  limiter: {
    max: 100, // Max 100 jobs per second
    duration: 1000
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Worker scaling
// Run multiple worker processes
const worker = new Worker('script-analysis', async job => {
  // Process job
  return await processScriptAnalysis(job.data);
}, {
  connection: process.env.REDIS_URL,
  concurrency: 10 // Process 10 jobs concurrently
});

// Monitor queue health
setInterval(async () => {
  const waitingCount = await scriptAnalysisQueue.getWaitingCount();
  const activeCount = await scriptAnalysisQueue.getActiveCount();
  
  if (waitingCount > 1000) {
    logger.warn('High queue backlog detected', {
      waiting: waitingCount,
      active: activeCount
    });
    // Trigger scaling alert
  }
}, 60000); // Check every minute
```

### Event-Driven Architecture
```javascript
// Event system for decoupling components
import EventEmitter from 'events';

const eventEmitter = new EventEmitter();

// Emit events for important actions
app.post('/api/jobs', authenticateToken, async (req, res) => {
  // ... job creation logic ...
  
  // Emit event for notifications, analytics, etc.
  eventEmitter.emit('job.created', { job, userId: req.user.id });
  
  res.status(201).json({ job });
});

// Handle events asynchronously
eventEmitter.on('job.created', async (data) => {
  try {
    // Send notifications
    await notificationService.sendJobPostedNotification(data.job);
    
    // Update analytics
    await analyticsService.trackJobPosting(data.userId);
    
    // Index for search
    await searchService.indexJob(data.job);
  } catch (error) {
    logger.error('Failed to process job.created event', { error });
  }
});
```

## 6. Microservices Architecture (Future)

### Service Decomposition Plan
As the platform grows, consider decomposing into microservices:

1. **User Service**: Authentication, profiles, roles
2. **Job Service**: Job listings, applications
3. **Project Service**: Project management, script analysis
4. **Payment Service**: Payment processing, subscriptions
5. **Notification Service**: Email, SMS, push notifications
6. **Analytics Service**: Reporting, insights
7. **AI Service**: Script analysis, recommendations

### API Gateway Pattern
```javascript
// Simple API gateway implementation
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
```

## 7. Nollywood-Specific Scaling Considerations

### Traffic Pattern Management

#### Seasonal Scaling
```javascript
// Calendar-based scaling triggers
const NOLLYWOOD_EVENTS = [
  { name: 'AMVCA', start: '05-01', end: '05-31' },
  { name: 'AFRIFF', start: '10-01', end: '10-31' },
  { name: 'Award Season', start: '12-01', end: '12-31' }
];

function isHighTrafficPeriod() {
  const today = new Date();
  const monthDay = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
  return NOLLYWOOD_EVENTS.some(event => 
    monthDay >= event.start && monthDay <= event.end
  );
}

// Adjust scaling parameters based on traffic periods
if (isHighTrafficPeriod()) {
  // Increase resource allocation
  process.env.SCALING_FACTOR = '2';
}
```

#### Geographic Load Distribution
```javascript
// Geographic routing based on user location
function getNearestRegion(userLocation) {
  const regions = {
    'ng': 'africa', // Nigeria
    'gh': 'africa', // Ghana
    'za': 'africa', // South Africa
    'uk': 'europe', // United Kingdom
    'us': 'north-america', // United States
    'ca': 'north-america' // Canada
  };
  
  return regions[userLocation] || 'africa'; // Default to Africa
}

// Route users to nearest regional deployment
app.use((req, res, next) => {
  const userCountry = req.headers['cf-ipcountry'] || 'ng'; // From Cloudflare
  const region = getNearestRegion(userCountry.toLowerCase());
  
  // Set region in request for routing
  req.region = region;
  next();
});
```

### Device-Specific Optimization

#### Mobile-First Performance
```javascript
// Detect mobile devices and optimize responses
function isMobileUserAgent(userAgent) {
  return /mobile|android|iphone|ipad/i.test(userAgent);
}

app.use((req, res, next) => {
  const isMobile = isMobileUserAgent(req.get('User-Agent') || '');
  
  if (isMobile) {
    // Reduce data payload for mobile
    req.isMobile = true;
    // Apply mobile-specific optimizations
  }
  
  next();
});

// Mobile-optimized API responses
app.get('/api/jobs', async (req, res) => {
  const jobs = await storage.getJobs(req.query);
  
  if (req.isMobile) {
    // Return simplified data structure for mobile
    const mobileJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      posted: job.created_at
    }));
    
    res.json({ jobs: mobileJobs });
  } else {
    res.json({ jobs });
  }
});
```

## 8. Auto-Scaling Configuration

### Render Auto-Scaling
Render provides automatic scaling based on CPU and memory usage:

#### Configuration
```yaml
# render.yaml enhancement
services:
  - type: web
    name: nollycrewhub
    env: node
    plan: starter # Can upgrade to standard or professional
    # Auto-scaling parameters (available on higher plans)
    scaling:
      minInstances: 1
      maxInstances: 10
      targetCPU: 60 # Scale when CPU exceeds 60%
      targetMemory: 70 # Scale when memory exceeds 70%
```

### Custom Scaling Metrics
```javascript
// Custom metrics for scaling decisions
class ScalingMetrics {
  constructor() {
    this.metrics = {
      activeUsers: 0,
      pendingJobs: 0,
      responseTime: 0,
      errorRate: 0
    };
  }
  
  update(metric, value) {
    this.metrics[metric] = value;
    
    // Trigger scaling alerts
    if (metric === 'activeUsers' && value > 5000) {
      this.triggerScaleUp();
    }
    
    if (metric === 'responseTime' && value > 1000) {
      this.triggerScaleUp();
    }
  }
  
  triggerScaleUp() {
    // Send alert to monitoring system
    logger.info('Scaling alert: Consider increasing instance count', this.metrics);
  }
}

const scalingMetrics = new ScalingMetrics();

// Update metrics regularly
setInterval(async () => {
  const activeUsers = await getActiveUserCount();
  const pendingJobs = await getPendingJobCount();
  const avgResponseTime = await getAverageResponseTime();
  const errorRate = await getErrorRate();
  
  scalingMetrics.update('activeUsers', activeUsers);
  scalingMetrics.update('pendingJobs', pendingJobs);
  scalingMetrics.update('responseTime', avgResponseTime);
  scalingMetrics.update('errorRate', errorRate);
}, 30000); // Every 30 seconds
```

## 9. Load Testing Strategy

### Performance Testing Plan
```javascript
// Example load test using Artillery
/*
config:
  target: "https://your-app.onrender.com"
  phases:
    - duration: 60
      arrivalRate: 20
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
scenarios:
  - name: "Browse Jobs"
    flow:
      - get:
          url: "/api/jobs"
      - get:
          url: "/api/jobs/12345"
  - name: "User Authentication"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
      - get:
          url: "/api/profile"
          headers:
            Authorization: "Bearer {{ token }}"
*/
```

### Key Metrics to Monitor During Testing
1. **Response Times**: 95th percentile < 500ms
2. **Error Rates**: < 1%
3. **Throughput**: Requests per second
4. **Resource Utilization**: CPU, memory, database connections
5. **Queue Backlog**: Background job processing delays

## 10. Capacity Planning

### Resource Requirements Projection

#### User Growth Scenarios
| Scenario | Users | Concurrent | Requests/sec | Database Size |
|----------|-------|------------|--------------|---------------|
| Baseline | 10K | 1,000 | 100 | 10GB |
| Growth | 50K | 5,000 | 500 | 50GB |
| Peak | 100K+ | 10,000+ | 1,000+ | 100GB+ |

#### Infrastructure Scaling Plan
1. **Phase 1 (0-10K users)**: Starter plan on Render
2. **Phase 2 (10K-50K users)**: Standard plan with Redis caching
3. **Phase 3 (50K+ users)**: Professional plan with read replicas
4. **Phase 4 (100K+ users)**: Microservices architecture with Kubernetes

### Geographic Expansion
1. **Phase 1**: Nigeria-focused deployment
2. **Phase 2**: UK/US deployments for diaspora
3. **Phase 3**: South Africa deployment for regional expansion
4. **Phase 4**: Additional African markets (Ghana, Kenya)

## 11. Monitoring for Scaling Events

### Auto-Scaling Triggers
```javascript
// Monitor key indicators for scaling needs
class ScalingMonitor {
  constructor() {
    this.thresholds = {
      cpu: 70, // %
      memory: 80, // %
      responseTime: 500, // ms
      queueLength: 100, // pending jobs
      errorRate: 1 // %
    };
  }
  
  async checkScalingNeeds() {
    const metrics = await this.collectMetrics();
    
    const scalingActions = [];
    
    if (metrics.cpu > this.thresholds.cpu) {
      scalingActions.push('scale_up_cpu');
    }
    
    if (metrics.memory > this.thresholds.memory) {
      scalingActions.push('scale_up_memory');
    }
    
    if (metrics.responseTime > this.thresholds.responseTime) {
      scalingActions.push('scale_up_instances');
    }
    
    if (metrics.queueLength > this.thresholds.queueLength) {
      scalingActions.push('scale_up_workers');
    }
    
    if (metrics.errorRate > this.thresholds.errorRate) {
      scalingActions.push('investigate_issues');
    }
    
    return scalingActions;
  }
  
  async collectMetrics() {
    // Collect from various sources
    return {
      cpu: await getCPUMetrics(),
      memory: await getMemoryMetrics(),
      responseTime: await getResponseTimeMetrics(),
      queueLength: await getQueueLength(),
      errorRate: await getErrorRate()
    };
  }
}
```

## Conclusion

This scalability plan provides a roadmap for NollyCrewHub to grow from a startup to a platform capable of serving the entire Nollywood industry. The approach combines immediate optimizations with long-term architectural improvements, ensuring the platform can handle both steady growth and sudden traffic spikes during key industry events. Regular monitoring and proactive scaling will be key to maintaining performance as the user base expands globally.