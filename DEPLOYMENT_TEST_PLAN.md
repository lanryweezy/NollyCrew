# Deployment Test Plan for NollyCrewHub

This document outlines the steps to test the deployment of NollyCrewHub on Render.

## Pre-Deployment Checklist

### 1. Verify GitHub Repository
- [x] All code has been pushed to the main branch
- [x] Latest commit includes all deployment documentation
- [x] No sensitive information in the repository

### 2. Verify Render Configuration
- [x] render.yaml file exists and is correctly configured
- [x] Database service is defined
- [x] Web service is defined with correct build and start commands
- [x] Environment variables are properly configured

### 3. Verify Application Build Process
- [x] Client builds successfully with `npm run build:client`
- [x] Server builds successfully with `npm run build:server`
- [x] Combined build works with `npm run build`

## Deployment Testing Steps

### 1. Create Render Services

#### Database Service
1. Log in to Render Dashboard
2. Create new PostgreSQL database:
   - Name: `nollycrewhub-db`
   - Plan: Starter
   - Region: Oregon (or closest to target audience)

#### Web Service
1. Create new Web Service:
   - Connect to GitHub repository
   - Set Build Command: `npm install && npm run db:migrate && npm run build`
   - Set Start Command: `npm start`
   - Set plan to Starter (can be upgraded later)

### 2. Configure Environment Variables

In the Render Web Service settings, configure these environment variables:

1. **Required Variables**:
   - `NODE_ENV`: production
   - `JWT_SECRET`: [Generate a secure random string]
   - `PAYSTACK_SECRET_KEY`: [Your Paystack secret key]
   - `PAYSTACK_PUBLIC_KEY`: [Your Paystack public key]

2. **Optional Variables**:
   - `OPENAI_API_KEY`: [For AI features]
   - `GOOGLE_CLIENT_ID`: [For Google OAuth]
   - `GOOGLE_CLIENT_SECRET`: [For Google OAuth]
   - `CLIENT_URL`: [Your deployed URL]

### 3. Deployment Verification

#### Health Check
1. Visit the health endpoint: `https://[your-app-url]/api/health`
2. Verify response includes:
   - Status: healthy
   - Timestamp: current time
   - Uptime: server uptime
   - Memory: memory usage information

#### API Endpoints Testing
1. Test authentication endpoints:
   - POST `/api/auth/register` - Register a new user
   - POST `/api/auth/login` - Login with the new user
   - GET `/api/auth/me` - Get user information (with auth token)

2. Test job endpoints:
   - GET `/api/jobs` - List available jobs
   - POST `/api/jobs` - Create a new job (with auth)
   - GET `/api/jobs/{id}` - Get job details

3. Test project endpoints:
   - GET `/api/projects` - List user projects (with auth)
   - POST `/api/projects` - Create a new project (with auth)

#### Frontend Testing
1. Visit the main page: `https://[your-app-url]/`
2. Verify the landing page loads correctly
3. Test navigation to different pages
4. Verify responsive design on mobile devices

### 4. Performance Testing

#### Load Testing
1. Use a tool like Artillery or Apache Bench to simulate multiple users
2. Test concurrent user scenarios:
   - 10 concurrent users
   - 50 concurrent users
   - 100 concurrent users

#### Response Time Testing
1. Measure response times for key endpoints:
   - Authentication: < 500ms
   - Job listings: < 1000ms
   - Project creation: < 1000ms

### 5. Security Testing

#### Authentication Testing
1. Verify JWT tokens are properly validated
2. Test expired token handling
3. Verify password requirements are enforced
4. Test rate limiting on auth endpoints

#### Input Validation
1. Test SQL injection attempts
2. Test XSS attempts
3. Verify file upload restrictions
4. Test API rate limiting

### 6. Integration Testing

#### Payment Integration
1. Test Paystack payment initialization
2. Verify payment callback handling
3. Test payment status updates

#### AI Features
1. Test script analysis feature
2. Verify casting recommendation generation
3. Test schedule optimization
4. Verify marketing content generation

#### Real-time Features
1. Test WebSocket connections
2. Verify real-time chat functionality
3. Test notification system

## Post-Deployment Monitoring

### 1. Application Monitoring
- Set up alerts for:
  - High error rates (> 1%)
  - Slow response times (> 1 second)
  - High memory usage (> 80%)
  - Database connection issues

### 2. Infrastructure Monitoring
- Monitor:
  - CPU usage
  - Memory usage
  - Disk space
  - Network traffic

### 3. User Experience Monitoring
- Track:
  - Page load times
  - Feature adoption
  - User retention
  - Conversion rates

## Rollback Plan

### If Deployment Fails
1. Immediately check Render logs for error messages
2. Verify environment variables are correctly set
3. Check database connectivity
4. If issues persist, rollback to previous deployment:
   - In Render dashboard, go to the service
   - Click on "Manual Deploy"
   - Select a previous working commit

### If Critical Bug Found
1. Assess impact of the bug
2. If high impact:
   - Immediately rollback to previous version
   - Create hotfix branch
   - Fix the issue
   - Deploy hotfix
3. If low impact:
   - Log the issue
   - Fix in next scheduled deployment

## Success Criteria

### Deployment Success
- Application is accessible via HTTPS
- All API endpoints respond correctly
- Frontend loads without errors
- Database is properly connected
- Environment variables are correctly set

### Performance Success
- Response times meet targets
- Application can handle expected load
- No memory leaks detected
- Database queries are optimized

### Security Success
- No security vulnerabilities detected
- Authentication works correctly
- Input validation is effective
- Rate limiting is functioning

## Support and Troubleshooting

### Common Issues and Solutions

#### Build Failures
1. Check build logs in Render dashboard
2. Verify all dependencies are in package.json
3. Ensure build commands are correct
4. Check for TypeScript compilation errors

#### Database Connection Issues
1. Verify DATABASE_URL environment variable
2. Check database is in same region as web service
3. Ensure database is running
4. Verify database credentials

#### Runtime Errors
1. Check application logs
2. Verify environment variables
3. Test locally with same configuration
4. Check for missing dependencies

#### Performance Issues
1. Monitor resource usage
2. Optimize database queries
3. Implement caching where appropriate
4. Scale up instance size if needed

## Conclusion

This test plan ensures that the NollyCrewHub deployment is thoroughly tested and verified before being made available to users. Following these steps will help identify and resolve any issues before they impact users in the Nollywood industry.