#!/bin/bash

# init.sh - Development server startup and e2e test runner
# Works on macOS and Linux

set -e

# Configuration
DEFAULT_PORT=3000
PORT="${PORT:-$DEFAULT_PORT}"
MAX_WAIT_SECONDS=30
DEV_SERVER_PID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    if [[ -n "$DEV_SERVER_PID" ]] && kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
        log_info "Stopping dev server (PID: $DEV_SERVER_PID)"
        kill "$DEV_SERVER_PID" 2>/dev/null || true
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Check if port is in use
check_port() {
    local port=$1
    
    if command -v lsof &> /dev/null; then
        lsof -i :$port &>/dev/null
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$port "
    elif command -v ss &> /dev/null; then
        ss -tuln | grep -q ":$port "
    else
        # Fallback: try to connect
        (echo >/dev/tcp/localhost/$port) 2>/dev/null
    fi
    return $?
}

# Wait for server to be ready
wait_for_server() {
    local port=$1
    local max_wait=$2
    local elapsed=0
    
    log_info "Waiting for server on port $port..."
    
    while [ $elapsed -lt $max_wait ]; do
        if check_port $port; then
            # Additional check: try to make a request
            if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port" 2>/dev/null | grep -q "200\|301\|302"; then
                log_info "Server is ready!"
                return 0
            fi
        fi
        sleep 1
        elapsed=$((elapsed + 1))
        echo -n "."
    done
    
    echo ""
    log_error "Server did not become ready within ${max_wait} seconds"
    return 1
}

# Start development server
start_dev_server() {
    log_info "Starting development server..."
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install Node.js and npm."
        exit 1
    fi
    
    # Check if port is already in use
    if check_port $PORT; then
        log_warn "Port $PORT is already in use. Attempting to continue..."
    fi
    
    # Start the dev server in background
    npm run dev &
    DEV_SERVER_PID=$!
    
    log_info "Dev server started with PID: $DEV_SERVER_PID"
}

# Run e2e tests
run_e2e_tests() {
    log_info "Running e2e tests..."
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install Node.js and npm."
        exit 1
    fi
    
    # Try different test commands
    if npm run test:e2e &> /dev/null; then
        npm run test:e2e
    elif npm run test:e2e:ci &> /dev/null; then
        npm run test:e2e:ci
    elif npm run cypress run &> /dev/null; then
        npm run cypress run
    else
        log_warn "No e2e test command found. Skipping tests."
        return 0
    fi
    
    local test_exit_code=$?
    
    if [ $test_exit_code -eq 0 ]; then
        log_info "E2e tests passed!"
    else
        log_error "E2e tests failed with exit code: $test_exit_code"
    fi
    
    return $test_exit_code
}

# Main execution
main() {
    log_info "Starting init.sh..."
    log_info "Using port: $PORT"
    
    # Build the project first
    log_info "Building project..."
    npm run build
    
    # Start dev server
    start_dev_server
    
    # Wait for server to be ready
    if ! wait_for_server $PORT $MAX_WAIT_SECONDS; then
        log_error "Failed to start server"
        exit 1
    fi
    
    # Run e2e tests
    run_e2e_tests
    test_exit_code=$?
    
    if [ $test_exit_code -eq 0 ]; then
        log_info "All tasks completed successfully!"
    else
        log_error "Tasks failed with exit code: $test_exit_code"
    fi
    
    exit $test_exit_code
}

# Run main function
main "$@"
