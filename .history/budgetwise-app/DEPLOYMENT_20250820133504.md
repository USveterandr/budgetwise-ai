# Cloudflare Deployment Guide

This guide explains how to deploy the BudgetWise application to Cloudflare Pages and Workers.

## Architecture Overview

The application consists of two main parts:

1. **Client (React App)** - Deployed to Cloudflare Pages
2. **Server (API Functions)** - Deployed to Cloudflare Workers

## Prerequisites

1. Cloudflare account
2. Node.js 20+
3. npm or yarn

## Environment Variables Setup

### Cloudflare Dashboard Configuration

You need to set the following environment variables in your Cloudflare dashboard:

#### For Cloudflare Pages (Client)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

#### For Cloudflare Workers (Server)
- `SUPABASE_URL` - Your Supabase service role URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_POSTGRES_URL` - Your Supabase database connection string
- `R2_BUCKET_NAME` - Your R2 bucket name
- `R2_BUCKET_REGION` - Your R2 bucket region
- `R2_BUCKET_API` - Your R2 bucket API endpoint

## GitHub Repository Setup

1. Push your code to a GitHub repository
2. Go to Cloudflare Dashboard → Pages → Create project
3. Connect your GitHub repository
4. Configure the following settings:

### Pages Configuration
- **Build command**: `cd budgetwise-app/client && npm install && npm run build`
- **Build output directory**: `budgetwise-app/client/build`
- **Root directory**: `budgetwise-app/client`

### Workers Configuration
- **Build command**: `cd budgetwise-app && npm install && npm run build`
- **Wrangler configuration**: `wrangler.toml`

## GitHub Actions Secrets

Configure the following secrets in your GitHub repository settings:

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## Manual Deployment

### Client (Cloudflare Pages)

```bash
cd budgetwise-app/client
npm install
npm run build
```

Then deploy using the Cloudflare Pages dashboard or CLI.

### Server (Cloudflare Workers)

```bash
cd budgetwise-app
npm install
npm run deploy
```

## Development

### Client Development

```bash
cd budgetwise-app/client
npm start
```

### Server Development

```bash
cd budgetwise-app
npm run dev
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed
2. **Environment Variables**: Verify all required environment variables are set
3. **Supabase Connection**: Check your Supabase project configuration
4. **R2 Bucket**: Ensure your R2 bucket exists and is properly configured

### Debugging

- Check Cloudflare Pages/Workers logs in the dashboard
- Use `wrangler tail` to view worker logs
- Verify environment variables are correctly set

## Production Deployment

The GitHub Actions workflow will automatically deploy to production when code is pushed to the `main` branch.

### Staging Deployment

To deploy to staging, push to the `develop` branch or use:

```bash
cd budgetwise-app
npm run deploy:staging
```

## Security Notes

- Never commit sensitive environment variables to your repository
- Use Cloudflare Secrets for sensitive data
- Regularly rotate your API keys and tokens
- Enable required authentication in your Cloudflare dashboard

## Support

For deployment issues:
1. Check Cloudflare status page
2. Review Cloudflare documentation
3. Open an issue in the repository with deployment logs