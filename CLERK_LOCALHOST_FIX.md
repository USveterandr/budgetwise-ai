# Clerk Localhost CAPTCHA/Verification Fix

## Problem
Getting "Additional verification required. Please check your email for a new code" error on localhost.

## Root Cause
Clerk's bot detection and security features are blocking requests from localhost, triggering additional verification challenges that fail.

## Solution Steps

### Option 1: Disable Bot Protection for Development (Recommended)

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/
2. **Select your application** (BudgetWise AI)
3. **Navigate to**: `User & Authentication` → `Attack Protection`
4. **Find**: Bot/CAPTCHA protection settings
5. **Action**: 
   - Disable CAPTCHA for development mode
   - OR whitelist `localhost` and `http://localhost:8081`
   - OR set to "Invisible" mode instead of "Always required"

### Option 2: Configure Email Verification Settings

1. **Go to**: `User & Authentication` → `Email, Phone, Username`
2. **Under Email Settings**:
   - ✅ Enable "Email verification"
   - ✅ Enable "Email verification codes" (not just magic links)
   - ✅ Set verification method to "Code" instead of "Link"
3. **Under Sign-up Settings**:
   - Set verification mode to "Development" or "Lenient" for localhost

### Option 3: Allowlist Development Domains

1. **Go to**: `Domains` or `Allowed Origins`
2. **Add these domains**:
   ```
   http://localhost:8081
   http://127.0.0.1:8081
   ```
3. **Mark them as**: Development/Test domains

### Option 4: Use Clerk's Development Mode

1. **Go to**: `Settings` → `General`
2. **Look for**: Development/Production toggle
3. **Enable**: Development mode (this relaxes security for testing)

### Option 5: Test Mode for Sign-ups

Some Clerk plans have a "Test Mode" specifically for development:
1. **Check**: `Settings` → `Production` vs `Development` instance
2. **Switch to**: Development instance if available
3. Development instances have relaxed security by default

## Verification Code Flow (Current Implementation)

Our current signup flow:
```typescript
// 1. User enters email/password
await signUp.create({ emailAddress, password });

// 2. Request verification code
await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

// 3. User receives code via email
// 4. User enters code on verify-email screen

// 5. Verify code
await signUp.attemptEmailAddressVerification({ code });
```

## Testing After Fix

1. **Clear browser cache** and cookies
2. **Restart the dev server**: `npm run web`
3. **Try signup** with a fresh email
4. **Check email** for verification code
5. **Enter code** on verification screen
6. **Should work** without "Additional verification required" error

## If Still Not Working

Check Clerk Dashboard → Logs to see:
- What verification method Clerk is expecting
- What errors are occurring server-side
- Whether the verification request is reaching Clerk

## Additional Notes

- Development mode should NEVER be enabled in production
- Once you deploy, use proper CAPTCHA/bot protection
- For production, ensure proper domain configuration with HTTPS
