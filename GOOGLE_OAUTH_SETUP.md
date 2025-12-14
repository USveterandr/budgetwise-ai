# 🔐 Google OAuth Setup - Complete Guide

**Project:** Budgetwise AI  
**Date:** December 10, 2025  
**Status:** Step-by-step instructions

---

## 📋 Overview

This guide will help you set up Google OAuth for your BudgetWise AI app. You'll configure:
1. Google Cloud Console OAuth credentials
2. Clerk integration with Google
3. Redirect URIs for all platforms
4. Testing and verification

**Time Required:** 15-20 minutes

---

## 🎯 PART 1: Google Cloud Console Setup

### Step 1: Navigate to APIs & Services

You're already in Google Cloud Console with project "Budgetwise AI Play Services" ✅

**Actions:**
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**

**Screenshot Location:** You should see a page with API keys, OAuth 2.0 Client IDs, and Service Accounts

---

### Step 2: Create OAuth 2.0 Client ID (if not exists)

**Check if you already have an OAuth Client ID:**
- Look for "OAuth 2.0 Client IDs" section
- If you see a client ID for "Web application" or "Android/iOS", you can use it
- If not, create a new one:

**To Create New OAuth Client ID:**

1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"**
3. You may be prompted to configure the OAuth consent screen first

---

### Step 3: Configure OAuth Consent Screen (if needed)

If prompted to configure consent screen:

1. Click **"CONFIGURE CONSENT SCREEN"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"CREATE"**

**Fill in the required fields:**

| Field | Value |
|-------|-------|
| App name | `Budgetwise AI` |
| User support email | Your email |
| App logo | (Optional) Upload your app icon |
| Application home page | `https://yourdomain.com` (or leave blank for now) |
| Authorized domains | Add your domain if you have one |
| Developer contact | Your email |

4. Click **"SAVE AND CONTINUE"**

**Scopes:**
1. Click **"ADD OR REMOVE SCOPES"**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click **"UPDATE"**
4. Click **"SAVE AND CONTINUE"**

**Test Users (for development):**
1. Click **"ADD USERS"**
2. Add your email address
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

5. Review and click **"BACK TO DASHBOARD"**

---

### Step 4: Create OAuth Client ID

Now create the actual OAuth client:

1. Go back to **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. Choose **"Web application"** as Application type

**Configure the Web Client:**

**Name:** `Budgetwise AI Web Client`

**Authorized JavaScript origins:**
```
http://localhost:8081
http://localhost:19006
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:8081/oauth-native-callback
http://localhost:8081
https://accounts.clerk.dev/oauth/callback
https://clerk.budgetwise.ai/oauth/callback
```

5. Click **"CREATE"**

---

### Step 5: Save Your Credentials

After creation, you'll see a popup with:
- **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz`)

**IMPORTANT:** 
- ✅ Copy both values
- ✅ Keep them secure
- ✅ You'll need them for Clerk configuration

**Save them temporarily in a secure note or password manager**

---

### Step 6: Create Android OAuth Client (for mobile app)

For your Android app to work with Google OAuth:

1. Click **"+ CREATE CREDENTIALS"** again
2. Select **"OAuth client ID"**
3. Choose **"Android"** as Application type

**Configure Android Client:**

**Name:** `Budgetwise AI Android`

**Package name:** `com.budgetwise.financeai`
(This matches your `app.json` android.package)

**SHA-1 certificate fingerprint:**

You need to get this from your Android build. Run this command:

```bash
# For development/debug build
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For production build (if you have it)
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

Copy the SHA-1 fingerprint and paste it in the field.

4. Click **"CREATE"**

---

### Step 7: Create iOS OAuth Client (for mobile app)

For your iOS app:

1. Click **"+ CREATE CREDENTIALS"** again
2. Select **"OAuth client ID"**
3. Choose **"iOS"** as Application type

**Configure iOS Client:**

**Name:** `Budgetwise AI iOS`

**Bundle ID:** `com.budgetwise.financeai`
(This matches your `app.json` ios.bundleIdentifier)

4. Click **"CREATE"**

---

## 🎯 PART 2: Clerk Configuration

### Step 8: Open Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Sign in with your account
3. Select your **"Budgetwise AI"** project

---

### Step 9: Enable Google OAuth in Clerk

1. In the left sidebar, click **"User & Authentication"**
2. Click **"Social Connections"**
3. Find **"Google"** in the list
4. Click on it to expand settings

---

### Step 10: Configure Google in Clerk

**Enable Google:**
1. Toggle **"Enable Google"** to ON

**Add Credentials:**
1. Select **"Use custom credentials"**
2. Paste your **Client ID** from Step 5
3. Paste your **Client Secret** from Step 5
4. Click **"Save"**

**Scopes (should be pre-filled):**
- `email`
- `profile`
- `openid`

---

### Step 11: Configure Redirect URIs in Clerk

Clerk will show you the redirect URI it expects. It should look like:
```
https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback
```

**Copy this URL** and go back to Google Cloud Console.

