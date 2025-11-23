#!/bin/bash

# Start script for Nexus QA (Next.js)
# This script starts the Next.js development server and logs output to files.

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Cleanup old logs
rm -f server.log

echo "🚀 Starting Next.js Development Server..."
echo "📝 Server logs will be written to server.log"

# Start Next.js dev server in background, redirecting all output (stdout and stderr) to server.log
# We use direct redirection `>` which is more reliable than `tee` for non-interactive shells
# and prevents buffering issues.
touch server.log
npm run dev > server.log 2>&1 &

SERVER_PID=$!

echo "✅ Server started with PID $SERVER_PID"
echo "🌐 Open http://localhost:3000 to view the app"
echo "👉 Press Ctrl+C to stop the server"

# Tail the log file in the background to show output in the console
tail -f server.log &
TAIL_PID=$!

# Function to handle script exit
cleanup() {
    echo ""
    echo "🛑 Stopping server..."
    kill $SERVER_PID
    kill $TAIL_PID
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Wait for the server process
wait $SERVER_PID
