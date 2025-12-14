# Authentication Troubleshooting Guide

This guide provides solutions for common authentication issues in the BudgetWise AI application.

## Common Signup Issues

### "Unable to complete registration" Error

This error typically occurs when there are issues with the email verification flow or missing requirements during registration.

**Solutions:**

1. **Check Email Verification**
   - Ensure you're checking your spam/junk folder for the verification email
   - The email should come from "noreply@clerk.dev"
   - Click the verification link within 24 hours of receiving it

2. **Resend Verification Email**
   - If you didn't receive the email, go to the login screen
   - Enter your email and password
   - When prompted about unverified email, select "Resend verification email"

3. **Restart Registration Process**
   - If verification continues to fail, try registering with a different email
   - Clear app cache/data before attempting registration again

## Corrupted API Keys

### Environment Variables Issues

Ensure your `.env` file has the correct format:

```env
# Clerk API Keys (get from https://dashboard.clerk.dev/)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Google Gemini API Key (get from https://aistudio.google.com/)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important Notes:**
- Each environment variable should be on a single line
- No spaces around the `=` sign
- No quotes around the values
- Ensure there are no extra characters or line breaks

### "Invalid API Key" Errors

If you're getting invalid API key errors:

1. Check that your API keys are properly formatted in `.env`
2. Restart the development server after updating keys
3. Verify keys haven't expired (check Clerk/Gemini dashboards)
4. Ensure you're using live keys, not test keys, for production

## Email Verification Problems

### Verification Link Not Working

1. **Try Copy-Pasting the Link**
   - Copy the entire verification URL from the email
   - Paste it directly into your browser's address bar
   - Don't click the link if viewing in certain email clients that may modify URLs

2. **Check Browser Compatibility**
   - Try opening the verification link in a different browser
   - Disable browser extensions that might interfere with redirects

3. **Manual Verification**
   - If clicking the link doesn't work, try logging in
   - The app may detect an unverified account and offer verification options

## Google OAuth Issues

### "OAuth Sign In Failed" Error

1. **Check OAuth Configuration**
   - Ensure Google OAuth is properly configured in your Clerk dashboard
   - Verify the redirect URIs match your application's URLs

2. **Browser/Device Issues**
   - Try OAuth sign-in on a different browser or device
   - Ensure pop-ups aren't being blocked for your app

3. **Clear Credentials**
   - Remove saved Google credentials from your browser/device
   - Try signing in fresh without saved credentials

## Debugging Steps

### Enable Detailed Logging

Add these lines to your `.env` file to enable more detailed error logging:

```env
EXPO_DEBUG=true
CLERK_DEBUG=true
```

Then restart your development server.

### Check Network Connectivity

Authentication often fails due to network issues:
- Ensure stable internet connection
- Test connectivity to clerk.dev and googleapis.com
- Check if corporate firewalls are blocking requests

### Review Recent Changes

If authentication was working previously:
1. Check recent code changes that might affect auth flow
2. Verify no environment variables were accidentally modified
3. Confirm no breaking changes in dependencies after updates

## Contact Support

If none of these solutions work:

1. Check the [Clerk documentation](https://clerk.dev/docs) for known issues
2. Review the [GitHub repository issues](https://github.com/USveterandr/budgetwise-ai/issues)
3. Create a new issue with:
   - Detailed error description
   - Steps to reproduce
   - Screenshots if applicable
   - Environment information (device, OS, app version)