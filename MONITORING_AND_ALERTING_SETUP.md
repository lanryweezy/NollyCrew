# Monitoring and Alerting Setup for NollyCrewHub

This guide provides instructions for setting up comprehensive monitoring and alerting for NollyCrewHub to ensure high availability and performance for Nollywood users.

## 1. Application Monitoring

### Render Built-in Monitoring
Render provides basic monitoring out of the box:
- CPU and memory usage
- Response times
- Error rates
- Throughput metrics

### Enhanced Application Monitoring with Sentry

#### Setup Process
1. **Create Sentry Account**
   - Visit https://sentry.io
   - Sign up for a free account
   - Create a new project (Node.js for backend, React for frontend)

2. **Backend Integration (Node.js/Express)**
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

   Add to your server setup:
   ```javascript
   import * as Sentry from "@sentry/node";
   import { ProfilingIntegration } from "@sentry/profiling-node";

   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     integrations: [
       new Sentry.Integrations.Http({ tracing: true }),
       new Sentry.Integrations.Express({ app }),
       new ProfilingIntegration(),
     ],
     tracesSampleRate: 1.0,
     profilesSampleRate: 1.0,
   });
   ```

3. **Frontend Integration (React)**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

   Add to your main App component:
   ```javascript
   import * as Sentry from "@sentry/react";
   import { Integrations } from "@sentry/tracing";

   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     integrations: [new Integrations.BrowserTracing()],
     tracesSampleRate: 1.0,
   });
   ```

### Custom Metrics Collection
Implement custom metrics for Nollywood-specific functionality:

```javascript
// Example: Track job posting activity
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    // ... job creation logic ...
    
    // Track custom metric
    if (process.env.SENTRY_DSN) {
      Sentry.metrics.increment('job_posted', 1, {
        tags: {
          job_type: req.body.type,
          user_role: req.user.role
        }
      });
    }
    
    res.status(201).json({ job });
  } catch (error) {
    // ... error handling ...
  }
});
```

## 2. Infrastructure Monitoring

### Render Metrics Dashboard
Monitor these key metrics in Render:
- **Response Time**: Should be < 500ms for 95% of requests
- **Error Rate**: Should be < 1%
- **CPU Usage**: Should be < 70% under normal load
- **Memory Usage**: Should be < 80% under normal load
- **Throughput**: Track requests per second

### Database Monitoring
Monitor PostgreSQL performance:
- **Connection Count**: Ensure connections are properly pooled
- **Query Performance**: Track slow query execution
- **Disk Usage**: Monitor storage consumption
- **Cache Hit Ratio**: Should be > 95%

## 3. Log Management

### Structured Logging
The application already uses structured logging. Enhance with:

```javascript
// In logger utility
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nollycrewhub' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

export { logger };
```

### Centralized Log Management with Loggly or Papertrail
1. **Create Account**: Sign up for Loggly or Papertrail
2. **Configure Transport**: Add transport to Winston configuration
3. **Set Up Alerts**: Create alerts for error patterns

## 4. Uptime Monitoring

### UptimeRobot Setup
1. **Create Account**: Sign up at https://uptimerobot.com
2. **Add Monitor**: 
   - Type: HTTP(s)
   - URL: Your application's health endpoint (e.g., https://your-app.onrender.com/api/health)
   - Monitoring Interval: 5 minutes
3. **Configure Alerts**: 
   - Email notifications
   - SMS alerts for critical issues
   - Slack/Teams integration

### Custom Health Checks
Enhance the built-in health check endpoint:

