# Pre-Deployment Checklist

Use this checklist before deploying BudgetWise AI to production.

## Environment Setup ✅

### 1. Firebase Configuration
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Authentication (Email/Password and Google)
- [ ] Enable Firestore Database
- [ ] Enable Storage
- [ ] Copy configuration to `.env` file
- [ ] Update Firebase security rules (see firebase.json)

### 2. Google Gemini API
- [ ] Get API key from https://aistudio.google.com/
- [ ] Add `EXPO_PUBLIC_GEMINI_API_KEY` to `.env`
- [ ] Test API key with a simple request

### 3. Cloudflare Setup
- [ ] Create Cloudflare account
- [ ] Install wrangler CLI: `npm install -g wrangler`
- [ ] Login: `wrangler login`
- [ ] Create D1 database: `wrangler d1 create budgetwise_db`
- [ ] Update `backend/wrangler.toml` with database ID
- [ ] Create R2 buckets:
  - `wrangler r2 bucket create bank-statements`
  - `wrangler r2 bucket create avatars`
- [ ] Initialize database: `cd backend && wrangler d1 execute budgetwise_db --file=schema.sql`

### 4. Environment Variables
Copy `.env.example` to `.env` and fill in all values:
```bash
cp .env.example .env
```

Required variables:
- [ ] `EXPO_PUBLIC_FIREBASE_API_KEY`
- [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `EXPO_PUBLIC_FIREBASE_APP_ID`
- [ ] `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- [ ] `EXPO_PUBLIC_GEMINI_API_KEY`
- [ ] `EXPO_PUBLIC_API_URL` (will get after backend deployment)

## Backend Deployment ✅

### 1. Test Backend Locally
```bash
cd backend
npm install
wrangler dev
```
- [ ] Test health endpoint: `curl http://localhost:8787/health`
- [ ] Test API endpoint: `curl http://localhost:8787/`

### 2. Deploy Backend
```bash
cd backend
wrangler deploy
```
- [ ] Note the deployment URL (e.g., `https://budgetwise-backend.your-subdomain.workers.dev`)
- [ ] Update `EXPO_PUBLIC_API_URL` in `.env` with this URL
- [ ] Test production health: `curl https://your-backend-url/health`

### 3. Verify Backend
- [ ] Health check returns 200 OK
- [ ] Can query database (test with profile endpoint)
- [ ] R2 buckets accessible
- [ ] Rate limiting works (test with 100+ requests)

## Web Deployment ✅

### 1. Update Configuration
- [ ] Add backend URL to `.env`
- [ ] Update `public/_headers` with production domain
- [ ] Update `backend/src/index.ts` CORS allowedOrigins with production domain

### 2. Test Build Locally
```bash
npm install
npm run build
node server.js
```
- [ ] Visit http://localhost:8080
- [ ] Test login/signup
- [ ] Test dashboard access
- [ ] Test AI features
- [ ] Check console for errors

### 3. Deploy to Production
Choose your platform:

#### Option A: Google Cloud Run
```bash
docker build -t budgetwise-web .
docker tag budgetwise-web gcr.io/YOUR_PROJECT/budgetwise-web
docker push gcr.io/YOUR_PROJECT/budgetwise-web
gcloud run deploy budgetwise-web --image gcr.io/YOUR_PROJECT/budgetwise-web
```

#### Option B: Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

#### Option C: Vercel/Netlify
- Connect GitHub repository
- Set build command: `npm run build`
- Set output directory: `dist`
- Add all environment variables in platform settings

### 4. Verify Web Deployment
- [ ] Visit production URL
- [ ] Test PWA install prompt
- [ ] Test authentication
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Test on mobile browser
- [ ] Verify CSP headers (check browser dev tools Network tab)

## Mobile Deployment ✅

### 1. EAS Setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Add Environment Secrets
For each environment variable:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_value"
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_value"
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "your_value"
# Repeat for all Firebase variables
```

### 3. iOS Deployment
Prerequisites:
- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect app created
- [ ] Bundle identifier configured in app.json

Build:
```bash
eas build --platform ios --profile production
```

Submit:
```bash
eas submit --platform ios
```

Verify:
- [ ] Build completes successfully
- [ ] TestFlight build available
- [ ] Test on real iOS device via TestFlight
- [ ] Submit for App Store review

### 4. Android Deployment
Prerequisites:
- [ ] Google Play Console account ($25 one-time)
- [ ] Play Console app created
- [ ] Package name configured in app.json

Build:
```bash
eas build --platform android --profile production
```

Submit:
```bash
eas submit --platform android
```

Verify:
- [ ] Build completes successfully
- [ ] Internal testing track available
- [ ] Test on real Android device
- [ ] Submit for Play Store review

## Security Verification ✅

### 1. Backend Security
- [ ] Rate limiting active (test with curl in loop)
- [ ] CORS only allows whitelisted domains
- [ ] Input validation working (test with malicious payloads)
- [ ] SQL injection prevented (test with SQL in inputs)
- [ ] Health check doesn't expose sensitive data

### 2. Frontend Security
- [ ] No API keys in source code
- [ ] CSP headers present (check Network tab)
- [ ] HTTPS enforced
- [ ] XSS protection headers present
- [ ] Authentication required for protected routes

### 3. Firebase Security
- [ ] Firestore rules prevent unauthorized access
- [ ] Storage rules prevent public uploads
- [ ] Only authenticated users can read/write their data

## Performance Testing ✅

### 1. Web Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s

### 2. Backend Performance
- [ ] API response time < 500ms (test with curl -w)
- [ ] Database queries optimized with indexes
- [ ] R2 file operations complete quickly
- [ ] Rate limiter doesn't affect normal usage

### 3. Mobile Performance
- [ ] App opens in < 3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] No memory leaks (test with profiler)
- [ ] Battery usage acceptable

## Monitoring Setup ✅

### 1. Backend Monitoring
- [ ] Cloudflare Workers analytics enabled
- [ ] Set up alerts for errors
- [ ] Monitor D1 database usage
- [ ] Monitor R2 bandwidth usage

### 2. Frontend Monitoring
- [ ] Firebase Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Performance monitoring active

### 3. Uptime Monitoring
- [ ] Set up external monitor for backend /health
- [ ] Set up alerts for downtime
- [ ] Set up alerts for slow responses

## Documentation ✅

- [ ] Update README with production URLs
- [ ] Document any custom setup steps
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures

## Legal & Compliance ✅

- [ ] Privacy policy updated and accessible
- [ ] Terms of service updated and accessible
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy documented
- [ ] User data deletion process implemented

## Post-Deployment ✅

### 1. Smoke Testing
- [ ] Create test user account
- [ ] Add sample transaction
- [ ] Create budget
- [ ] Test AI advisor
- [ ] Test receipt scanner
- [ ] Delete test data

### 2. User Acceptance
- [ ] Share with beta users
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Update app stores if needed

### 3. Launch
- [ ] Announce on social media
- [ ] Update website
- [ ] Send email to waitlist
- [ ] Monitor error rates closely
- [ ] Respond to user feedback

## Emergency Rollback Plan ✅

If critical issues are discovered:

### Backend
```bash
cd backend
wrangler rollback
```

### Web
- Revert to previous deployment in hosting platform
- Or: redeploy previous git commit

### Mobile
- Can't rollback app stores
- Fix and submit update ASAP
- Use remote config to disable broken features

## Success Criteria ✅

Deploy is successful when:
- [ ] All platforms accessible (web, iOS, Android)
- [ ] Authentication working
- [ ] All major features functional
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Users can complete core workflows
- [ ] Monitoring active and sending data

## Support Resources

- Production Guide: PRODUCTION_BUILD_GUIDE.md
- Bug Fixes: BUG_FIXES_SUMMARY.md
- Firebase Docs: https://firebase.google.com/docs
- Cloudflare Docs: https://developers.cloudflare.com
- Expo Docs: https://docs.expo.dev

---

**Last Updated**: January 2026
**Status**: Production Ready ✅
