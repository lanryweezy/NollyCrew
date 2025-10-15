# NollyCrewHub - Production Ready

NollyCrew: The AI-powered operating system for Nollywood—an all-in-one super-app connecting producers, actors, and crew.

## 🚀 Key Features

### Real-Time Collaboration
- Live chat system with presence tracking
- Collaborative script editing with conflict resolution
- Real-time project updates and notifications

### Advanced Project Management
- Gantt charts for visual project timeline management
- Resource allocation tracking for crew, equipment, and budget
- Milestone management with automated progress updates
- Risk management dashboard with proactive identification tools

### Enhanced Analytics & Reporting
- Predictive analytics with machine learning models
- Financial reporting with automated budget tracking
- Performance benchmarks against industry standards
- Trend analysis with historical data insights

## 🚀 Production Deployment Guide

This guide will help you deploy NollyCrewHub to production environment.

## 📋 Prerequisites

- Node.js 20.x
- PostgreSQL database
- Redis server (for job queues)
- AWS S3 bucket (for file uploads)
- Paystack account (for payments)
- OpenAI API key (for AI features)

## 🛠️ Environment Setup

1. Create a `.env.production` file based on `.env.example`:

```bash
cp .env.example .env.production
```

2. Fill in all required environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets (generate strong secrets for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_SECRET=your-refresh-secret-change-this-in-production

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
```

## 🗄️ Database Setup

1. Run database migrations:

```bash
npm run db:migrate:run
```

## 🏗️ Build Process

1. Install dependencies:

```bash
npm install
```

2. Build the application:

```bash
npm run build
```

## ▶️ Running the Application

Start the application in production mode:

```bash
npm start
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run AI-specific tests:

```bash
npm run test:ai
```

## 📊 Monitoring

The application includes built-in health checks at `/api/health` endpoint.

## 🔒 Security Features

- Rate limiting on all endpoints
- JWT-based authentication
- Input validation and sanitization
- Security headers (XSS protection, etc.)
- Password strength requirements
- Secure cookie handling

## 📈 Performance Optimization

- Database indexing
- Request logging
- Memory usage monitoring
- Efficient API responses

## 🌐 Port Configuration

The application uses port 5000 by default to avoid conflicts with other applications that might be running on port 3000. See `PORT_CONFIGURATION.md` for detailed configuration options.

## 🆘 Support

For issues, check the logs and ensure all environment variables are properly configured.