#!/bin/bash

# NollyCrewHub Production Deployment Script

set -e  # Exit on any error

echo "Starting NollyCrewHub Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Must be run from the project root directory"
    exit 1
fi

# 1. Pull latest code
echo "1. Pulling latest code from repository..."
git pull origin main

# 2. Install dependencies
echo "2. Installing dependencies..."
npm ci

# 3. Run tests
echo "3. Running tests..."
npm test

# 4. Build client
echo "4. Building client application..."
npm run build:client

# 5. Build server
echo "5. Building server application..."
npm run build:server

# 6. Run database migrations
echo "6. Running database migrations..."
npm run db:migrate:run

# 7. Restart services
echo "7. Restarting services..."
# This would depend on your deployment environment
# For example, if using PM2:
# pm2 restart nollycrew

# Or if using systemd:
# sudo systemctl restart nollycrew

echo "Deployment completed successfully!"
echo "Please verify the application is running correctly."