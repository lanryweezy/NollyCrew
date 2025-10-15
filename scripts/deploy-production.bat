@echo off
REM NollyCrewHub Production Deployment Script for Windows

echo Starting NollyCrewHub Production Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Must be run from the project root directory
    exit /b 1
)

REM 1. Pull latest code
echo 1. Pulling latest code from repository...
git pull origin main

REM 2. Install dependencies
echo 2. Installing dependencies...
npm ci

REM 3. Run tests
echo 3. Running tests...
npm test

REM 4. Build client
echo 4. Building client application...
npm run build:client

REM 5. Build server
echo 5. Building server application...
npm run build:server

REM 6. Run database migrations
echo 6. Running database migrations...
npm run db:migrate:run

REM 7. Restart services
echo 7. Restarting services...
REM This would depend on your deployment environment
REM For example, if using PM2:
REM pm2 restart nollycrew

echo Deployment completed successfully!
echo Please verify the application is running correctly.

pause