---

### Step 12: Add Clerk Redirect URI to Google

1. Go back to **Google Cloud Console** → **Credentials**
2. Click on your **"Budgetwise AI Web Client"**
3. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
4. Paste the Clerk redirect URI you copied
5. Click **"SAVE"**

---

## 🎯 PART 3: App Configuration

### Step 13: Update Your App's Redirect URIs

Your app already has the OAuth callback route at `/oauth-native-callback` ✅

**Verify in your code:**

File: `app/oauth-native-callback.tsx` ✅ (Already exists)

---

### Step 14: Update App Scheme (for mobile)

Your app scheme is already configured in `app.json`:
```json
"scheme": "budget-finance-ai-1"
```

**Add this to Google Cloud Console:**

1. Go to **Google Cloud Console** → **Credentials**
2. Edit your **Web Client**
3. Under **"Authorized redirect URIs"**, add:
   ```
   budget-finance-ai-1://oauth-native-callback
   exp://localhost:8081/oauth-native-callback
   ```
4. Click **"SAVE"**

---

## 🎯 PART 4: Testing

### Step 15: Test on Web (localhost)

1. Make sure your app is running: `npm start` ✅ (Already running)
2. Open: http://localhost:8081/login
3. Click **"Sign In with Google"**
4. You should see Google's OAuth consent screen
5. Select your Google account
6. Grant permissions
7. You should be redirected back to your app and logged in

**Expected Flow:**
```
Your App → Google Login → Google Consent → Clerk → Your App Dashboard
```

---

### Step 16: Check for Errors

**If you see errors:**

**Error: "redirect_uri_mismatch"**
- ✅ Check that all redirect URIs match exactly
- ✅ No trailing slashes
- ✅ Correct protocol (http/https)

**Error: "invalid_client"**
- ✅ Check Client ID and Secret in Clerk
- ✅ Make sure you copied them correctly

**Error: "access_denied"**
- ✅ User cancelled the flow (normal)
- ✅ Try again

**Error: "unauthorized_client"**
- ✅ Check OAuth consent screen is configured
- ✅ Add your email as a test user

---

### Step 17: Test on Mobile (Optional)

For Android/iOS testing:

1. Build your app with EAS:
   ```bash
   eas build --platform android --profile development
   ```

2. Install on device
3. Test Google OAuth flow
4. Should work with the Android/iOS OAuth clients you created

---

## 🎯 PART 5: Production Deployment

### Step 18: Update for Production

When deploying to production:

1. **Add production domain to Google Cloud Console:**
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/oauth-native-callback`

2. **Update OAuth Consent Screen:**
   - Change from "Testing" to "In Production"
   - This requires Google verification if you have sensitive scopes

3. **Update Clerk:**
   - Add production domain to allowed origins
   - Update environment variables in production

---

## 📋 Checklist

Use this checklist to verify everything is set up:

### Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] Web OAuth client created
- [ ] Android OAuth client created (with SHA-1)
- [ ] iOS OAuth client created
- [ ] All redirect URIs added
- [ ] Credentials saved securely

### Clerk Dashboard
- [ ] Google OAuth enabled
- [ ] Custom credentials added
- [ ] Scopes configured
- [ ] Clerk redirect URI added to Google

### App Configuration
- [ ] OAuth callback route exists (`/oauth-native-callback`)
- [ ] App scheme configured in `app.json`
- [ ] Environment variables set (`.env`)

### Testing
- [ ] Web OAuth works on localhost
- [ ] No console errors
- [ ] User redirected to dashboard after login
- [ ] User data synced correctly

---

## 🔧 Troubleshooting

### Common Issues

**Issue 1: "redirect_uri_mismatch"**

**Solution:**
1. Copy the exact redirect URI from the error message
2. Add it to Google Cloud Console → Credentials → Your OAuth Client
3. Make sure there are no typos or extra characters

**Issue 2: OAuth works but user not created**

**Solution:**
Check your `handleGoogleLogin` function in `app/(auth)/login.tsx`:
```typescript
if (createdSessionId) {
  await setActive!({ session: createdSessionId });
  // User should be automatically created by Clerk
  router.replace('/(tabs)/dashboard');
}
```

**Issue 3: "invalid_client"**

**Solution:**
1. Verify Client ID and Secret in Clerk match Google Cloud Console
2. Check for extra spaces when copying
3. Regenerate credentials if needed

---

## 📞 Support Resources

- **Clerk Docs:** https://clerk.com/docs/authentication/social-connections/google
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Expo Auth:** https://docs.expo.dev/guides/authentication/

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Click "Sign In with Google" opens Google's login page
2. ✅ After selecting account, you see permission consent
3. ✅ After granting permission, you're redirected to your app
4. ✅ You're logged in and see the dashboard
5. ✅ No errors in console
6. ✅ User data is saved in Clerk

---

**Last Updated:** December 10, 2025  
**Status:** Ready to implement  
**Estimated Time:** 15-20 minutes
