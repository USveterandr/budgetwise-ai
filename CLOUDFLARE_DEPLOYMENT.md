# BudgetWise - Cloudflare Deployment Guide

## 🚀 Deploying to Cloudflare Pages

### Prerequisites
- Cloudflare account
- GitHub repository with your code
- Domain (optional, Cloudflare provides a subdomain)

### Deployment Options

#### Option 1: Cloudflare Pages Dashboard (Recommended)

1. **Connect Repository**
   - Go to Cloudflare Dashboard > Pages
   - Click "Create a project"
   - Connect your GitHub repository: `https://github.com/USveterandr/budgetwise-ai`

2. **Build Configuration**
   ```
   Framework preset: Create React App
   Build command: npm run build
   Build output directory: frontend/build
   Root directory: (leave blank)
   Node.js version: 18
   ```

3. **Environment Variables**
   - Add in Pages settings:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-api.com
   NODE_ENV=production
   ```

#### Option 2: Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   # Build the project
   npm run build
   
   # Deploy to Cloudflare Pages
   wrangler pages deploy frontend/build --project-name=budgetwise-app
   ```

### Backend Deployment Options

Since BudgetWise uses FastAPI backend, you have several options:

#### Option 1: Cloudflare Workers (Serverless)
- Convert FastAPI routes to Cloudflare Workers
- Use Cloudflare D1 for database
- Use Cloudflare R2 for file storage

#### Option 2: External Backend Services
- **Recommended**: Deploy FastAPI to Railway, Render, or Vercel
- Update `REACT_APP_BACKEND_URL` to point to your backend
- Keep MongoDB or migrate to Supabase PostgreSQL

#### Option 3: Supabase Backend
- Replace FastAPI with Supabase Edge Functions
- Use Supabase database and auth
- Update frontend to use Supabase SDK

### Database Migration to Cloudflare D1

If you want to use Cloudflare D1 (SQLite):

1. **Create D1 Database**
   ```bash
   wrangler d1 create budgetwise-db
   ```

2. **Update wrangler.toml**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "budgetwise-db"
   database_id = "your-database-id"
   ```

3. **Convert MongoDB schemas to SQL**
   - Users table
   - Expenses table
   - Budgets table
   - Investments table
   - Achievements table

### File Storage with Cloudflare R2

For file uploads (future feature):

1. **Create R2 Bucket**
   ```bash
   wrangler r2 bucket create budgetwise-files
   ```

2. **Update wrangler.toml**
   ```toml
   [[r2_buckets]]
   binding = "FILES"
   bucket_name = "budgetwise-files"
   ```

### Custom Domain Setup

1. **Add Domain in Cloudflare Pages**
   - Go to Pages > Your Project > Custom domains
   - Add your domain (e.g., budgetwise.com)

2. **Update DNS**
   - Cloudflare will provide CNAME records
   - Update your domain's DNS settings

### Performance Optimizations

1. **Enable Cloudflare Features**
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - Browser Cache TTL
   - Always Online

2. **Frontend Optimizations**
   - Code splitting already enabled (Create React App)
   - Service Worker for caching
   - Image optimization

### Security Configuration

1. **Headers (already configured in _headers file)**
   - Security headers
   - CORS configuration
   - Cache policies

2. **Environment Variables**
   - Never expose API keys in frontend
   - Use Cloudflare Workers for sensitive operations

### Monitoring & Analytics

1. **Cloudflare Analytics**
   - Built-in page views and performance metrics
   - Core Web Vitals tracking

2. **Error Tracking**
   - Integrate Sentry or LogRocket
   - Monitor API errors and user issues

### Cost Estimation

**Cloudflare Pages (Free Tier)**
- 1 build per deployment
- 500 builds/month
- Unlimited bandwidth
- Custom domains included

**Potential Costs**
- Functions (if using Workers): $0.50/million requests
- D1: $0.75/million reads, $4.50/million writes
- R2: $0.015/GB storage

### Troubleshooting

**Common Issues:**

1. **Build Fails**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are in package.json
   - Check build output directory path

2. **Routing Issues**
   - Ensure _redirects file is properly configured
   - Verify SPA routing setup

3. **API Errors**
   - Check REACT_APP_BACKEND_URL environment variable
   - Verify CORS configuration on backend
   - Check network requests in browser DevTools

### Next Steps After Deployment

1. **Test All Features**
   - User registration/login
   - Expense tracking
   - Budget management
   - Achievements system

2. **Set Up Monitoring**
   - Performance monitoring
   - Error tracking
   - User analytics

3. **Implement CI/CD**
   - Automatic deployments on git push
   - Preview deployments for pull requests
   - Staging environment setup

For support, check the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/) or create an issue in the repository.