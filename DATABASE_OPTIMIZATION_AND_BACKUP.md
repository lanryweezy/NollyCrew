# Database Optimization and Backup Strategy for NollyCrewHub

This document outlines strategies for optimizing database performance and implementing robust backup solutions for NollyCrewHub to serve the Nollywood industry effectively.

## 1. Database Performance Optimization

### Index Optimization

#### Critical Indexes for NollyCrewHub
1. **Users Table**
   ```sql
   -- Email lookups (authentication)
   CREATE INDEX idx_users_email ON users (email);
   
   -- Role-based queries
   CREATE INDEX idx_users_role ON users (role);
   
   -- Active status queries
   CREATE INDEX idx_users_active ON users (is_active);
   ```

2. **Jobs Table**
   ```sql
   -- Job type filtering
   CREATE INDEX idx_jobs_type ON jobs (type);
   
   -- Location-based searches
   CREATE INDEX idx_jobs_location ON jobs (location);
   
   -- Active jobs
   CREATE INDEX idx_jobs_active ON jobs (is_active);
   
   -- Date-based queries
   CREATE INDEX idx_jobs_created ON jobs (created_at);
   ```

3. **Projects Table**
   ```sql
   -- Project status
   CREATE INDEX idx_projects_status ON projects (status);
   
   -- Creator lookups
   CREATE INDEX idx_projects_creator ON projects (created_by_id);
   
   -- Date-based queries
   CREATE INDEX idx_projects_created ON projects (created_at);
   ```

4. **Job Applications Table**
   ```sql
   -- Job-based lookups
   CREATE INDEX idx_applications_job ON job_applications (job_id);
   
   -- Applicant-based lookups
   CREATE INDEX idx_applications_applicant ON job_applications (applicant_id);
   
   -- Date-based queries
   CREATE INDEX idx_applications_created ON job_applications (created_at);
   ```

### Query Optimization

#### Common Queries and Optimizations

1. **Job Search Query**
   ```sql
   -- Optimized query for job listings
   SELECT j.*, u.first_name, u.last_name 
   FROM jobs j
   JOIN users u ON j.posted_by_id = u.id
   WHERE j.is_active = true
     AND (j.type = $1 OR $1 IS NULL)
     AND (j.location ILIKE '%' || $2 || '%' OR $2 IS NULL)
   ORDER BY j.created_at DESC
   LIMIT $3;
   ```

2. **Talent Search Query**
   ```sql
   -- Optimized query for talent search
   SELECT u.*, ur.role 
   FROM users u
   JOIN user_roles ur ON u.id = ur.user_id
   WHERE ur.role IN ('actor', 'director', 'producer')
     AND (u.location ILIKE '%' || $1 || '%' OR $1 IS NULL)
     AND (u.skills && $2::text[] OR $2 IS NULL)
   ORDER BY u.created_at DESC
   LIMIT $3;
   ```

3. **Project Analytics Query**
   ```sql
   -- Optimized query for project analytics
   SELECT 
     p.status,
     COUNT(*) as count,
     AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/3600) as avg_duration_hours
   FROM projects p
   WHERE p.created_at >= NOW() - INTERVAL '30 days'
   GROUP BY p.status;
   ```

### Connection Pooling

#### Configuration for Render PostgreSQL
```javascript
// In db.ts or storage.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  min: 5,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  keepAlive: true, // Keep TCP connection alive
  keepAliveInitialDelayMillis: 10000 // Delay before first keepalive probe
});
```

### Caching Strategy

