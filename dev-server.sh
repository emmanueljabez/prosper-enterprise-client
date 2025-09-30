#!/bin/bash

# Development server management script for myProsperV2
# This script helps manage the Nuxt development server and troubleshoot hot reload issues

echo "🚀 MyProsperV2 Development Server Manager"
echo "========================================"

# Function to kill existing Nuxt processes
kill_existing_processes() {
    echo "🔄 Checking for existing Nuxt processes..."
    NUXT_PIDS=$(ps aux | grep -E "nuxi.*_dev|nuxt.*dev" | grep -v grep | awk '{print $2}')
    
    if [ -n "$NUXT_PIDS" ]; then
        echo "⚠️  Found existing Nuxt processes: $NUXT_PIDS"
        echo "🔥 Killing existing processes..."
        echo $NUXT_PIDS | xargs kill -9 2>/dev/null || true
        sleep 2
        echo "✅ Existing processes terminated"
    else
        echo "✅ No existing Nuxt processes found"
    fi
}

# Function to check port availability
check_ports() {
    echo "🔍 Checking port availability..."
    
    if lsof -i :3000 >/dev/null 2>&1; then
        echo "⚠️  Port 3000 is in use:"
        lsof -i :3000
        echo "🔥 Attempting to free port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    if lsof -i :24678 >/dev/null 2>&1; then
        echo "⚠️  Port 24678 (HMR) is in use:"
        lsof -i :24678
        echo "🔥 Attempting to free port 24678..."
        lsof -ti:24678 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    echo "✅ Ports are now available"
}

# Function to clear caches
clear_caches() {
    echo "🧹 Clearing development caches..."
    
    # Clear Nuxt cache
    if [ -d ".nuxt" ]; then
        rm -rf .nuxt
        echo "✅ Cleared .nuxt directory"
    fi
    
    # Clear node_modules cache
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        echo "✅ Cleared node_modules cache"
    fi
    
    # Clear Vite cache
    if [ -d "node_modules/.vite" ]; then
        rm -rf node_modules/.vite
        echo "✅ Cleared Vite cache"
    fi
}

# Function to start development server
start_dev_server() {
    echo "🚀 Starting development server..."
    echo "📝 Server will be available at: http://localhost:3000"
    echo "🔥 Hot Module Replacement port: 24678"
    echo ""
    
    # Start the development server
    npm run dev
}

# Main execution
case "${1:-start}" in
    "clean")
        kill_existing_processes
        check_ports
        clear_caches
        echo "🎉 Clean up completed! Run './dev-server.sh' to start the server."
        ;;
    "restart")
        kill_existing_processes
        check_ports
        clear_caches
        start_dev_server
        ;;
    "start"|"")
        kill_existing_processes
        check_ports
        start_dev_server
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     - Kill existing processes and start dev server (default)"
        echo "  restart   - Clean everything and restart dev server"
        echo "  clean     - Clean caches and kill processes without starting"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0        # Start dev server"
        echo "  $0 clean  # Clean caches only"
        echo "  $0 restart # Full restart with cache clearing"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

