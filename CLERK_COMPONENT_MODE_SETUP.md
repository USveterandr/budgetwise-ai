# Clerk Component Mode Setup Guide

## Problem
Your Clerk Dashboard shows hosted pages at `accounts.budgetwise.isaac-trinidad.com`, but your app uses custom authentication pages (Component Mode). This mismatch causes verification issues.

## Current Setup

### App Configuration (Component Mode)
Your app has custom pages:
- Sign up: `app/(auth)/signup.tsx`
- Login: `app/(auth)/login.tsx`
- Verify Email: `app/(auth)/verify-email.tsx`
- Forgot Password: `app/(auth)/forgot-password.tsx`
- Reset Password: `app/(auth)/reset-password.tsx`

### Clerk Dashboard Configuration (Hosted Pages)
Clerk is showing:
- Sign in: `https://accounts.budgetwise.isaac-trinidad.com/sign-in`
- Sign up: `https://accounts.budgetwise.isaac-trinidad.com/sign-up`
- User profile: `https://accounts.budgetwise.isaac-trinidad.com/user`

## ⚠️ This is a Configuration Mismatch!

You need to configure Clerk to work with your **custom pages** (Component Mode).

## Solution: Configure Clerk for Component Mode

### Step 1: Access Clerk Dashboard
1. Go to: https://dashboard.clerk.com/
2. Select your **BudgetWise AI** application

### Step 2: Configure Paths/URLs

Navigate to: **User & Authentication** → **Email, Phone, Username** → **Settings**

Or look for: **Paths** or **URLs** in the sidebar

You need to configure these URLs:

#### For Development (localhost):
```
Home URL: http://localhost:8081
Sign in URL: http://localhost:8081/(auth)/login
Sign up URL: http://localhost:8081/(auth)/signup
After sign in URL: http://localhost:8081/(tabs)
After sign up URL: http://localhost:8081/(tabs)
User profile URL: http://localhost:8081/(auth)/profile
After sign out URL: http://localhost:8081
```

#### For Production:
```
Home URL: https://budgetwise.isaac-trinidad.com
Sign in URL: https://budgetwise.isaac-trinidad.com/(auth)/login
Sign up URL: https://budgetwise.isaac-trinidad.com/(auth)/signup
After sign in URL: https://budgetwise.isaac-trinidad.com/(tabs)
After sign up URL: https://budgetwise.isaac-trinidad.com/(tabs)
User profile URL: https://budgetwise.isaac-trinidad.com/(auth)/profile
After sign out URL: https://budgetwise.isaac-trinidad.com
```

### Step 3: Disable Hosted Pages (if applicable)

Look for settings like:
- **Component Development Mode** ← Enable this
- **Hosted Pages** ← Disable this
- **Redirect Mode** ← Disable this

The hosted pages at `accounts.budgetwise.isaac-trinidad.com` should NOT be used when you have custom pages.

### Step 4: Configure Allowed Origins

In **Domains** or **CORS** settings, add:
```
http://localhost:8081
http://127.0.0.1:8081
https://budgetwise.isaac-trinidad.com
```

### Step 5: Email Verification Settings

Navigate to: **User & Authentication** → **Email, Phone, Username**

Ensure:
- ✅ Email verification is **enabled**
- ✅ Verification method: **Code** (not just magic link)
- ✅ Allow email codes in development mode

### Step 6: Attack Protection

Navigate to: **User & Authentication** → **Attack Protection**

For development:
- Set CAPTCHA to **"Invisible"** or **"Disabled for development"**
- Whitelist `localhost` and `127.0.0.1`
- Allow email verification codes without additional challenges

## What Changed vs What Should Happen

### Before (Hosted Pages - Wrong for your app):
```
User visits app → Redirected to accounts.budgetwise.isaac-trinidad.com → 
Signs up on Clerk hosted page → Redirected back to app
```

### After (Component Mode - Correct):
```
User visits app → Sees custom signup page in app → 
Signs up using your UI → Clerk handles auth in background → 
Stays in app throughout
```

## Testing After Configuration

1. **Clear all browser cache and cookies**
2. **Restart dev server**: 
   ```bash
   pkill -f "npm run web"
   npm run web
   ```
3. **Open fresh browser**: http://localhost:8081
4. **Try signup** with a new email
5. **Should see**:
   - Your custom signup page (not Clerk's hosted page)
   - Email verification code sent
   - No "Additional verification required" error
   - Successful login and redirect to dashboard

## Verification Checklist

After configuring Clerk Dashboard:

- [ ] Clerk Dashboard shows localhost URLs for sign-in/sign-up
- [ ] Attack protection allows localhost without CAPTCHA
- [ ] Email verification codes are enabled
- [ ] Component mode is enabled (not hosted pages)
- [ ] CORS/Allowed origins includes localhost
- [ ] Dev server restarted and browser cache cleared
- [ ] Signup works without "Additional verification required" error

## Additional Notes

- **Component Mode** = Custom UI in your app (what you have)
- **Hosted Pages Mode** = Clerk's hosted UI (what Dashboard is showing)
- You MUST use Component Mode since you built custom auth pages
- The `accounts.budgetwise.isaac-trinidad.com` URLs should be ignored/disabled