#### Redis Implementation
```javascript
// Redis caching for frequent queries
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Cache job listings for 15 minutes
async function getCachedJobs(filters) {
  const cacheKey = `jobs:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const jobs = await storage.getJobs(filters);
  await redis.setex(cacheKey, 900, JSON.stringify(jobs)); // 15 minutes
  return jobs;
}
```

## 2. Database Backup Strategy

### Backup Types

#### 1. Full Database Backups
- **Frequency**: Daily at 2:00 AM (off-peak hours)
- **Retention**: 30 days
- **Storage**: Multiple geographic locations

#### 2. Incremental Backups
- **Frequency**: Every 6 hours
- **Retention**: 7 days
- **Storage**: Primary backup location

#### 3. Transaction Log Backups
- **Frequency**: Every 15 minutes
- **Retention**: 24 hours
- **Storage**: High-performance storage

### Backup Implementation

#### Render PostgreSQL Backup Configuration
Render automatically provides point-in-time recovery for PostgreSQL databases. To enhance this:

1. **Automated Backup Script**
   ```bash
   #!/bin/bash
   # backup-database.sh
   
   # Create backup with timestamp
   BACKUP_FILE="nollycrewhub-$(date +%Y%m%d-%H%M%S).sql"
   pg_dump $DATABASE_URL > "/backups/$BACKUP_FILE"
   
   # Compress backup
   gzip "/backups/$BACKUP_FILE"
   
   # Upload to cloud storage (AWS S3 example)
   aws s3 cp "/backups/$BACKUP_FILE.gz" s3://nollycrewhub-backups/
   
   # Remove local backup older than 7 days
   find /backups -name "*.sql.gz" -mtime +7 -delete
   ```

2. **Cron Job Configuration**
   ```bash
   # Add to crontab
   # Daily full backup at 2 AM
   0 2 * * * /path/to/backup-database.sh
   
   # Weekly cleanup
   0 3 * * 0 /path/to/cleanup-old-backups.sh
   ```

#### Cross-Region Backup Replication
1. **Primary Region**: Store backups in the same region as database
2. **Secondary Region**: Replicate backups to a different geographic region
3. **Implementation**: Use cloud provider tools for cross-region replication

### Backup Verification

#### Automated Restore Testing
```bash
#!/bin/bash
# test-backup-restore.sh

# Select a random backup from last 7 days
BACKUP_FILE=$(find /backups -name "*.sql.gz" -mtime -7 | shuf -n 1)

# Create test database
createdb nollycrewhub_test_restore

# Restore backup to test database
gunzip -c $BACKUP_FILE | psql nollycrewhub_test_restore

# Run basic verification queries
psql nollycrewhub_test_restore -c "SELECT COUNT(*) FROM users;"
psql nollycrewhub_test_restore -c "SELECT COUNT(*) FROM jobs;"
psql nollycrewhub_test_restore -c "SELECT COUNT(*) FROM projects;"

# Clean up test database
dropdb nollycrewhub_test_restore

# Report results
echo "Backup verification completed for $BACKUP_FILE"
```

## 3. Disaster Recovery Plan

### Recovery Point Objective (RPO)
- **Target**: 1 hour
- **Strategy**: Transaction log backups every 15 minutes

### Recovery Time Objective (RTO)
- **Target**: 4 hours
- **Strategy**: Pre-configured restore procedures and standby systems

### Recovery Procedures

#### 1. Database Restoration
```bash
# Restore from full backup
createdb nollycrewhub_restored
gunzip -c backup-file.sql.gz | psql nollycrewhub_restored

