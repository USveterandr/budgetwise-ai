# 📋 Google OAuth - Command Reference

Quick reference for commands you'll need during setup.

---

## 🔑 Get Android SHA-1 Fingerprint

### For Development/Debug Build:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Look for this line:**
```
SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

### For Production Build:
```bash
# If you have a release keystore
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

### Get SHA-1 from EAS Build:
```bash
# Download credentials
eas credentials

# Select Android → Production → Keystore
# Copy the SHA-1 fingerprint shown
```

---

## 🔑 Get iOS Bundle ID

Already configured in your `app.json`:
```
com.budgetwise.financeai
```

---

## 🌐 Important URLs

### Google Cloud Console
```
https://console.cloud.google.com/apis/credentials?project=budgetwise-ai-play-services
```

### Clerk Dashboard
```
https://dashboard.clerk.com
```

### Your App (Local)
```
http://localhost:8081
http://localhost:8081/login
```

---

## 📝 Redirect URIs to Add

### In Google Cloud Console:

**Authorized JavaScript Origins:**
```
http://localhost:8081
http://localhost:19006
```

**Authorized Redirect URIs:**
```
http://localhost:8081/oauth-native-callback
http://localhost:8081
https://accounts.clerk.dev/oauth/callback
budget-finance-ai-1://oauth-native-callback
exp://localhost:8081/oauth-native-callback
```

**For Production (add your domain):**
```
https://yourdomain.com
https://yourdomain.com/oauth-native-callback
```

---

## 🔍 Debugging Commands

### Check if app is running:
```bash
curl http://localhost:8081
```

### View app logs:
```bash
# Already running in your terminal
# Press 'j' to open debugger
```

### Clear Metro cache:
```bash
npm start -- --clear
```

### Restart app:
```bash
# Press Ctrl+C to stop
npm start
```

---

## 📱 App Configuration Values

From your `app.json`:

| Setting | Value |
|---------|-------|
| App Name | Budgetwise AI |
| Slug | budget-finance-ai-1 |
| Scheme | budget-finance-ai-1 |
| iOS Bundle ID | com.budgetwise.financeai |
| Android Package | com.budgetwise.financeai |

---

## 🔐 Environment Variables

From your `.env`:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWN0aXZlLWVmdC0xNC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_9D1DtPs5NBMPyNjkx69eyyHlSq1xG51ZcMCoKPFBm1
```

**Note:** These are already configured ✅

---

## 🧪 Testing Commands

### Test OAuth Flow:
1. Open: http://localhost:8081/login
2. Click "Sign In with Google"
3. Check console for errors

### Check Clerk Session:
```javascript
// In browser console
console.log(window.Clerk?.session)
```

---

## 📊 OAuth Flow Diagram

```
┌─────────────────┐
│   Your App      │
│  (Login Page)   │
└────────┬────────┘
         │ Click "Sign In with Google"
         ▼
┌─────────────────┐
│  Google OAuth   │
│  (Login Screen) │
└────────┬────────┘
         │ Select Account
         ▼
┌─────────────────┐
│  Google OAuth   │
│ (Consent Screen)│
└────────┬────────┘
         │ Grant Permissions
         ▼
┌─────────────────┐
│  Clerk Backend  │
│ (Process Auth)  │
└────────┬────────┘
         │ Create Session
         ▼
┌─────────────────┐
│   Your App      │
│  (Dashboard)    │
└─────────────────┘
```

---

## 🎯 Quick Copy-Paste Values

### OAuth Scopes (for Google Cloud Console):
```
email
profile
openid
```

### Test User Email:
```
[Your email address]
```

### App Scheme:
```
budget-finance-ai-1
```

---

## 🔧 Common Error Messages

### "redirect_uri_mismatch"
**Meaning:** The redirect URI doesn't match what's configured in Google Cloud Console  
**Fix:** Add the exact URI from the error to Google Cloud Console

### "invalid_client"
**Meaning:** Client ID or Secret is wrong  
**Fix:** Double-check credentials in Clerk match Google Cloud Console

### "access_denied"
**Meaning:** User cancelled or denied permissions  
**Fix:** Try again and click "Allow"

### "unauthorized_client"
**Meaning:** OAuth consent screen not configured or app not verified  
**Fix:** Configure consent screen and add test users

---

## 📞 Support Links

- **Clerk Google OAuth Docs:** https://clerk.com/docs/authentication/social-connections/google
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Expo Auth Guide:** https://docs.expo.dev/guides/authentication/

---

**Last Updated:** December 10, 2025  
**Quick Reference Version:** 1.0
