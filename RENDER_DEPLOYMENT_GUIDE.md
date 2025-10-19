# Render Deployment Guide for NollyCrewHub

This guide provides step-by-step instructions for deploying NollyCrewHub to Render.com, making it accessible to the entire Nollywood industry.

## Prerequisites

1. A Render account (https://render.com)
2. A GitHub account with the NollyCrewHub repository
3. Required API keys:
   - Paystack API keys (for payment processing)
   - OpenAI API key (for AI features, optional)
   - Google OAuth keys (for social login, optional)

## Deployment Steps

### 1. Create Database Service

1. Log in to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Configure the database:
   - **Name**: `nollycrewhub-db`
   - **Database**: PostgreSQL
   - **Plan**: Starter (can be upgraded later)
   - **Region**: Oregon (or closest to your users)
4. Click "Create Database"
5. Wait for the database to finish provisioning

### 2. Create Web Service

1. In the Render dashboard, click "New" → "Web Service"
2. Connect to your GitHub repository
3. Configure the service:
   - **Name**: `nollycrewhub`
   - **Environment**: Node
   - **Region**: Same as your database
   - **Branch**: main
   - **Root Directory**: Leave blank (root of repository)
   - **Build Command**: `npm install && npm run db:migrate && npm run build`
   - **Start Command**: `npm start`
4. Click "Advanced" to configure environment variables

### 3. Configure Environment Variables

In the "Advanced" section, add these environment variables:

#### Required Variables
- `NODE_ENV`: `production`
- `JWT_SECRET`: [Generate a secure random string at least 32 characters long]
- `PAYSTACK_SECRET_KEY`: [Your Paystack secret key]
- `PAYSTACK_PUBLIC_KEY`: [Your Paystack public key]

#### Optional Variables
- `OPENAI_API_KEY`: [Your OpenAI API key for AI features]
- `GOOGLE_CLIENT_ID`: [Your Google OAuth client ID]
- `GOOGLE_CLIENT_SECRET`: [Your Google OAuth client secret]
- `CLIENT_URL`: [Your deployed application URL, e.g., https://nollycrewhub.onrender.com]

#### Database Variable (Automatically Set)
Render will automatically set the `DATABASE_URL` environment variable based on your database service.

### 4. Deploy the Service

1. Click "Create Web Service"
2. Render will automatically start building and deploying your application
3. Monitor the build logs in the "Logs" tab
4. The initial build may take 5-10 minutes

## Post-Deployment Configuration

### 1. Verify Deployment

1. Once deployed, visit your application URL
2. Test the health endpoint: `https://[your-app-url]/api/health`
3. You should receive a JSON response with status information

### 2. Test Core Functionality

1. Register a new user account
2. Log in with the new account
3. Create a test job posting
4. Browse job listings
5. Test the payment integration with Paystack

### 3. Configure Custom Domain (Optional)

1. In your web service settings, click "Custom Domains"
2. Add your domain name
3. Follow the DNS configuration instructions
4. Wait for SSL certificate provisioning

## Monitoring and Maintenance

### 1. Monitoring

Render provides built-in monitoring:
- CPU and memory usage
- Response times
- Error rates
- Throughput metrics

Set up alerts for:
- High error rates (> 1%)
- Slow response times (> 1 second)
- High resource usage (> 80%)

### 2. Log Management

View application logs in the Render dashboard:
- Real-time log streaming
- Historical log access
- Log search and filtering

### 3. Automatic Deploys

Render automatically deploys new commits to your main branch. To disable:
1. Go to your web service settings
2. Click "Deploy"
3. Toggle "Auto Deploy" to off

## Scaling Considerations

### 1. Instance Scaling

As your user base grows:
1. Upgrade your plan in service settings
2. Consider moving to the Standard or Professional plan
3. Monitor resource usage and upgrade as needed

### 2. Database Scaling

For high-traffic scenarios:
1. Upgrade your database plan
2. Consider adding read replicas
3. Implement connection pooling

### 3. Performance Optimization

To improve performance:
1. Implement Redis caching for session management
2. Use a CDN for static assets
3. Optimize database queries
4. Implement background job processing

## Troubleshooting Common Issues

### 1. Build Failures

**Symptoms**: Deployment fails during the build phase

**Solutions**:
- Check build logs for specific error messages
- Verify all dependencies are in package.json
- Ensure build commands are correct
- Check for TypeScript compilation errors

### 2. Database Connection Issues

**Symptoms**: Application fails to start or database operations fail

**Solutions**:
- Verify DATABASE_URL environment variable is set
- Check database is in same region as web service
- Ensure database is running
- Verify database credentials

### 3. Runtime Errors

**Symptoms**: Application crashes or returns 500 errors

**Solutions**:
- Check application logs for error messages
- Verify all required environment variables are set
- Test locally with same configuration
- Check for missing dependencies

### 4. Performance Issues

**Symptoms**: Slow response times or high latency

**Solutions**:
- Monitor resource usage in Render dashboard
- Optimize database queries
- Implement caching where appropriate
- Scale up instance size if needed

## Security Best Practices

### 1. Environment Variables

- Never commit secrets to version control
- Use Render's environment variable management
- Rotate API keys regularly
- Use strong, randomly generated secrets

### 2. HTTPS

- Render automatically provides HTTPS
- Ensure all external links use HTTPS
- Redirect HTTP traffic to HTTPS

### 3. Authentication

- Use strong password requirements
- Implement rate limiting on auth endpoints
- Use secure JWT token configuration
- Regularly rotate JWT secrets

## Backup and Recovery

### 1. Database Backups

Render automatically provides:
- Daily backups
- Point-in-time recovery
- Cross-region replication

### 2. Code Backups

- GitHub repository serves as code backup
- Use Git tags for release versions
- Maintain a changelog

### 3. Disaster Recovery

In case of service failure:
- Use Render's point-in-time database recovery
- Re-deploy from GitHub repository
- Restore from manual backups if needed

## Cost Management

### 1. Render Pricing

- **Web Service**: Starter plan is free for low-traffic applications
- **Database**: Starter plan is free for small databases
- **Professional Plans**: Required for high-traffic applications

### 2. Optimization Tips

- Monitor resource usage to avoid over-provisioning
- Use free tiers during development
- Upgrade plans based on actual usage
- Consider scheduled scaling for predictable traffic patterns

## Support Resources

### 1. Render Support

- Render Documentation: https://render.com/docs
- Render Community Forum: https://community.render.com
- Render Support: https://render.com/contact

### 2. NollyCrewHub Support

- GitHub Issues: [Your repository issues page]
- Documentation: [Link to your documentation]
- Community: [Link to your community platform]

## Conclusion

Following this guide will successfully deploy NollyCrewHub to Render, making it accessible to professionals throughout the Nollywood industry. The platform is designed to scale with your growing user base and can handle the demands of a thriving film industry community.

Regular monitoring, maintenance, and optimization will ensure optimal performance and user experience as your platform grows.