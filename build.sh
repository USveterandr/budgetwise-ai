#!/bin/bash

# BudgetWise Build Script for Cloudflare Pages
# Forces npm usage and builds the application

set -e

echo "🚀 Starting BudgetWise build process..."

# Ensure we're using npm, not yarn
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false

# Clean any yarn.lock files that might interfere
find . -name "yarn.lock" -type f -delete 2>/dev/null || true

echo "📦 Installing dependencies with npm..."

# Install root dependencies if needed
if [ -f "package.json" ]; then
    npm install --no-fund --no-audit
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps --no-fund --no-audit

echo "🏗️ Building frontend..."
npm run build

echo "📄 Copying static files..."
cd ..
cp _headers frontend/build/ 2>/dev/null || true
cp _redirects frontend/build/ 2>/dev/null || true

echo "✅ Build completed successfully!"
echo "📁 Output directory: frontend/build"