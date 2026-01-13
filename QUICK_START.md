# Quick Start Deployment Guide

**Fast track to production deployment.** For detailed instructions, see [PRODUCTION_BUILD_GUIDE.md](./PRODUCTION_BUILD_GUIDE.md) and [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).

## Prerequisites (5 minutes)

1. **Install tools:**
   ```bash
   npm install -g wrangler eas-cli
   ```

2. **Create accounts:**
   - Firebase: https://console.firebase.google.com
   - Cloudflare: https://dash.cloudflare.com
   - Gemini API: https://aistudio.google.com
   - Expo: https://expo.dev

## Backend (10 minutes)

```bash
# 1. Setup Cloudflare
wrangler login
wrangler d1 create budgetwise_db
wrangler r2 bucket create bank-statements
wrangler r2 bucket create avatars

# 2. Update backend/wrangler.toml with database ID

# 3. Initialize database
cd backend
wrangler d1 execute budgetwise_db --file=schema.sql

# 4. Deploy
wrangler deploy

# 5. Test
curl https://your-worker.workers.dev/health
```

## Environment Variables (5 minutes)

```bash
# 1. Copy template
cp .env.example .env

# 2. Fill in values from:
# - Firebase Console → Project Settings
# - Gemini AI Studio → API Keys
# - Cloudflare Workers → Your deployed URL

# 3. Example .env:
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
EXPO_PUBLIC_API_URL=https://budgetwise-backend.your-subdomain.workers.dev
```

## Web Deployment (10 minutes)

### Option A: Docker (Google Cloud Run)
```bash
npm run build
docker build -t budgetwise-web .
docker tag budgetwise-web gcr.io/PROJECT/budgetwise-web
docker push gcr.io/PROJECT/budgetwise-web
gcloud run deploy budgetwise-web --image gcr.io/PROJECT/budgetwise-web
```

### Option B: Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Mobile Deployment (20 minutes)

```bash
# 1. Configure EAS
eas build:configure

# 2. Add secrets (repeat for each env var)
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_key"

# 3. Build both platforms
eas build --platform all --profile production

# 4. Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Verification (5 minutes)

**Backend:**
```bash
curl https://your-worker.workers.dev/health
# Should return: {"status":"healthy",...}
```

**Web:**
- Visit your deployed URL
- Test login/signup
- Check browser console (no errors)

**Mobile:**
- Install via TestFlight (iOS) or Internal Testing (Android)
- Test core features

## Common Issues

### "Database not found"
```bash
cd backend
wrangler d1 execute budgetwise_db --file=schema.sql
```

### "CORS error"
Update `backend/src/index.ts` allowedOrigins with your domain.

### "Environment variables not loading"
- Web: Set in hosting platform (Vercel/Netlify/Cloud Run)
- Mobile: Use `eas secret:create`

### "Build fails"
```bash
npm install
npm run build
```

### "API returns 429 (Too Many Requests)"
Rate limit hit. Wait 1 minute or adjust in `backend/src/index.ts`.

## Production URLs

After deployment, update these:
- `EXPO_PUBLIC_API_URL` in .env
- `allowedOrigins` in backend/src/index.ts
- CSP headers in public/_headers

## Monitoring

- Backend health: `https://your-worker.workers.dev/health`
- Cloudflare dashboard: https://dash.cloudflare.com
- Firebase console: https://console.firebase.google.com
- Expo builds: https://expo.dev

## Support

- Full guide: [PRODUCTION_BUILD_GUIDE.md](./PRODUCTION_BUILD_GUIDE.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Bug fixes: [BUG_FIXES_SUMMARY.md](./BUG_FIXES_SUMMARY.md)
- Environment: [.env.example](./.env.example)

---

**Total deployment time: ~45 minutes** ⏱️

**Questions?** Check the documentation files above or open an issue.