```javascript
// Enhanced health check in routes.ts
app.get('/api/health', async (req, res) => {
  try {
    // Database connectivity check
    const dbHealth = await storage.checkConnection();
    
    // Redis connectivity check (if used)
    let redisHealth = { status: 'not_configured' };
    if (redisClient) {
      redisHealth = await redisClient.ping();
    }
    
    // External service checks
    const externalServices = {
      paystack: await checkPaystackStatus(),
      openai: await checkOpenAIStatus()
    };
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth,
      redis: redisHealth,
      externalServices,
      version: process.env.npm_package_version
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

## 5. Performance Monitoring

### Frontend Performance
Use Web Vitals tracking:
```javascript
// In client-side code
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### API Performance Tracking
Monitor API endpoint performance:
```javascript
// Add to middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Send metrics to monitoring service
    if (process.env.SENTRY_DSN) {
      Sentry.metrics.distribution('api_response_time', duration, {
        tags: {
          method: req.method,
          endpoint: req.path
        }
      });
    }
  });
  
  next();
});
```

## 6. Alerting Configuration

### Critical Alerts (Immediate Response Required)
- Application downtime (> 2 minutes)
- High error rate (> 5%)
- Database connectivity issues
- Payment processing failures

### Warning Alerts (Within Business Hours)
- CPU usage > 70% for 15 minutes
- Memory usage > 80% for 15 minutes
- Slow response times (> 1 second for 95th percentile)
- Database connection pool exhaustion

### Informational Alerts (Weekly Review)
- New user registrations
- Job postings
- Successful payments
- Feature usage metrics

### Alert Channels
1. **Primary**: Email notifications to team
2. **Critical**: SMS alerts for 24/7 coverage
3. **Operational**: Slack channel notifications
4. **Business Metrics**: Weekly summary reports

## 7. Nollywood-Specific Monitoring

### Industry Event Monitoring
Track metrics during key Nollywood events:
- Film festival periods
- Award season
- Major film release dates
- Audition periods

### Geographic Performance
Monitor performance by region:
- Nigeria (primary market)
- UK (diaspora)
- US (diaspora)
- South Africa (regional expansion)

### Device Performance
Track performance by device type:
- Mobile (primary for many users)
- Desktop
- Tablet

## 8. Monitoring Dashboard

### Key Metrics to Display
1. **Application Health**
   - Uptime percentage
   - Response time trends
   - Error rate trends

2. **Business Metrics**
   - Active users
   - Job postings
   - Applications submitted
   - Payments processed

3. **Infrastructure**
   - Resource utilization
   - Database performance
   - CDN performance

4. **User Experience**
   - Page load times
   - Feature adoption
   - User journey completion

### Dashboard Tools
1. **Grafana**: For custom dashboards
2. **Render Dashboard**: For basic metrics
3. **Sentry Dashboard**: For error tracking
4. **Google Analytics**: For user behavior

## 9. Incident Response

### Escalation Process
1. **Level 1**: Dev team monitoring (during business hours)
2. **Level 2**: On-call engineer (24/7)
3. **Level 3**: Engineering manager (critical issues)
4. **Level 4**: CTO/Technical leadership (major outages)

### Communication Plan
- Internal: Slack channels for incident communication
- External: Status page for user notifications
- Stakeholders: Email updates for major incidents

### Post-Incident Review
- Document root cause
- Identify preventive measures
- Update runbooks
- Share learnings with team

## 10. Cost Considerations

### Monitoring Service Costs
1. **Sentry**: Free tier up to 5k errors/month, then $26/month
2. **UptimeRobot**: Free for 50 monitors, then $5-45/month
3. **Log Management**: Papertrail ($7-200/month), Loggly ($49-449/month)
4. **Advanced Monitoring**: DataDog, New Relic ($15-200+/host/month)

### Optimization Tips
- Start with free tiers
- Implement sampling for high-volume metrics
- Use serverless functions for custom monitoring
- Regularly review and adjust alert thresholds

## Conclusion

A comprehensive monitoring and alerting system is essential for maintaining a reliable platform for Nollywood professionals. Start with Render's built-in monitoring and gradually add more sophisticated tools as your user base grows. Regular review of metrics and alerts will help you proactively address issues before they impact users.