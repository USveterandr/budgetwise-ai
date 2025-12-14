# Fix for "Unable to complete registration" Error

This document provides a step-by-step solution for the "Unable to complete registration. Please try signing up again." error.

## Root Cause Analysis

The error is likely caused by one of these issues:

1. **Incorrect or missing API keys** in the `.env` file
2. **Misconfigured Clerk application** in the Clerk dashboard
3. **Network connectivity issues** preventing communication with Clerk services
4. **Environment variable loading problems**

## Immediate Fix Steps

### Step 1: Verify Environment Variables

Check your `.env` file to ensure it contains valid API keys:

```env
# Clerk API Keys (get from https://dashboard.clerk.dev/)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY

# Google Gemini API Key (get from https://aistudio.google.com/)
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```

### Step 2: Get Actual API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application or create a new one
3. Navigate to "API Keys" section
4. Copy both the Publishable Key and Secret Key
5. Replace the placeholder values in your `.env` file

### Step 3: Restart Development Server

After updating the API keys:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npx expo start
```

### Step 4: Test Signup Again

Try creating a new account with a different email address.

## Advanced Troubleshooting

### If the Error Persists

1. **Check Clerk Dashboard Configuration**
   - Ensure your application is not in maintenance mode
   - Verify redirect URLs are properly configured
   - Check that email templates are properly set up

2. **Enable Debug Mode**
   Add these lines to your `.env` file:
   ```env
   EXPO_DEBUG=true
   CLERK_DEBUG=true
   ```

3. **Check Console Logs**
   Look for detailed error messages in the console when the error occurs.

4. **Network Issues**
   - Test connectivity to clerk.dev
   - Check if corporate firewalls are blocking requests
   - Try using a different network connection

## Common Solutions

### Solution 1: Fresh Environment Setup

1. Delete the existing `.env` file
2. Create a new `.env` file with correct API keys
3. Restart the development server completely
4. Try signing up with a new email

### Solution 2: Clerk Application Reset

1. Go to Clerk Dashboard
2. Create a new application
3. Update your `.env` file with the new application's API keys
4. Restart development server

### Solution 3: Clear Application Data

If testing on a physical device:
1. Uninstall the app completely
2. Clear any cached data
3. Reinstall and try again

## Prevention Tips

1. **Always use valid API keys** - Placeholder values will not work
2. **Keep keys secure** - Never commit actual API keys to version control
3. **Regular key rotation** - Update keys periodically for security
4. **Environment separation** - Use different keys for development and production

## Support Resources

- [Clerk Documentation](https://clerk.dev/docs)
- [Authentication Troubleshooting Guide](AUTHENTICATION_TROUBLESHOOTING.md)
- [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)

If none of these solutions work, please:
1. Take a screenshot of the error
2. Copy the full console logs
3. Create an issue on GitHub with these details