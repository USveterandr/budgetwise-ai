# Deployment Guide for BudgetWise AI

## Pre-Deployment Checklist

### 1. Environment Configuration
```bash
# Create production .env file
cp .env.example .env

# Add production values:
EXPO_PUBLIC_GEMINI_API_KEY=your_production_key
EXPO_PUBLIC_API_URL=https://budgetwise-backend.isaactrinidadllc.workers.dev
EXPO_PUBLIC_ENV=production
```

### 2. Code Quality Checks
```bash
# Run TypeScript check
npx tsc --noEmit

# Run linter
npm run lint

# Format code
npx prettier --write .
```

### 3. Build Verification
```bash
# Clear cache
npm run reset-project

# Install dependencies
npm install

# Build web version
npm run build

# Verify build output in dist/
```

---

## Deployment Options

### Option 1: Deploy to Cloudflare Pages (Web)

1. **Build the web version:**
```bash
npm run build
```

2. **Deploy via Wrangler CLI:**
```bash
# Install Wrangler if not already
npm install -g wrangler

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

3. **Or connect GitHub repository:**
   - Go to Cloudflare Pages dashboard
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Set environment variables in dashboard

### Option 2: Deploy Mobile Apps via EAS

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure EAS:**
```bash
# eas.json is already configured
# Review settings in eas.json
```

4. **Build for iOS:**
```bash
# Internal distribution (TestFlight)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

5. **Build for Android:**
```bash
# Internal distribution
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

---

## Environment Variables Management

### Development
- Use `.env` file locally (gitignored)
- Variables automatically loaded via app.config.js

### Production (EAS Build)
```bash
# Set secrets for EAS builds
eas secret:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_key"
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://your-api.com"
```

### Production (Cloudflare Pages)
- Set environment variables in Cloudflare Pages dashboard
- Go to Settings → Environment Variables
- Add all EXPO_PUBLIC_* variables

---

## Backend Deployment (Cloudflare Worker)

1. **Navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Deploy worker:**
```bash
npx wrangler deploy
```

4. **Set environment variables:**
```bash
# Set secrets via Wrangler
npx wrangler secret put JWT_SECRET
npx wrangler secret put RESEND_API_KEY

# Or via Cloudflare dashboard:
# Workers & Pages → Your Worker → Settings → Variables
```

5. **Verify D1 database:**
```bash
# List databases
npx wrangler d1 list

# Run migrations (if any)
npx wrangler d1 migrations apply budgetwise-db --remote
```

---

## Post-Deployment Verification

### 1. Web App
- [ ] Visit deployed URL
- [ ] Test login/signup
- [ ] Test core features
- [ ] Check console for errors
- [ ] Verify API calls succeed

### 2. Mobile Apps
- [ ] Install via TestFlight (iOS)
- [ ] Install via Internal Testing (Android)
- [ ] Test on multiple devices
- [ ] Verify push notifications (if applicable)
- [ ] Test offline behavior

### 3. Backend
- [ ] API health check endpoint
- [ ] Database connectivity
- [ ] Authentication flows
- [ ] Error logging working

---

## Rollback Procedure

### Web (Cloudflare Pages)
```bash
# Cloudflare Pages keeps deployment history
# Roll back via dashboard:
# Pages → Your Project → Deployments → Select previous deployment → Rollback
```

### Mobile Apps
- iOS: Remove from TestFlight or reject App Store update
- Android: Deactivate release in Google Play Console
- Promote previous version

### Backend (Cloudflare Worker)
```bash
# Revert to previous version via dashboard
# Or redeploy previous code
git checkout <previous-commit>
cd backend
npx wrangler deploy
```

---

## Monitoring & Maintenance

### 1. Error Tracking
- Set up Sentry or similar service
- Monitor error rates
- Set up alerts for critical errors

### 2. Analytics
- Monitor user engagement
- Track feature usage
- Identify bottlenecks

### 3. Performance
- Monitor API response times
- Check database query performance
- Optimize slow endpoints

### 4. Security
- Regularly update dependencies
- Review security advisories
- Audit authentication flows
- Check for exposed secrets

---

## CI/CD Pipeline (Recommended)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy BudgetWise AI

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm install
      
      - name: Build web
        run: npm run build
        env:
          EXPO_PUBLIC_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          EXPO_PUBLIC_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: budgetwise-ai
          directory: dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Deploy Cloudflare Worker
        run: |
          cd backend
          npm install
          npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Troubleshooting

### Build Fails
- Clear cache: `rm -rf node_modules .expo && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify environment variables are set

### App Crashes
- Check Error Boundary logs
- Review recent code changes
- Test in development mode first
- Check device compatibility

### API Errors
- Verify worker is deployed
- Check environment variables
- Review Cloudflare Worker logs
- Test endpoints manually

### Performance Issues
- Analyze bundle size: `npx expo export --dump-sourcemap`
- Check for memory leaks
- Profile React components
- Optimize images

---

## Support & Resources

- **Expo Documentation:** https://docs.expo.dev
- **Cloudflare Docs:** https://developers.cloudflare.com
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Cloudflare Pages:** https://developers.cloudflare.com/pages/

---

## Version History

| Version | Date | Changes | Deployed By |
|---------|------|---------|-------------|
| 1.0.0   | TBD  | Initial production release | - |

---

**Important Notes:**
- Always test in staging before production
- Keep .env files secure and never commit them
- Monitor error rates after deployment
- Have rollback plan ready
- Document any custom configurations
