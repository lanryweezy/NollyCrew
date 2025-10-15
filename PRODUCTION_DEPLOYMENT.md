# NollyCrewHub Production Deployment Guide

This guide provides detailed instructions for deploying NollyCrewHub to a production environment.

## System Requirements

### Server Requirements
- Node.js 20.x or higher
- PostgreSQL 13.x or higher
- Redis 6.x or higher (optional but recommended)
- Git
- Nginx or Apache (for serving static files)

### Recommended Hardware
- Minimum: 2 CPU cores, 4GB RAM
- Recommended: 4 CPU cores, 8GB RAM
- Storage: 20GB SSD (minimum), 50GB SSD (recommended)

## Deployment Options

### 1. Traditional Deployment (Manual)

#### Prerequisites Installation

1. **Install Node.js**:
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # CentOS/RHEL
   sudo yum install postgresql postgresql-contrib
   ```

3. **Install Redis** (optional):
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server
   
   # CentOS/RHEL
   sudo yum install redis
   ```

#### Application Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/nollycrewhub.git
   cd nollycrewhub
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your actual values
   ```

4. **Set up the database**:
   ```bash
   # Create database user and database
   sudo -u postgres psql
   CREATE USER nollycrewhub WITH PASSWORD 'your-password';
   CREATE DATABASE nollycrewhub OWNER nollycrewhub;
   \q
   
   # Run migrations
   npm run db:migrate:run
   ```

5. **Build the application**:
   ```bash
   npm run build
   ```

6. **Start the application**:
   ```bash
   npm start
   ```

### 2. Docker Deployment

1. **Build Docker images**:
   ```bash
   docker-compose build
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

### 3. Cloud Deployment (Render.com)

The application is already configured for deployment on Render.com. Simply:

1. Fork the repository to your GitHub account
2. Create a new Web Service on Render
3. Connect it to your forked repository
4. Set the build command to: `npm run build`
5. Set the start command to: `npm start`
6. Add environment variables in the Render dashboard

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT token signing | `your-super-secret-jwt-key` |
| `CLIENT_URL` | Public URL of your application | `https://yourdomain.com` |

### Optional Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYSTACK_SECRET_KEY` | Paystack API secret key | `sk_live_xxxxxxxxxxxxxxxx` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

## SSL Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Monitoring and Logging

### Application Monitoring

1. **Set up PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start dist/server/index.js --name nollycrewhub
   pm2 startup
   pm2 save
   ```

2. **Configure log rotation**:
   ```bash
   pm2 install pm2-logrotate
   ```

### Database Monitoring

1. **Enable PostgreSQL logging**:
   ```bash
   # Edit postgresql.conf
   logging_collector = on
   log_directory = 'pg_log'
   log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
   log_statement = 'all'
   ```

## Backup and Recovery

### Database Backup

1. **Automated backups with cron**:
   ```bash
   # Create backup script
   #!/bin/bash
   pg_dump nollycrewhub > /backups/nollycrewhub-$(date +%Y%m%d-%H%M%S).sql
   
   # Add to crontab for daily backups at 2 AM
   0 2 * * * /path/to/backup-script.sh
   ```

### File Backup

1. **Backup uploaded files**:
   ```bash
   # If using local file storage
   tar -czf uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz uploads/
   ```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing with Nginx**:
   ```nginx
   upstream nollycrewhub {
       server 127.0.0.1:3000;
       server 127.0.0.1:3001;
       server 127.0.0.1:3002;
   }
   
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://nollycrewhub;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Database Optimization

1. **Connection Pooling**:
   ```bash
   # Increase PostgreSQL connection limits
   # Edit postgresql.conf
   max_connections = 200
   shared_buffers = 256MB
   effective_cache_size = 1GB
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL is running
   - Ensure database user has proper permissions

2. **Authentication Not Working**:
   - Verify JWT_SECRET is set correctly
   - Check if cookies are being set properly
   - Review authentication middleware

3. **Payment Processing Issues**:
   - Verify PAYSTACK_SECRET_KEY
   - Check network connectivity to Paystack
   - Review webhook configuration

### Logs and Debugging

1. **View Application Logs**:
   ```bash
   # If using PM2
   pm2 logs nollycrewhub
   
   # If using systemd
   journalctl -u nollycrewhub -f
   ```

2. **Enable Debug Logging**:
   ```bash
   # Set in environment
   DEBUG=nollycrewhub:*
   ```

## Maintenance

### Regular Maintenance Tasks

1. **Update Dependencies**:
   ```bash
   npm outdated
   npm update
   ```

2. **Database Maintenance**:
   ```sql
   -- Run periodically
   VACUUM ANALYZE;
   ```

3. **Clear Old Logs**:
   ```bash
   # Remove logs older than 30 days
   find /var/log/nollycrewhub -name "*.log" -mtime +30 -delete
   ```

## Support

For support with deployment issues, please:
1. Check the application logs
2. Review this documentation
3. Open an issue on GitHub with detailed error messages
4. Contact the development team