# Deploying NollyCrewHub to Render

This guide will walk you through deploying your NollyCrewHub application to Render.

## Prerequisites

- A Render account (https://render.com)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Basic understanding of environment variables

## Step-by-Step Deployment

### 1. Push Your Code to Git

First, make sure your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create a New Web Service on Render

1. Go to https://render.com and log in
2. Click "New" → "Web Service"
3. Connect your Git repository
4. Configure the web service:

**Basic Settings:**
- **Name**: `nollycrewhub` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Create a PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Configure the database:
   - **Name**: `nollycrewhub-db`
   - **Database**: PostgreSQL
   - **Plan**: Starter (or higher based on your needs)
   - **Region**: Same as your web service
3. Wait for the database to be created
4. Copy the **Internal Database URL** - you'll need this for the next step

### 4. Configure Environment Variables

In your web service settings, add these environment variables:

**Required:**
- `DATABASE_URL`: Paste the Internal Database URL from your PostgreSQL database
- `JWT_SECRET`: Generate a secure random string (minimum 32 characters)

**Optional (for additional features):**
- `GOOGLE_CLIENT_ID`: For Google OAuth login
- `GOOGLE_CLIENT_SECRET`: For Google OAuth login
- `PAYSTACK_SECRET_KEY`: For payment processing
- `PAYSTACK_PUBLIC_KEY`: For payment processing

### 5. Deploy

Click "Create Web Service" and wait for the deployment to complete. The first deployment will take a few minutes.

### 6. Verify Deployment

Once deployed, you can:
- Visit your app URL (provided by Render)
- Check the logs in the Render dashboard
- Test the health endpoint: `https://your-app-url/api/health`

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify the build command works locally: `npm run build`

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check database is in the same region as web service
   - Ensure database is running

3. **Environment Variables**
   - Double-check all required variables are set
   - Ensure no typos in variable names
   - Restart the service after adding new variables

4. **Port Issues**
   - Render automatically sets the `PORT` environment variable
   - Your app should use `process.env.PORT` (already configured)

### Logs and Debugging

- Check application logs in the Render dashboard
- Use the health check endpoint to verify the app is running
- Test database connection using the test script: `node server/test-db-connection.js`

## Post-Deployment

### Custom Domain (Optional)
1. Go to your web service settings
2. Click "Custom Domains"
3. Add your domain and follow the DNS configuration

### Automatic Deploys
- Render automatically deploys when you push to your connected branch
- You can disable this in service settings if needed

### Scaling
- Upgrade your plan in service settings if you need more resources
- Consider using Render's autoscaling features for high-traffic apps

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS (automatic on Render)
- [ ] Keep dependencies updated
- [ ] Use environment variables for sensitive data
- [ ] Regularly review and rotate API keys

## Support

If you encounter issues:
- Check Render's documentation: https://render.com/docs
- Review your application logs
- Test locally first before deploying
- Consider reaching out to Render support for platform-specific issues