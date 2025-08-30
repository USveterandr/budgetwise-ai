#!/bin/bash

# BudgetWise Build Script for Cloudflare Pages
# Forces npm usage and builds the application

set -e

echo "🚀 Starting BudgetWise build process..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Ensure we're using npm, not yarn
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false
export CI=true

# Clean any yarn.lock files that might interfere
echo "🧹 Cleaning yarn lockfiles..."
find . -name "yarn.lock" -type f -delete 2>/dev/null || true

echo "📦 Installing root dependencies..."
npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund

echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --legacy-peer-deps --no-audit --no-fund 2>/dev/null || npm install --legacy-peer-deps --no-audit --no-fund

echo "🏗️ Building React application..."
GENERATE_SOURCEMAP=false npm run build

echo "📄 Copying Cloudflare configuration files..."
cd ..
if [ -f "_headers" ]; then
    cp _headers frontend/build/
    echo "✅ Copied _headers"
fi

if [ -f "_redirects" ]; then
    cp _redirects frontend/build/
    echo "✅ Copied _redirects"
fi

echo "🔍 Verifying build output..."
ls -la frontend/build/

echo "✅ Build completed successfully!"
echo "📁 Output directory: frontend/build"