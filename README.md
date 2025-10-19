# NollyCrewHub - The All-in-One Nollywood Platform

NollyCrewHub is a comprehensive platform designed to connect and empower the entire Nollywood ecosystem, from actors and directors to producers and crew members.

## Features

- **Talent Directory**: Connect with actors, directors, producers, and crew members
- **Job Board**: Find and post casting calls, crew positions, and industry opportunities
- **Project Management**: Manage film projects from concept to completion
- **AI-Powered Tools**: Script analysis, casting recommendations, scheduling optimization, and marketing content generation
- **Real-time Collaboration**: Chat, notifications, and collaborative workspaces
- **Payment Processing**: Secure payments for jobs and services
- **Analytics & Insights**: Data-driven insights for project success

## Deployment

This application is ready for deployment to Render.com with minimal configuration required.

### Prerequisites

- A Render account (https://render.com)
- Required API keys:
  - Paystack for payment processing
  - OpenAI for AI features (optional)
  - Google OAuth for social login (optional)

### Deployment Steps

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect it to your forked repository
4. Set the build command to: `npm install && npm run db:migrate && npm run build`
5. Set the start command to: `npm start`
6. Add required environment variables in the Render dashboard
7. Deploy and verify the application

For detailed deployment instructions, see [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)

## Development

### Prerequisites

- Node.js 20.x
- PostgreSQL
- Git

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy .env.example to .env and configure)
4. Run database migrations: `npm run db:migrate`
5. Start the development server: `npm run dev`

## Documentation

Comprehensive documentation is available in the following files:
- [NOLLYWOOD_DEPLOYMENT_STRATEGY.md](NOLLYWOOD_DEPLOYMENT_STRATEGY.md) - Complete deployment strategy
- [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) - Step-by-step Render deployment guide
- [DEPLOYMENT_TEST_PLAN.md](DEPLOYMENT_TEST_PLAN.md) - Testing procedures for deployment
- [SCALABILITY_PLAN.md](SCALABILITY_PLAN.md) - Scaling strategies for Nollywood industry growth
- [SECURITY_MEASURES_AND_RATE_LIMITING.md](SECURITY_MEASURES_AND_RATE_LIMITING.md) - Security implementation details
- [DATABASE_OPTIMIZATION_AND_BACKUP.md](DATABASE_OPTIMIZATION_AND_BACKUP.md) - Database performance and backup strategies
- [MONITORING_AND_ALERTING_SETUP.md](MONITORING_AND_ALERTING_SETUP.md) - Monitoring and alerting configuration
- [CDN_IMPLEMENTATION_GUIDE.md](CDN_IMPLEMENTATION_GUIDE.md) - Content delivery network setup

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support with deployment issues, please:
1. Check the application logs
2. Review the documentation
3. Open an issue on GitHub with detailed error messages
4. Contact the development team
