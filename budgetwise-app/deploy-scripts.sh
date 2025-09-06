#!/bin/bash

# Production deployment script for BudgetWise application

set -e  # Exit on any error

echo "Starting BudgetWise production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

echo "1. Building the client application..."
cd client
npm ci --only=production
npm run build
cd ..

echo "2. Preparing server dependencies..."
cd server
npm ci --only=production
cd ..

echo "3. Building Docker images..."
docker build -t budgetwise-frontend -f Dockerfile.client .
docker build -t budgetwise-backend -f Dockerfile.server .

echo "4. Starting services with docker-compose..."
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment completed successfully!"
echo "Frontend available at http://localhost:3000"
echo "Backend API available at http://localhost:3001"