# Apply transaction logs if needed
# (Specific commands depend on backup tool used)
```

#### 2. Point-in-Time Recovery
```sql
-- Restore to specific point in time
pg_restore --target-time="2025-10-15 14:30:00" --verbose backup-file
```

## 4. Monitoring Database Health

### Key Metrics to Monitor

#### Performance Metrics
1. **Query Response Time**
   - Target: < 100ms for 95% of queries
   - Alert: > 500ms for sustained periods

2. **Connection Pool Usage**
   - Target: < 80% utilization
   - Alert: > 95% utilization

3. **Cache Hit Ratio**
   - Target: > 95%
   - Alert: < 90%

#### Resource Metrics
1. **CPU Usage**
   - Target: < 70%
   - Alert: > 85%

2. **Memory Usage**
   - Target: < 80%
   - Alert: > 90%

3. **Disk I/O**
   - Target: < 1000 IOPS average
   - Alert: > 2000 IOPS sustained

### Database Monitoring Implementation

#### Custom Health Check Endpoint
```javascript
// Enhanced database health check
async function checkDatabaseHealth() {
  try {
    // Connection test
    const connectionTest = await pool.query('SELECT 1');
    
    // Performance test
    const startTime = Date.now();
    const performanceTest = await pool.query('SELECT COUNT(*) FROM users');
    const responseTime = Date.now() - startTime;
    
    // Connection pool status
    const poolStatus = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };
    
    // Recent error check
    const recentErrors = await pool.query(`
      SELECT COUNT(*) as error_count 
      FROM logs 
      WHERE level = 'error' 
        AND timestamp > NOW() - INTERVAL '1 hour'
        AND message LIKE '%database%'
    `);
    
    return {
      status: 'healthy',
      responseTime,
      poolStatus,
      recentErrors: recentErrors.rows[0].error_count,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 5. Nollywood-Specific Database Considerations

### High-Traffic Periods
1. **Film Festival Seasons**
   - Increase monitoring frequency
   - Pre-warm database connections
   - Scale connection pool size

2. **Audition Periods**
   - Optimize job application queries
   - Implement queuing for high-volume operations
   - Monitor for lock contention

3. **Award Seasons**
   - Prepare for increased profile views
   - Optimize user lookup queries
   - Scale read operations

### Data Growth Patterns
1. **Linear Growth**: User registrations, job postings
2. **Seasonal Spikes**: Film festival periods, award seasons
3. **Viral Growth Potential**: Successful marketing campaigns

### Geographic Considerations
1. **Nigeria**: Primary data center location
2. **UK/US**: Secondary locations for diaspora
3. **South Africa**: Regional expansion point

## 6. Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks
1. **Index Maintenance**
   ```sql
   REINDEX TABLE jobs;
   REINDEX TABLE users;
   REINDEX TABLE projects;
   ```

2. **Statistics Update**
   ```sql
   ANALYZE jobs;
   ANALYZE users;
   ANALYZE projects;
   ```

#### Monthly Tasks
1. **Database Vacuum**
   ```sql
   VACUUM ANALYZE;
   ```

2. **Log Review**
   - Review slow query logs
   - Identify optimization opportunities
   - Update index strategies

### Automated Maintenance
```bash
# Weekly maintenance script
#!/bin/bash
# weekly-maintenance.sh

# Update database statistics
psql $DATABASE_URL -c "ANALYZE;"

# Reindex critical tables
psql $DATABASE_URL -c "REINDEX TABLE jobs;"
psql $DATABASE_URL -c "REINDEX TABLE users;"
psql $DATABASE_URL -c "REINDEX TABLE projects;"

# Log maintenance completion
echo "Weekly maintenance completed on $(date)" >> /var/log/db-maintenance.log
```

## 7. Cost Optimization

### Storage Optimization
1. **Data Archiving**
   ```sql
   -- Archive old job applications
   INSERT INTO job_applications_archive 
   SELECT * FROM job_applications 
   WHERE created_at < NOW() - INTERVAL '2 years';
   
   DELETE FROM job_applications 
   WHERE created_at < NOW() - INTERVAL '2 years';
   ```

2. **Compression**
   - Enable PostgreSQL TOAST compression
   - Use appropriate data types
   - Consider columnar storage for analytics

### Connection Management
1. **Optimal Pool Sizing**
   - Start with conservative numbers
   - Scale based on monitoring data
   - Avoid over-provisioning

2. **Connection Lifecycle**
   - Implement proper connection cleanup
   - Use connection timeouts
   - Monitor for connection leaks

## Conclusion

A well-optimized database with robust backup strategies is crucial for NollyCrewHub's success in serving the Nollywood industry. Regular monitoring, maintenance, and optimization will ensure the platform can handle growth while maintaining high performance and reliability. The backup strategy provides multiple layers of protection against data loss, with both automated and manual recovery options.