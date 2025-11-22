#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping server..."
    # Find and kill the process listening on port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    exit
}

# Set trap to call cleanup function on script interruption
trap cleanup INT

# Clear old logs
echo "Clearing and initializing logs..." > server.log
echo "" > browser.log

# Kill any existing node/vite processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "🚀 Starting Vite Server..."
# Run vite in background, redirect output to server.log
npm run dev > server.log 2>&1 &
VITE_PID=$!

echo "⏳ Waiting for server to launch..."
sleep 4

echo "👀 Launching Browser & Logger..."
echo "   (Close the browser or Press Ctrl+C here to stop everything)"
# Run the watcher which will open the browser
node console_watcher.js
