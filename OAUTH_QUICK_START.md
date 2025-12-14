# 🚀 Quick Start - Google OAuth Setup

**Follow these steps in order. Each step takes 2-3 minutes.**

---

## ⚡ STEP 1: Google Cloud Console - Get Credentials (5 minutes)

### What you need to do:

1. **Open Google Cloud Console** (you already have it open ✅)
   - URL: https://console.cloud.google.com
   - Project: "Budgetwise AI Play Services"

2. **Navigate to Credentials:**
   ```
   Left Sidebar → APIs & Services → Credentials
   ```

3. **Check if OAuth Client exists:**
   - Look for "OAuth 2.0 Client IDs" section
   - If you see a Web client, click on it to view
   - If not, continue to create one

4. **Create OAuth Client ID:**
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth client ID"
   - If prompted, configure consent screen first (see below)

5. **Configure Consent Screen (if needed):**
   - User Type: External
   - App name: `Budgetwise AI`
   - User support email: Your email
   - Scopes: email, profile, openid
   - Test users: Add your email
   - Save and continue

6. **Create Web Application Client:**
   - Application type: Web application
   - Name: `Budgetwise AI Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:8081
   http://localhost:19006
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:8081/oauth-native-callback
   http://localhost:8081
   https://accounts.clerk.dev/oauth/callback
   ```

7. **Save Your Credentials:**
   - Copy Client ID (looks like: `123456-abc.apps.googleusercontent.com`)
   - Copy Client Secret (looks like: `GOCSPX-abc123`)
   - **KEEP THESE SAFE!** You'll need them in Step 2

---

## ⚡ STEP 2: Clerk Dashboard - Configure Google (3 minutes)

### What you need to do:

1. **Open Clerk Dashboard:**
   - URL: https://dashboard.clerk.com
   - Sign in and select "Budgetwise AI" project

2. **Navigate to Social Connections:**
   ```
   Left Sidebar → User & Authentication → Social Connections
   ```

3. **Enable Google:**
   - Find "Google" in the list
   - Click to expand
   - Toggle "Enable Google" to ON

4. **Add Custom Credentials:**
   - Select "Use custom credentials"
   - Paste your Client ID from Step 1
   - Paste your Client Secret from Step 1
   - Click "Save"

5. **Copy Clerk's Redirect URI:**
   - Clerk will show you a redirect URI
   - It looks like: `https://your-app.clerk.accounts.dev/v1/oauth_callback`
   - **COPY THIS URL** - you'll need it in Step 3

---

## ⚡ STEP 3: Add Clerk Redirect to Google (2 minutes)

### What you need to do:

1. **Go back to Google Cloud Console**
   - Navigate to: APIs & Services → Credentials

2. **Edit your Web Client:**
   - Click on "Budgetwise AI Web Client"

3. **Add Clerk's Redirect URI:**
   - Under "Authorized redirect URIs"
   - Click "+ ADD URI"
   - Paste the Clerk redirect URI from Step 2
   - Click "SAVE"

---

## ⚡ STEP 4: Test It! (2 minutes)

### What you need to do:

1. **Your app is already running** ✅
   - URL: http://localhost:8081

2. **Go to login page:**
   - Navigate to: http://localhost:8081/login

3. **Click "Sign In with Google"**

4. **Expected flow:**
   ```
   Your App 
     ↓
   Google Login Screen (select account)
     ↓
   Google Consent Screen (grant permissions)
     ↓
   Clerk processes authentication
     ↓
   Redirected to Dashboard ✅
   ```

5. **If it works:**
   - You'll be logged in
   - You'll see the dashboard
   - No errors in console
   - **SUCCESS! 🎉**

6. **If it doesn't work:**
   - Check console for errors
   - See troubleshooting section below

---

## 🔧 Quick Troubleshooting

### Error: "redirect_uri_mismatch"

**Fix:**
1. Copy the exact URI from the error message
2. Add it to Google Cloud Console → Credentials
3. Make sure no trailing slashes or typos

### Error: "invalid_client"

**Fix:**
1. Double-check Client ID and Secret in Clerk
2. Make sure you copied them exactly (no extra spaces)
3. Try regenerating credentials

### Error: "access_denied"

**Fix:**
1. This means you cancelled the flow (normal)
2. Try again and click "Allow"

### Error: "unauthorized_client"

**Fix:**
1. Make sure OAuth consent screen is configured
2. Add your email as a test user in Google Cloud Console

---

## 📋 Quick Checklist

Before testing, verify:

- [ ] Google OAuth client created
- [ ] Client ID and Secret copied
- [ ] Clerk Google OAuth enabled
- [ ] Credentials added to Clerk
- [ ] Clerk redirect URI added to Google
- [ ] App is running (http://localhost:8081)

---

## 🎯 What's Next?

After Google OAuth works on web:

1. **For Android:** Create Android OAuth client with SHA-1
2. **For iOS:** Create iOS OAuth client with Bundle ID
3. **For Production:** Add production domain to redirect URIs

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

---

## 💡 Pro Tips

1. **Keep credentials secure:** Never commit Client Secret to git
2. **Test users:** Add your email as test user during development
3. **Multiple environments:** Create separate OAuth clients for dev/prod
4. **Debugging:** Check browser console and terminal logs

---

## ⏱️ Time Estimate

- Step 1: 5 minutes
- Step 2: 3 minutes
- Step 3: 2 minutes
- Step 4: 2 minutes
- **Total: ~12 minutes**

---

**Ready to start? Begin with Step 1! 🚀**

Need help? Check the full guide: `GOOGLE_OAUTH_SETUP.md`
