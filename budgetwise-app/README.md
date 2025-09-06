# BudgetWise Application

BudgetWise is a comprehensive financial management application that helps users track expenses, manage budgets, and achieve financial goals through AI-powered insights.

## Features

- Expense tracking and categorization
- Budget planning and monitoring
- Financial insights and analytics
- Subscription management
- AI-powered financial recommendations

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase account
- Stripe account (for payment processing)

## Development Setup

1. Install dependencies:
   ```
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

2. Configure environment variables:
   - Copy `.env.local` to `.env` and update values
   - Update `client/.env` with appropriate values

3. Start development servers:
   ```
   # Start backend
   cd server && npm run dev
   
   # Start frontend (in another terminal)
   cd client && npm start
   ```

## Production Deployment

### Using Docker (Recommended)

1. Configure production environment variables:
   - Update `.env.production` with your production values
   - Update `client/.env.production` with your production values

2. Build and deploy using Docker Compose:
   ```
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. Build the client application:
   ```
   cd client
   npm ci --only=production
   npm run build
   ```

2. Start the server:
   ```
   cd ../server
   npm ci --only=production
   NODE_ENV=production node server.js
   ```

### Environment Variables

#### Backend (.env.production)
- `NODE_ENV` - Set to "production"
- `PORT` - Port for the server to listen on
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `CORS_ORIGIN` - Your frontend domain

#### Frontend (client/.env.production)
- `REACT_APP_API_URL` - Your backend API URL
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Health Checks

Both frontend and backend services include health check endpoints:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/health`

## Monitoring

The application includes built-in logging and health monitoring. Check Docker logs for detailed information:
```
docker-compose -f docker-compose.prod.yml logs
```

## Support

For issues with deployment or configuration, please check:
1. Environment variables are correctly set
2. Supabase credentials are valid
3. Docker and Docker Compose are properly installed
4. Required ports are available