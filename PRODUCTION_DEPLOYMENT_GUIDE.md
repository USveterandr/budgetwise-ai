# Production Deployment Guide

This guide provides instructions for deploying the BudgetWise AI application to production with your actual API keys.

## Environment Variables Setup

Before deploying to production, you need to replace the placeholder values in your `.env` file with your actual API keys.

### 1. Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Create a new application or select an existing one
3. Navigate to "API Keys" section
4. Copy the following keys:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
```

### 2. Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key or use an existing one
3. Copy your API key:

```
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```

### 3. Backend (Cloudflare Worker) Variables

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** -> **budgetwise-api** -> **Settings** -> **Variables**
3. Add the following:

- `CLERK_SECRET_KEY`: `sk_live_...`
- `AUTHORIZED_PARTIES`: `["https://budgetwise-ai.pages.dev", "https://clerk.budgetwise.isaac-trinidad.com"]` (JSON string)
- `CLERK_ISSUER`: `https://your-production-clerk-issuer.com`
- `CLERK_JWKS_URL`: `https://your-production-clerk-issuer.com/.well-known/jwks.json`

### 4. Final .env Configuration

## Deployment Steps

### For Local Development

1. Update your `.env` file with actual keys
2. Run the application:

```bash
npm install
npx expo start
```

### For Production Build

1. Update your `.env` file with actual keys
2. Create production builds:

```bash
# For iOS
eas build -p ios --profile production

# For Android
eas build -p android --profile production
```

## Security Best Practices

1. **Never commit actual API keys to version control**
   - Always use placeholder values in publicly shared repositories
   - Use environment variables for sensitive data

2. **Use separate keys for development and production**
   - Create separate Clerk applications for dev and prod
   - Use different Gemini API keys for different environments

3. **Regularly rotate your API keys**
   - Update keys periodically for security
   - Monitor API usage in your dashboards

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Verify your Clerk keys are correct
2. Check that your Clerk application is properly configured
3. Ensure redirect URLs are correctly set in Clerk dashboard

### AI Features Not Working

If AI features aren't working:

1. Verify your Gemini API key is valid
2. Check that the key has proper permissions
3. Ensure you haven't exceeded usage quotas

### Environment Variables Not Loading

If environment variables aren't being loaded:

1. Restart your development server
2. Verify the `.env` file is in the root directory
3. Check for proper formatting (no spaces around `=`)

For additional help, refer to:
- [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md)
- [README.md](README.md)