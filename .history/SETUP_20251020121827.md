# BudgetWise AI Setup Guide

## Prerequisites
1. Node.js (version 18 or higher)
2. npm (version 8 or higher)
3. Cloudflare account
4. Domain name (optional, for custom domain setup)

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/USveterandr/budgetwise-ai.git
cd budgetwise-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your configuration:
   ```env
   # Cloudflare configuration
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   
   # Database configuration
   D1_DATABASE_ID=your_database_id
   
   # Storage configuration
   R2_BUCKET_NAME=your_bucket_name
   
   # AI API configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Payment configuration
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

### 4. Database Setup
1. Create a Cloudflare D1 database:
   ```bash
   npx wrangler d1 create budgetwise-db
   ```

2. Update your `wrangler.toml` with the database ID:
   ```toml
   [[ d1_databases ]]
   binding = "DB"
   database_name = "budgetwise-db"
   database_id = "your_database_id"
   ```

3. Apply the database schema:
   ```bash
   npx wrangler d1 execute budgetwise-db --file=./schema.sql
   ```

### 5. Storage Setup
1. Create a Cloudflare R2 bucket:
   ```bash
   npx wrangler r2 bucket create budgetwise-storage
   ```

2. Update your `wrangler.toml` with the bucket name:
   ```toml
   [[ r2_buckets ]]
   binding = "BUCKET"
   bucket_name = "budgetwise-storage"
   ```

### 6. Development
Start the development server:
```bash
npm run dev
```

### 7. Production Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   npm run deploy
   ```

## Custom Domain Setup
1. Log in to your Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your "budgetwise" project
4. In the project settings, find the "Custom domains" section
5. Click "Add custom domain"
6. Enter your domain and follow the DNS configuration instructions

## Administrator Setup
After deployment, create an administrator account:
1. Visit your deployed application
2. Sign up with the username "Isaactrinidadllc"
3. This account will automatically have administrator privileges

## Subscription Plans
The application offers three subscription plans:
1. Free - Basic features
2. Premium - Advanced features and AI insights
3. Pro - All features including personalized consultations

New users are required to select a plan during signup.