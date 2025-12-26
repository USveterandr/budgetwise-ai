# 🌐 Google Services Setup Guide - Budgetwise AI

This guide provides instructions for setting up and integrating Google Play and Google Cloud Run (or Firebase App Hosting) with your project.

---

## 📱 PART 1: Google Play Integration

Linking Google Play to Firebase is essential for distributing Android App Bundles (.aab) and automating releases.

### 🔗 1. Link Google Play to Firebase
1. Open the [Firebase Console](https://console.firebase.google.com/project/budgetwise-ai-88101/settings/integrations).
2. Find the **Google Play** card and click **Link**.
3. Follow the on-screen instructions to connect your Google Play Developer account.

### 🔑 2. Create a Service Account for Automation (Optional)
To distribute builds directly from your terminal or CI/CD without manual console uploads:
1. Go to the [Google Cloud Console Credentials page](https://console.cloud.google.com/apis/credentials?project=budgetwise-ai-88101).
2. Click **Create Credentials** > **Service Account**.
3. Name it `firebase-app-distributor` and grant it the **Firebase App Distribution Admin** role.
4. Go to the **Keys** tab of the new service account, click **Add Key** > **Create new key** (JSON).
5. Save this file locally (e.g., `google-services-key.json`). **Do not commit this file to Git.**

---

## ☁️ PART 2: Google Cloud Run Deployment

Your project includes a `Dockerfile` optimized for serving the web version of Budgetwise AI on Google Cloud Run.

### 🚀 1. Deploying to Cloud Run
Run the following commands to build and deploy your container:

```bash
# 1. Build the container image using Google Cloud Build
gcloud builds submit --tag gcr.io/budgetwise-ai-88101/web-app

# 2. Deploy to Cloud Run
gcloud run deploy budgetwise-web \
  --image gcr.io/budgetwise-ai-88101/web-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 🛠 2. Continuous Deployment
You can connect your GitHub repository to Cloud Run for automatic deployments:
1. Go to the [Cloud Run Console](https://console.cloud.google.com/run).
2. Click **Create Service** or select your existing service.
3. Choose **"Continuously deploy from a repository"**.
4. Follow the steps to link your GitHub repo and select the `Dockerfile` build path.

---

## 🏠 PART 3: Firebase App Hosting (The "New" Run)

Firebase App Hosting is a managed service for modern web frameworks (Next.js, etc.) that handles the "Run" side of things automatically.

### ✨ Advantages
- Automatic SSR/Static generation support.
- Direct integration with Firebase Auth and Data Connect.
- Managed infrastructure with zero-config scaling.

### 🛠 Setup
If you prefer this over manual Cloud Run management:
1. Run `firebase apphosting:backends:create` in your terminal.
2. Select your GitHub repository.
3. Firebase will automatically detect your project type and set up a "Run" environment managed by Firebase.

---

## ✅ Summary of Requirements
- **Google Play Developer Account**: Required for AAB distribution.
- **Google Cloud SDK (`gcloud`)**: Required for Cloud Run CLI deployments.
- **Firebase CLI**: Already configured.

**Last Updated:** December 22, 2025
