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

# Start Next.js dev server in background, redirecting output to server.log
# We use unbuffer (if available) or just pipe to tee/file to keep colors if possible, 
# but standard redirection `> server.log 2>&1` is safest for file logging.
# To see output in console AND file, we use `tee`.

npm run dev 2>&1 | tee server.log &

SERVER_PID=$!

echo "✅ Server started with PID $SERVER_PID"
echo "🌐 Open http://localhost:3000 to view the app"
echo "👉 Press Ctrl+C to stop the server"

# Function to handle script exit
cleanup() {
    echo ""
    echo "🛑 Stopping server..."
    kill $SERVER_PID
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Wait for the server process
wait $SERVER_PID
