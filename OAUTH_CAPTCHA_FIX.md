# 🔧 Google OAuth CAPTCHA Error - SOLUTION

## ❌ The Problem

**Error Message:**
```
Failed to sign up with Google: The CAPTCHA failed to load. 
This may be due to an unsupported browser or a browser extension.
```

**Root Cause:**
Clerk uses Google's reCAPTCHA for bot protection during OAuth flows. On localhost, this CAPTCHA sometimes fails to load due to:
1. Browser extensions blocking it
2. localhost not being whitelisted for CAPTCHA
3. Clerk's CAPTCHA settings

---

## ✅ SOLUTION 1: Disable CAPTCHA in Clerk (Development Only)

### Step 1: Go to Clerk Dashboard

1. Open: https://dashboard.clerk.com
2. Select your "Budgetwise AI" project

### Step 2: Disable Bot Protection

1. In left sidebar, click **"User & Authentication"**
2. Click **"Attack Protection"**
3. Find **"Bot sign-up protection"**
4. **Toggle it OFF** for development

**⚠️ Important:** Re-enable this in production!

### Step 3: Test Again

1. Go to: http://localhost:8081/signup
2. Click "Sign Up with Google"
3. Should work now! ✅

---

## ✅ SOLUTION 2: Use Login Instead of Signup

The issue might be that you're trying to **sign up** with an email that already exists in Clerk.

### Try This:

1. Go to: http://localhost:8081/login (instead of signup)
2. Click "Sign In with Google"
3. This should work even with CAPTCHA

**Why this works:**
- Sign in doesn't require CAPTCHA
- If your Google account already exists in Clerk, you need to sign in, not sign up

---

## ✅ SOLUTION 3: Clear Browser Data

Sometimes cached CAPTCHA data causes issues.

### Steps:

1. **Clear cookies and cache:**
   - Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   - Select "Cookies and other site data"
   - Select "Cached images and files"
   - Click "Clear data"

2. **Disable browser extensions:**
   - Open in Incognito/Private mode
   - Or disable extensions temporarily

3. **Try again**

---

## ✅ SOLUTION 4: Update Clerk Settings

### Step 1: Check Allowed Origins

1. Go to Clerk Dashboard → **"Domains"**
2. Make sure `http://localhost:8081` is in allowed origins
3. Add if missing

### Step 2: Check OAuth Settings

1. Go to **"User & Authentication"** → **"Social Connections"** → **"Google"**
2. Scroll down to **"Advanced"**
3. Make sure **"Allow sign up"** is enabled
4. Make sure **"Require email verification"** is appropriate for your needs

---

## ✅ SOLUTION 5: Use a Different OAuth Strategy

Instead of the current implementation, we can use Clerk's redirect-based OAuth which is more reliable.

### Update Your Code:

I'll update the signup.tsx to use a more reliable OAuth method:

```typescript
const handleGoogleSignup = async () => {
  try {
    setLoading(true);
    setError('');
    
    console.log('Starting Google OAuth flow...');
    
    // Use redirect strategy instead of popup
    const result = await googleAuth({
      redirectUrl: window.location.origin + '/oauth-native-callback',
      redirectUrlComplete: window.location.origin + '/(tabs)/dashboard',
    });
    
    console.log('OAuth result:', result);
    
    if (result.createdSessionId) {
      await result.setActive!({ session: result.createdSessionId });
      console.log('Session activated, navigating to dashboard');
      router.replace('/(tabs)/dashboard');
    } else {
      console.log('No session created');
      setError('Sign up was not completed. Please try again.');
    }
  } catch (err: any) {
    console.error('Google sign up error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    
    if (err?.code === 'oauth_client_not_found' || err?.message?.includes('invalid_client')) {
      setError('Google sign up is not properly configured. Please contact support.');
    } else if (err?.message?.includes('access_denied') || err?.code === 'access_denied') {
      setError('Google sign up was cancelled.');
    } else if (err?.message?.includes('popup_closed') || err?.code === 'popup_closed') {
      setError('Sign up window was closed. Please try again.');
    } else if (err?.message?.includes('CAPTCHA')) {
      setError('CAPTCHA verification failed. Please try signing in instead, or use email signup.');
    } else {
      setError(`Failed to sign up with Google: ${err?.message || 'Unknown error'}. Please try email signup.`);
    }
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 RECOMMENDED FIX (Quickest)

**Do this RIGHT NOW:**

### Option A: Disable CAPTCHA (2 minutes)

1. Clerk Dashboard → Attack Protection → Turn OFF "Bot sign-up protection"
2. Test again
3. ✅ Should work!

### Option B: Use Login Instead (30 seconds)

1. Go to http://localhost:8081/login
2. Click "Sign In with Google"
3. ✅ Should work!

---

## 🔍 How to Verify Which Solution You Need

### Check if user already exists:

1. Go to Clerk Dashboard
2. Click "Users" in left sidebar
3. Search for your Google email
4. **If found:** Use Solution 2 (Login instead of Signup)
5. **If not found:** Use Solution 1 (Disable CAPTCHA)

---

## 📝 For Production

When deploying to production:

1. **Re-enable CAPTCHA** in Clerk Dashboard
2. **Add your production domain** to Clerk's allowed origins
3. **Test OAuth flow** on production domain
4. CAPTCHA should work properly on a real domain (not localhost)

---

## 🧪 Testing Steps

After applying the fix:

1. **Clear browser cache**
2. **Go to signup page:** http://localhost:8081/signup
3. **Click "Sign Up with Google"**
4. **Expected flow:**
   - Google login popup appears
   - Select your account
   - Grant permissions
   - Redirected to dashboard
   - ✅ Success!

---

## 💡 Why This Happens

**Technical Explanation:**

Clerk uses Google reCAPTCHA v3 to prevent bot signups. On localhost:
- reCAPTCHA may not load properly
- Some browsers block third-party scripts on localhost
- Extensions (ad blockers, privacy tools) block CAPTCHA
- Localhost is not a verified domain for reCAPTCHA

**In production:**
- Real domains work fine with CAPTCHA
- CAPTCHA loads properly
- No issues expected

---

## ✅ Quick Checklist

- [ ] Try logging in instead of signing up
- [ ] Check if user exists in Clerk Dashboard
- [ ] Disable CAPTCHA in Clerk (development)
- [ ] Clear browser cache and cookies
- [ ] Try in incognito mode
- [ ] Disable browser extensions
- [ ] Test again

---

**Last Updated:** December 10, 2025  
**Issue:** CAPTCHA Error  
**Status:** Solvable in 2 minutes
