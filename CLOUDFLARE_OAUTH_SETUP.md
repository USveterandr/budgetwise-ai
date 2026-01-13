# Cloudflare OAuth Setup Guide

This guide explains how to set up and configure the Cloudflare-based OAuth authentication system for BudgetWise AI.

## Overview

BudgetWise AI now uses **Cloudflare Workers** for OAuth authentication instead of Firebase Auth. This provides:
- Better control over authentication flow
- Reduced third-party dependencies
- Seamless integration with existing Cloudflare infrastructure
- JWT-based session management

## Architecture

### Backend (Cloudflare Workers)
- **OAuth Provider**: Google OAuth 2.0
- **Session Storage**: Cloudflare KV (for OAuth state and sessions)
- **Token Management**: JWT tokens with 7-day expiration
- **Database**: Cloudflare D1 (user profiles)

### Frontend (Expo/React Native)
- **OAuth Library**: `expo-auth-session`
- **Token Storage**: `expo-secure-store`
- **Deep Linking**: Custom URI scheme for OAuth callbacks

## Setup Instructions

### 1. Backend Configuration

#### a. Install Dependencies
Already installed in `backend/package.json`:
- `@hono/oauth-providers` - OAuth provider integrations
- `jose` - JWT token generation and verification

#### b. Create KV Namespace
Run this command in the `backend` directory:
```bash
cd backend
npx wrangler kv:namespace create AUTH_KV
```

Copy the namespace ID from the output and update `backend/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "AUTH_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

#### c. Set Environment Variables
Create secrets for production:
```bash
# In backend directory
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put JWT_SECRET
```

For local development, create `backend/.dev.vars`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_random_jwt_secret_at_least_32_chars
```

### 2. Google OAuth Configuration

#### a. Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"

#### b. Configure OAuth Consent Screen
1. Select "External" user type
2. Fill in app information:
   - **App name**: BudgetWise AI
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **Scopes**: email, profile, openid
3. Add test users for development

#### c. Create Web Application Credentials
1. **Application type**: Web application
2. **Name**: BudgetWise AI Web
3. **Authorized JavaScript origins**:
   - `http://localhost:8787` (local development)
   - `https://your-worker.workers.dev` (production)
4. **Authorized redirect URIs**:
   - `http://localhost:8787/auth/callback` (local)
   - `https://your-worker.workers.dev/auth/callback` (production)
   - `budget-finance-ai-1://auth/callback` (mobile app)

#### d. For Mobile Apps
Create additional OAuth clients:
- **Android**: OAuth client ID with package name `com.budgetwise.financeai` and SHA-1 fingerprint
- **iOS**: OAuth client ID with bundle ID `com.budgetwise.financeai`

### 3. Frontend Configuration

#### a. Update API URL
In `context/AuthContext.tsx`, the API URL is configured with:
```typescript
const API_URL = Platform.select({
    web: 'http://localhost:8787',
    default: 'https://budgetwise-backend.isaactrinidadllc.workers.dev'
});
```

Update the production URL to your deployed Worker URL.

#### b. Configure Deep Linking
Already configured in `app.json`:
```json
{
  "expo": {
    "scheme": "budget-finance-ai-1"
  }
}
```

This enables the mobile app to receive OAuth callbacks via deep links.

### 4. Deploy Backend

```bash
cd backend
npx wrangler deploy
```

Note the deployed URL (e.g., `https://budgetwise-backend.your-subdomain.workers.dev`)

### 5. Update Frontend with Deployed URL

Update the production URL in `context/AuthContext.tsx`:
```typescript
const API_URL = Platform.select({
    web: 'http://localhost:8787',
    default: 'https://your-deployed-worker.workers.dev'  // <-- Update this
});
```

## OAuth Flow

### User Login Process

1. **User clicks "Continue with Google"**
   - App calls `googleSignIn()` from `AuthContext`

2. **Initiate OAuth Flow**
   - Frontend opens OAuth URL: `GET /auth/google?redirect_uri=...`
   - Backend generates state token and redirects to Google

3. **Google Authentication**
   - User authenticates with Google
   - Google redirects back with authorization code

4. **Token Exchange**
   - Backend receives code at `/auth/callback`
   - Backend exchanges code for Google access token
   - Backend retrieves user info from Google
   - Backend creates/updates user in D1
   - Backend generates JWT token

5. **Complete Authentication**
   - Backend redirects to app with JWT token
   - Frontend stores token in SecureStore
   - User is redirected to dashboard

### Token Management

- **JWT Tokens**: 7-day expiration
- **Storage**: expo-secure-store (encrypted on device)
- **Verification**: Backend verifies JWT on each API request
- **Session Tracking**: Optional KV session for additional security

## Security Features

1. **State Verification**: OAuth state parameter prevents CSRF attacks
2. **JWT Signing**: Tokens signed with secret key
3. **Secure Storage**: Tokens stored in device secure enclave
4. **HTTPS Only**: All production traffic over HTTPS
5. **Token Expiration**: Automatic 7-day expiration

## Testing

### Local Development

1. **Start Backend**:
   ```bash
   cd backend
   npx wrangler dev
   ```

2. **Start Frontend**:
   ```bash
   npm start
   ```

3. **Test Web OAuth**:
   - Open http://localhost:8081
   - Click "Continue with Google"
   - Complete OAuth flow

### Mobile Testing

1. **Build Development Client**:
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

2. **Test OAuth Flow**:
   - Opens system browser for authentication
   - Returns to app after successful auth

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure redirect URI in Google Console exactly matches the one sent by your app
- Check for trailing slashes or typos
- Verify the protocol (http vs https)

### "Invalid state" Error
- KV namespace may not be properly configured
- Check `wrangler.toml` has correct KV binding
- State may have expired (10 minute TTL)

### Token Not Storing
- Check SecureStore permissions in `app.json`
- Ensure device has secure storage capability
- Check console for storage errors

### OAuth Not Working on Mobile
- Verify custom scheme in `app.json`
- Check Google Console has correct bundle ID/package name
- Ensure deep linking is properly configured

## Migration Notes

### From Firebase Auth

The new system differs from Firebase Auth:
- **No password authentication**: Google OAuth only
- **No email/password reset**: Users manage passwords through Google
- **No Firebase SDK**: Direct API calls to Cloudflare Workers
- **JWT instead of Firebase tokens**: Custom token format

### Removed Features
- Email/password authentication
- Password reset functionality
- Firebase-specific user properties
- Real-time auth state listeners (replaced with token verification)

### New Features
- Cloudflare-native authentication
- Direct control over user sessions
- KV-based state management
- Simpler authentication flow

## API Endpoints

### Authentication Endpoints

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `POST /auth/verify` - Verify JWT token
- `POST /auth/logout` - Logout user

### Protected Endpoints

All other API endpoints require `Authorization: Bearer <token>` header.

Example:
```typescript
const response = await fetch(`${API_URL}/api/profile?userId=${userId}`, {
  headers: { 'Authorization': `Bearer ${authToken}` }
});
```

## Environment Variables

### Backend (.dev.vars / Secrets)
```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_random_secret_key_min_32_chars
```

### Frontend (Not needed, URLs are hardcoded)
No environment variables needed - URLs are configured in the code.

## Support

For issues or questions:
- Check Cloudflare Workers logs: `npx wrangler tail`
- Check browser console for frontend errors
- Verify Google OAuth configuration
- Review Cloudflare D1 database state

## Resources

- [Cloudflare Workers OAuth](https://developers.cloudflare.com/workers/examples/auth-with-headers/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Auth Session](https://docs.expo.dev/guides/authentication/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
