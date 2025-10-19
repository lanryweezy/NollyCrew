#!/bin/bash
# NollyCrewHub Development Server Startup Script for Unix/Linux

echo "Starting NollyCrewHub Development Server..."
echo "========================================"

echo "Checking if port 5000 is available..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "WARNING: Port 5000 appears to be in use."
    echo "Please make sure no other applications are using this port."
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
fi

echo "Starting development server on port 5000..."
echo ""

npm run dev

echo ""
echo "Server stopped."