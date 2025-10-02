# NollyCrew Environment Setup Guide

This guide will help you set up the environment variables needed for full AI functionality in NollyCrew.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### 1. Database Configuration
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/nollycrew
```

### 2. JWT Secret
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
**Important**: Generate a strong, random secret for production use.

### 3. OpenAI Configuration (Required for AI Features)
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**How to get OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note**: OpenAI API usage is paid. Monitor your usage in the OpenAI dashboard.

### 4. AWS S3 Configuration (For File Uploads)
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1
```

**How to set up AWS S3:**
1. Create an AWS account
2. Go to S3 service
3. Create a new bucket
4. Create IAM user with S3 permissions
5. Generate access keys for the user

### 5. Redis Configuration (For Job Queues)
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
```

**How to set up Redis:**
1. Install Redis locally or use a cloud service
2. For local development: `brew install redis` (Mac) or `sudo apt install redis` (Ubuntu)
3. Start Redis: `redis-server`

### 6. Paystack Configuration (For Payments)
```bash
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key
```

**How to get Paystack keys:**
1. Sign up at [Paystack](https://paystack.com/)
2. Go to Settings > API Keys & Webhooks
3. Copy your test keys for development

### 7. Google OAuth (For Authentication)
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**How to set up Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### 8. Email Configuration (For Notifications)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 9. Application Configuration
```bash
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
```

## AI Features That Require OpenAI API Key

With a valid OpenAI API key, you get access to:

### 1. **Script Analysis**
- Intelligent scene extraction from scripts
- Character identification and analysis
- Location and prop detection
- VFX and wardrobe requirements
- Duration estimation

### 2. **Casting AI**
- Semantic matching between roles and actors
- Experience and skill-based recommendations
- Bias detection and fairness checks
- Detailed audit trails

### 3. **Schedule Optimization**
- Constraint-based scheduling
- Location grouping optimization
- Daylight hour consideration
- Cost minimization
- Crew availability matching

### 4. **Marketing Content Generation**
- Tagline creation
- Poster descriptions
- Trailer script generation
- Social media content

## Fallback Behavior

If OpenAI API key is not configured:
- All AI features fall back to mock implementations
- Basic functionality remains available
- Users get notifications about limited AI features

## Testing AI Features

Run the AI test suite:
```bash
npm run test:ai
```

Run with coverage:
```bash
npm run test:coverage
```

## Production Deployment

For production deployment:

1. **Use strong secrets**: Generate cryptographically secure secrets
2. **Use production OpenAI plan**: Ensure you have sufficient API credits
3. **Set up monitoring**: Monitor API usage and costs
4. **Use Redis cluster**: For high availability
5. **Use managed databases**: PostgreSQL and Redis
6. **Set up logging**: For debugging and monitoring

## Cost Considerations

### OpenAI API Costs (Approximate)
- Script Analysis: ~$0.01-0.05 per script
- Casting Recommendations: ~$0.001-0.01 per search
- Schedule Optimization: ~$0.01-0.03 per optimization
- Marketing Content: ~$0.005-0.02 per generation

### AWS S3 Costs
- Storage: ~$0.023 per GB per month
- Requests: ~$0.0004 per 1,000 requests

### Redis Costs
- Local development: Free
- Cloud Redis: ~$15-50/month depending on size

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment-specific keys** (test vs production)
3. **Rotate keys regularly**
4. **Monitor API usage** for unusual activity
5. **Use IAM roles** in production (AWS)
6. **Enable API key restrictions** (OpenAI)

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check your `.env` file
   - Ensure the key starts with `sk-`
   - Verify the key is valid in OpenAI dashboard

2. **"Redis connection failed"**
   - Ensure Redis is running
   - Check connection details
   - Verify network access

3. **"S3 upload failed"**
   - Check AWS credentials
   - Verify bucket permissions
   - Ensure bucket exists

4. **"Database connection failed"**
   - Check DATABASE_URL format
   - Ensure database is running
   - Verify credentials

### Getting Help

- Check the logs for detailed error messages
- Verify all environment variables are set
- Test individual services (Redis, S3, OpenAI) separately
- Use the test suite to verify functionality

## Next Steps

1. Set up your environment variables
2. Install and start Redis
3. Get your OpenAI API key
4. Run the test suite to verify setup
5. Start the development server
6. Test AI features in the UI
