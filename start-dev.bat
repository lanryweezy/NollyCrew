@echo off
REM NollyCrewHub Development Server Startup Script for Windows

echo Starting NollyCrewHub Development Server...
echo ========================================

echo Checking if port 5000 is available...
netstat -an | findstr :5000 >nul
if %errorlevel% == 0 (
    echo WARNING: Port 5000 appears to be in use.
    echo Please make sure no other applications are using this port.
    echo.
    pause
)

echo Starting development server on port 5000...
echo.

npm run dev

echo.
echo Server stopped.
pause