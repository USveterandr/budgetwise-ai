#!/bin/bash

# BudgetWise Build Script for Cloudflare Pages
# AGGRESSIVELY forces npm usage and prevents yarn

set -e

echo "🚀 Starting BudgetWise build process..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# AGGRESSIVE YARN PREVENTION
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false
export CI=true
export YARN_IGNORE_PATH=1
export NPM_CONFIG_PACKAGE_LOCK=true

# Remove ALL yarn artifacts
echo "🧹 Aggressively removing yarn artifacts..."
rm -rf yarn.lock .yarn .yarnrc .yarnrc.yml 2>/dev/null || true
rm -rf frontend/yarn.lock frontend/.yarn frontend/.yarnrc frontend/.yarnrc.yml 2>/dev/null || true
find . -name "yarn.lock" -type f -delete 2>/dev/null || true
find . -name ".yarnrc*" -type f -delete 2>/dev/null || true

# Force create package-lock.json to ensure npm detection  
echo "📦 Ensuring npm package lock exists..."
if [ ! -f "package-lock.json" ]; then
    npm install --package-lock-only --no-audit --no-fund
fi

echo "📦 Installing root dependencies with npm..."
npm ci --no-audit --no-fund --legacy-peer-deps 2>/dev/null || npm install --no-audit --no-fund --legacy-peer-deps

echo "📦 Installing frontend dependencies with npm..."
cd frontend

# Ensure frontend also has package-lock.json
if [ ! -f "package-lock.json" ]; then
    npm install --package-lock-only --legacy-peer-deps --no-audit --no-fund
fi

npm ci --legacy-peer-deps --no-audit --no-fund 2>/dev/null || npm install --legacy-peer-deps --no-audit --no-fund

echo "🏗️ Building React application with npm..."
GENERATE_SOURCEMAP=false NODE_ENV=production npm run build

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