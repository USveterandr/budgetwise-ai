# Production Build Guide

This guide covers building and deploying BudgetWise AI for iOS, Android, and Web platforms.

## Prerequisites

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in all required values:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Backend Setup**: Ensure your Cloudflare Workers backend is deployed (see Backend Deployment section)

## Web Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized static build in the `dist/` directory.

### Docker Deployment (Cloud Run, AWS, etc.)

```bash
# Build Docker image
docker build -t budgetwise-web .

# Run locally for testing
docker run -p 8080:8080 budgetwise-web

# Tag and push to your container registry
docker tag budgetwise-web gcr.io/YOUR_PROJECT/budgetwise-web
docker push gcr.io/YOUR_PROJECT/budgetwise-web
```

### Environment Variables for Web

Set these in your deployment platform (Cloud Run, Vercel, Netlify, etc.):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_GEMINI_API_KEY`
- `EXPO_PUBLIC_API_URL`

## iOS Deployment

### Prerequisites
- macOS with Xcode installed
- Apple Developer Account
- EAS CLI: `npm install -g eas-cli`

### Configure EAS Build

1. Login to EAS:
   ```bash
   eas login
   ```

2. Configure the project:
   ```bash
   eas build:configure
   ```

### Build for iOS

**Development Build** (for testing):
```bash
eas build --platform ios --profile development
```

**Preview Build** (for TestFlight):
```bash
eas build --platform ios --profile preview
```

**Production Build** (for App Store):
```bash
eas build --platform ios --profile production
```

### Submit to App Store

```bash
eas submit --platform ios
```

### Environment Secrets for iOS

Add secrets to EAS:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_key_here"
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "your_api_url"
# Repeat for all Firebase variables
```

## Android Deployment

### Prerequisites
- EAS CLI: `npm install -g eas-cli`
- Google Play Console account

### Build for Android

**Development Build**:
```bash
eas build --platform android --profile development
```

**Preview Build** (for internal testing):
```bash
eas build --platform android --profile preview
```

**Production Build** (for Google Play):
```bash
eas build --platform android --profile production
```

### Submit to Google Play

```bash
eas submit --platform android
```

### Environment Secrets for Android

Same as iOS - add via `eas secret:create`

## Backend Deployment (Cloudflare Workers)

### Prerequisites
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create D1 Database:
   ```bash
   wrangler d1 create budgetwise_db
   ```
   Update `wrangler.toml` with the database ID.

4. Create R2 Buckets:
   ```bash
   wrangler r2 bucket create bank-statements
   wrangler r2 bucket create avatars
   ```

5. Initialize database:
   ```bash
   wrangler d1 execute budgetwise_db --file=schema.sql
   ```

### Deploy Backend

```bash
wrangler deploy
```

The deployed URL will be shown in the output. Update `EXPO_PUBLIC_API_URL` in your frontend `.env` file.

## Testing Before Production

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Test Web Build Locally
```bash
npm run build
node server.js
# Visit http://localhost:8080
```

### Test iOS Build Locally
```bash
npx expo run:ios
```

### Test Android Build Locally
```bash
npx expo run:android
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Backend deployed and accessible
- [ ] Database schema initialized
- [ ] R2 buckets created
- [ ] Firebase project configured
- [ ] Google Gemini API key obtained
- [ ] Tests passing
- [ ] Linter passing
- [ ] Web build tested locally
- [ ] iOS build tested on device
- [ ] Android build tested on device
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] App store assets prepared
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)

## Troubleshooting

### Web Build Issues
- Ensure all environment variables are set
- Check that `dist/` directory is created after build
- Verify Express server can find the dist directory

### iOS Build Issues
- Check signing certificates in Apple Developer account
- Verify bundle identifier matches in app.json
- Ensure all required permissions are in Info.plist

### Android Build Issues
- Check keystore configuration in eas.json
- Verify package name matches in app.json
- Ensure all permissions are declared in app.json

### Backend Issues
- Verify wrangler.toml configuration
- Check D1 database exists and is initialized
- Ensure R2 buckets exist
- Test API endpoints with curl or Postman

## Monitoring & Maintenance

### Cloudflare Workers Dashboard
Monitor your backend at: https://dash.cloudflare.com/

### EAS Build Dashboard
View build status at: https://expo.dev/

### Analytics
- Firebase Analytics for user behavior
- Cloudflare Analytics for API usage
- Custom error tracking (if implemented)

## Support

For issues or questions:
- Check documentation in `/docs`
- Review troubleshooting guides
- Contact support via the app's Contact Support page
