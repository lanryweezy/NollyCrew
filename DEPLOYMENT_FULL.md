# NollyCrewHub - Full Production Deployment Guide

This comprehensive guide covers all aspects of deploying NollyCrewHub to a production environment.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Node.js 20.x** installed
2. **PostgreSQL 13+** database
3. **Redis 6+** server
4. **AWS S3 bucket** for file storage
5. **Paystack account** for payment processing
6. **OpenAI API key** for AI features
7. **Domain name** (optional but recommended)

## 🛠️ Environment Setup

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets (generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_SECRET=your-refresh-secret-change-this-in-production
EMAIL_TOKEN_SECRET=your-email-token-secret-change-this-in-production
RESET_TOKEN_SECRET=your-reset-token-secret-change-this-in-production

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=pk_live_your-paystack-public-key

# OpenAI Configuration (Required for AI Features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# AWS S3 Configuration (For File Uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# Redis Configuration (For Job Queues)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Google OAuth (For Authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (For Notifications)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Application Configuration
NODE_ENV=production
PORT=10000
CLIENT_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Generate Strong Secrets

Use a password generator to create strong secrets for:

- `JWT_SECRET` (at least 32 characters)
- `REFRESH_SECRET` (at least 32 characters)
- `EMAIL_TOKEN_SECRET` (at least 32 characters)
- `RESET_TOKEN_SECRET` (at least 32 characters)

## 🗄️ Database Setup

### 1. Create Database

```sql
CREATE DATABASE nollycrew;
CREATE USER nollycrew WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE nollycrew TO nollycrew;
```

### 2. Enable Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3. Run Migrations

```bash
npm run db:migrate:run
```

## 🚀 Deployment Process

### Option 1: Manual Deployment

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/nollycrewhub.git
cd nollycrewhub
```

2. **Install dependencies:**

```bash
npm ci
```

3. **Build the application:**

```bash
npm run build
```

4. **Start the application:**

```bash
npm start
```

### Option 2: Docker Deployment

1. **Build Docker image:**

```bash
docker build -t nollycrewhub .
```

2. **Run with Docker:**

```bash
docker run -d \
  --name nollycrewhub \
  -p 10000:10000 \
  --env-file .env.production \
  nollycrewhub
```

### Option 3: Render Deployment

1. **Connect your GitHub repository to Render**
2. **Configure environment variables in Render dashboard**
3. **Set build command:**

```bash
npm install && npm run db:migrate:run && npm run build
```

4. **Set start command:**

```bash
npm start
```

## 🔧 Configuration

### SSL/TLS

For production, always use HTTPS. You can:

1. **Use Render's automatic SSL** (recommended)
2. **Configure your own SSL certificate**
3. **Use a reverse proxy like Nginx with Let's Encrypt**

### Domain Setup

1. **Point your domain to the server IP**
2. **Configure DNS records:**
   - A record pointing to your server IP
   - CNAME for www subdomain (optional)

### Email Configuration

For email notifications, configure SMTP settings:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📊 Monitoring and Maintenance

### Health Checks

The application provides a health check endpoint at:

```
GET /api/health
```

This endpoint returns:

```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "database": "connected",
  "uptime": 3600.123,
  "memory": {
    "rss": "50 MB",
    "heapTotal": "30 MB",
    "heapUsed": "20 MB"
  }
}
```

### Log Management

Logs are stored in the `logs/` directory:

- `logs/app.log` - Application logs
- `logs/error.log` - Error logs
- Daily rotated log files

### Backup Strategy

1. **Database backups:**
   ```bash
   pg_dump -h host -U username database_name > backup.sql
   ```

2. **File backups:**
   - Regular backups of the S3 bucket
   - Backup of the logs directory

### Performance Monitoring

Monitor these key metrics:

- Response times
- Error rates
- Database query performance
- Memory usage
- CPU usage

## 🔒 Security Best Practices

### 1. Regular Updates

- Keep Node.js updated
- Update npm dependencies regularly
- Monitor for security vulnerabilities

### 2. Access Control

- Use strong passwords
- Implement two-factor authentication
- Regularly rotate API keys
- Limit database permissions

### 3. Network Security

- Use firewalls
- Restrict database access
- Use VPN for admin access
- Implement rate limiting

### 4. Data Protection

- Encrypt sensitive data
- Use HTTPS everywhere
- Implement proper session management
- Regular security audits

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check `DATABASE_URL` format
   - Verify database is running
   - Check network connectivity

2. **Payment processing errors:**
   - Verify Paystack keys
   - Check account status
   - Review webhook configuration

3. **File upload issues:**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Confirm bucket region

4. **Authentication problems:**
   - Check JWT secrets
   - Verify token expiration settings
   - Review OAuth configuration

### Log Analysis

Check logs for:

- Error messages
- Warning messages
- Performance issues
- Security events

### Support

For issues, contact:

- **Development team:** dev@nollycrew.com
- **Operations team:** ops@nollycrew.com
- **Security team:** security@nollycrew.com

## 📈 Scaling

### Horizontal Scaling

1. **Multiple instances:**
   - Use load balancer
   - Shared database
   - Shared Redis instance

2. **Database scaling:**
   - Read replicas
   - Connection pooling
   - Query optimization

### Vertical Scaling

1. **Increase resources:**
   - More CPU
   - More RAM
   - Faster storage

### Caching Strategy

1. **Redis caching:**
   - Session storage
   - API response caching
   - Job queue management

2. **CDN for static assets:**
   - Images
   - Videos
   - Static files

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Check logs
   - Monitor performance
   - Review security alerts

2. **Monthly:**
   - Update dependencies
   - Review backups
   - Test disaster recovery

3. **Quarterly:**
   - Security audit
   - Performance review
   - Capacity planning

### Update Process

1. **Backup everything**
2. **Test in staging environment**
3. **Deploy to production**
4. **Monitor for issues**
5. **Rollback if necessary**

## 📊 Analytics and Metrics

### Key Performance Indicators

1. **User engagement:**
   - Daily active users
   - Monthly active users
   - Session duration

2. **Business metrics:**
   - Job postings
   - Applications
   - Successful matches
   - Revenue

3. **Technical metrics:**
   - API response times
   - Error rates
   - Uptime
   - Database performance

## 📞 Support and Contact

For support, contact:

- **Email:** support@nollycrew.com
- **Phone:** +234 XXX XXX XXXX
- **Hours:** 24/7 support

### Emergency Contact

- **Primary:** +234 XXX XXX XXXX
- **Secondary:** +234 XXX XXX XXXX

---

**Last Updated:** October 2025
**Version:** 1.0.0