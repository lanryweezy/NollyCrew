# NollyCrewHub Port Configuration

This document explains how to configure and use the NollyCrewHub application with different ports to avoid conflicts with other applications.

## Default Port Configuration

The NollyCrewHub application has been configured to use port **5000** instead of the traditional port 3000 to avoid conflicts with other applications that might be running on port 3000.

## Environment Configuration

### Development Environment
The application will use the following port configuration in development:
- **Server Port**: 5000
- **Client Port**: 5173 (Vite default)

### Production Environment
In production, the application will use:
- **Server Port**: Configured via `PORT` environment variable (defaults to 5000)
- **Client Port**: Same as server (served from the same port)

## Configuration Files

### .env.local
Create a `.env.local` file in the root directory with the following content:
```env
# Application Configuration
PORT=5000
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### .env.production
For production deployment, set the `PORT` environment variable:
```env
PORT=5000
```

## Starting the Application

### Windows
1. Double-click on `start-dev.bat` to start the development server
2. Or run `npm run dev` in the terminal

### Unix/Linux/macOS
1. Run `./start-dev.sh` to start the development server
2. Or run `npm run dev` in the terminal

## Accessing the Application

Once the server is running:
- **Server/API**: http://localhost:5000
- **Client Application**: http://localhost:5173
- **WebSocket Connection**: ws://localhost:5000/ws

## Changing the Port

If you need to use a different port:

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

## Troubleshooting

### Port Already in Use
If you see an error that the port is already in use:
1. Check what application is using the port:
   - Windows: `netstat -ano | findstr :5000`
   - Unix/Linux: `lsof -i :5000`

2. Either stop the conflicting application or change the port configuration

### Connection Refused
If you get a "connection refused" error:
1. Make sure the server is running
2. Check that the correct port is being used
3. Verify firewall settings

## Docker Configuration

When using Docker, the port can be configured in `docker-compose.yml`:
```yaml
environment:
  - PORT=5000
ports:
  - "5000:5000"
```

## Cloud Deployment

For cloud platforms like Render, the PORT environment variable is automatically set.