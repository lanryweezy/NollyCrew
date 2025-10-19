# NollyCrewHub Port Configuration Summary

This document summarizes all the changes made to configure the NollyCrewHub application to use port 5000 instead of port 3000 to avoid conflicts with other applications.

## Changes Made

### 1. Environment Configuration Files
- **.env.example**: Updated `PORT=3000` to `PORT=5000`
- **.env.production.example**: Updated `PORT=3000` to `PORT=5000`
- **.env.local**: Created new file with `PORT=5000`

### 2. Documentation Updates
- **README.md**: Added port configuration section
- **DEPLOYMENT.md**: Updated port issues section
- **ENVIRONMENT.md**: Updated default port information
- **PORT_CONFIGURATION.md**: Created new comprehensive guide

### 3. Startup Scripts
- **start-dev.bat**: Created Windows startup script
- **start-dev.sh**: Created Unix/Linux startup script

## Configuration Details

### Development Environment
- **Server Port**: 5000
- **Client Port**: 5173 (Vite default)
- **WebSocket Port**: 5000 (same as server)

### Production Environment
- **Server Port**: Configurable via `PORT` environment variable (defaults to 5000)
- **Client Port**: Same as server (served from the same port)

## Accessing the Application

After starting the server:
- **API Endpoints**: http://localhost:5000/api/
- **WebSocket Connection**: ws://localhost:5000/ws
- **Frontend Application**: http://localhost:5173
- **Health Check**: http://localhost:5000/api/health

## Starting the Application

### Method 1: Using Startup Scripts
- **Windows**: Double-click `start-dev.bat`
- **Unix/Linux/macOS**: Run `./start-dev.sh`

### Method 2: Using npm scripts
```bash
npm run dev
```

### Method 3: Direct execution
```bash
npx cross-env PORT=5000 NODE_ENV=development tsx server/index.ts
```

## Troubleshooting

### Port Already in Use
If you see an error that port 5000 is already in use:
1. Check what application is using the port:
   - Windows: `netstat -ano | findstr :5000`
   - Unix/Linux: `lsof -i :5000`
2. Either stop the conflicting application or change the port

### Connection Issues
If you can't connect to the application:
1. Verify the server is running
2. Check that you're using the correct port (5000)
3. Ensure firewall settings allow connections on port 5000

## Customizing the Port

To use a different port:

1. **Update Environment Variables**:
   ```env
   PORT=your_desired_port
   ```

2. **Update package.json** (if needed):
   ```json
   "scripts": {
     "dev": "cross-env PORT=your_desired_port NODE_ENV=development tsx server/index.ts"
   }
   ```

## Docker Configuration

When using Docker, update the port mapping in `docker-compose.yml`:
```yaml
environment:
  - PORT=5000
ports:
  - "5000:5000"
```

## Cloud Deployment

For cloud platforms:
- The PORT environment variable is typically set automatically
- The application will use `process.env.PORT` if available
- Default fallback is port 5000

## Verification

To verify the port configuration is working:
1. Start the development server
2. Check the console output for the port confirmation message
3. Access http://localhost:5000/api/health to verify the server is running
4. Access http://localhost:5173 to verify the frontend is working

## Conclusion

The NollyCrewHub application is now configured to use port 5000 by default, avoiding conflicts with other applications that might be using port 3000. All necessary configuration files and documentation have been updated to reflect this change.