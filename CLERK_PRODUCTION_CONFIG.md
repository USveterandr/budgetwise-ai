# Clerk Production Instance Configuration

## Setup Overview

This app uses **Clerk's Production Instance** for both development and production deployment.

## ✅ Clerk Dashboard Configuration

### Paths Configuration
**Navigate to:** Developers → Paths

#### Application Paths:

| Setting | Value |
|---------|-------|
| Home URL | `https://budgetwise.isaac-trinidad.com` |
| Unauthorized sign in URL | `https://budgetwise.isaac-trinidad.com/login` |

#### Component Paths:

**`<SignIn />`:**
- ✅ Sign-in page on application domain: `https://budgetwise.isaac-trinidad.com/login`
- ❌ Sign-in page on Account Portal (UNCHECK THIS)

**`<SignUp />`:**
- ✅ Sign-up page on application domain: `https://budgetwise.isaac-trinidad.com/signup`
- ❌ Sign-up page on Account Portal (UNCHECK THIS)

**Signing Out:**
- ✅ Path on application domain: `https://budgetwise.isaac-trinidad.com`
- ❌ Sign-in page on Account Portal (UNCHECK THIS)

---

## 🔒 Attack Protection for Development

**Navigate to:** User & Authentication → Attack Protection

Since you're using the production instance for localhost development, configure:

**Option 1: Invisible CAPTCHA (Recommended)**
- Set CAPTCHA to **"Invisible"** mode
- This works for both localhost AND production
- Less intrusive for users

**Option 2: Development Allowlist**
- Add `localhost` and `127.0.0.1` to the allowlist
- This bypasses CAPTCHA for local development
- Keep CAPTCHA enabled for production domain

---

## 🌐 Allowed Origins (CORS)

**Navigate to:** Developers → Domains

Add these allowed origins:
```
http://localhost:8081
http://127.0.0.1:8081
https://budgetwise.isaac-trinidad.com
```

---

## 📧 Email Verification Settings

**Navigate to:** User & Authentication → Email, Phone, Username

Ensure:
- ✅ Email verification enabled
- ✅ Verification method: **Email code** (not just magic links)
- ✅ Allow email codes

---

## 🎯 How It Works

### Development (localhost:8081):
1. User visits `http://localhost:8081`
2. Clicks "Sign Up"
3. Sees custom signup page at `http://localhost:8081/signup`
4. Clerk processes authentication
5. Redirects to `http://localhost:8081/(tabs)/dashboard`

### Production (budgetwise.isaac-trinidad.com):
1. User visits `https://budgetwise.isaac-trinidad.com`
2. Clicks "Sign Up"
3. Sees custom signup page at `https://budgetwise.isaac-trinidad.com/signup`
4. Clerk processes authentication
5. Redirects to `https://budgetwise.isaac-trinidad.com/(tabs)/dashboard`

**Same code, same Clerk instance, works everywhere!**

---

## 🚫 What NOT to Use

❌ Do NOT use Account Portal URLs:
- ❌ `https://accounts.budgetwise.isaac-trinidad.com/sign-in`
- ❌ `https://accounts.budgetwise.isaac-trinidad.com/sign-up`

These are for **hosted pages mode**, which you're NOT using since you have custom authentication pages.

---

## ✅ Testing Checklist

After configuring the Dashboard:

1. **Clear browser cache and cookies**
2. **Restart dev server** (if needed)
3. **Open:** `http://localhost:8081`
4. **Test signup:**
   - Should see YOUR custom signup page
   - Should receive email verification code
   - Should NOT see "Additional verification required" error
   - Should successfully verify and login
5. **Success indicator:** No CAPTCHA challenges, smooth authentication flow

---

## 📝 Production Deployment Notes

When deploying to production:
- ✅ No Clerk configuration changes needed (already set up)
- ✅ Make sure production domain matches Dashboard settings
- ✅ Ensure SSL/HTTPS is properly configured
- ✅ Consider re-enabling stricter Attack Protection for production

---

## Current App Routes

Your custom authentication pages:
```
/login              → app/(auth)/login.tsx
/signup             → app/(auth)/signup.tsx
/verify-email       → app/(auth)/verify-email.tsx
/forgot-password    → app/(auth)/forgot-password.tsx
/reset-password     → app/(auth)/reset-password.tsx
/(tabs)/dashboard   → app/(tabs)/dashboard.tsx
```

Note: `(auth)` and `(tabs)` are Expo Router route groups and don't appear in URLs.
