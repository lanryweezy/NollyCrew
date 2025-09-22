# Environment Variables for NollyCrewHub

This document lists all the environment variables required for the application to run properly in production.

## Required Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string (provided by Render's database service)
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://user:pass@localhost:5432/nollycrewhub`

### Authentication
- `JWT_SECRET` - Secret key for JWT token signing
  - Should be a long, random string (minimum 32 characters)
  - Example: `your-super-secret-jwt-key-keep-this-safe`

### Google OAuth (Optional)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Payment Processing (Optional)
- `PAYSTACK_SECRET_KEY` - Paystack secret key for payment processing
- `PAYSTACK_PUBLIC_KEY` - Paystack public key for client-side

### Application Settings
- `NODE_ENV` - Environment mode (automatically set to `production` on Render)
- `PORT` - Port number (automatically set by Render, defaults to 10000)

## Setting Up on Render

1. **Database**: When you create a PostgreSQL database on Render, it will automatically provide the `DATABASE_URL`

2. **Environment Variables**: Add these in your Render dashboard under your web service settings:
   - Generate a secure `JWT_SECRET` (use a password generator)
   - Add Google OAuth credentials if you want Google login
   - Add Paystack keys if you want payment processing

3. **Database Migration**: The app will automatically run migrations on startup using the `db:push` script

## Local Development

For local development, create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://localhost:5432/nollycrewhub
JWT_SECRET=your-development-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
NODE_ENV=development
PORT=5000
```

## Security Notes

- Never commit the `.env` file to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Keep payment and OAuth credentials secure