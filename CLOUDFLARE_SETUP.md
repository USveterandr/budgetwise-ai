# Cloudflare Setup Guide

This guide explains how to set up Cloudflare D1 and R2 for the BudgetWise AI application.

## Prerequisites

1. Cloudflare account
2. Wrangler CLI installed (`npm install -g wrangler`)

## Setting up Cloudflare D1 (Database)

1. Create a new D1 database:
   ```bash
   wrangler d1 create budgetwise-db
   ```

2. Save the database credentials provided in the output.

3. Apply the database schema:
   ```bash
   wrangler d1 execute budgetwise-db --file=./schema.sql
   ```

4. Update your environment variables in `.env`:
   ```
   D1_DATABASE_URL=your-d1-database-url
   ```

## Setting up Cloudflare R2 (Storage)

1. Create a new R2 bucket:
   ```bash
   wrangler r2 bucket create budgetwise-storage
   ```

2. Generate an API token with R2 permissions in the Cloudflare dashboard.

3. Update your environment variables in `.env`:
   ```
   R2_ACCESS_KEY_ID=your-access-key-id
   R2_SECRET_ACCESS_KEY=your-secret-access-key
   R2_BUCKET_NAME=budgetwise-storage
   R2_ENDPOINT=your-r2-endpoint
   ```

## Deploying with Cloudflare Pages

1. Install the Cloudflare Pages adapter:
   ```bash
   npm install @cloudflare/next-on-pages
   ```

2. Add the build script to your `package.json`:
   ```json
   {
     "scripts": {
       "build:cf": "next-on-pages"
     }
   }
   ```

3. Deploy to Cloudflare Pages:
   ```bash
   npm run build:cf
   wrangler pages deploy .vercel/output/static --project-name=budgetwise-ai
   ```

## Environment Variables

Make sure to set the following environment variables in your Cloudflare Pages project:

- `D1_DATABASE_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `JWT_SECRET`

## Local Development

For local development, create a `.dev.vars` file with your environment variables:

```
D1_DATABASE_URL=your-d1-database-url
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=budgetwise-storage
R2_ENDPOINT=your-r2-endpoint
OPENAI_API_KEY=your-openai-api-key
```