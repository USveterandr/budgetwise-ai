#!/bin/bash

# Ultra-simple Cloudflare Pages build script
# No dependencies on existing package managers

set -e

echo "🚀 BudgetWise - Simple Build Process"

# Completely remove any yarn traces
rm -rf yarn.lock .yarn .yarnrc* frontend/yarn.lock frontend/.yarn frontend/.yarnrc* 2>/dev/null || true
find . -name "yarn.lock" -delete 2>/dev/null || true

# Force npm usage
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false
export CI=true

# Install root level (minimal)
echo "📦 Installing minimal root dependencies..."
npm install --no-package-lock --legacy-peer-deps --no-audit --no-fund || true

# Install and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps --no-audit --no-fund

echo "🏗️ Building frontend..."
GENERATE_SOURCEMAP=false npm run build

# Copy static files
echo "📄 Copying static files..."
cd ..
cp _headers frontend/build/ 2>/dev/null || echo "No _headers file"
cp _redirects frontend/build/ 2>/dev/null || echo "No _redirects file"

echo "✅ Build complete - frontend/build ready"