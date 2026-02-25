#!/bin/bash
# Initialize the agent harness project

set -e

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Running tests..."
npm test

echo "Setup complete!"
