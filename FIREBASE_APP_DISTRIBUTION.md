# 📱 Firebase App Distribution Guide - Budgetwise AI

This guide explains how to distribute your Android builds (`.aab` or `.apk`) to testers using Firebase App Distribution.

## 🛠 Project Details
- **Project ID:** `budgetwise-ai-88101`
- **Package Name:** `com.budgetwise.financeai`
- **Firebase App ID:** `1:141407074198:android:280929fe5fd0a29ccd8fb7` ✅

---

## 🚀 Step 1: Build Your App
When you're ready to distribute a pre-release version:
1. Generate your Android App Bundle (`.aab`) or APK.
2. For Expo apps, use:
   ```bash
   eas build --platform android --profile development
   ```
3. Your recent builds are located in the root directory:
   - `application-79c36a77-05f8-458c-8964-0b9bc8562c96.aab` (Latest)

---

## 📤 Step 2: Distribute via Firebase Console
1. Open the [App Distribution](https://console.firebase.google.com/project/budgetwise-ai-88101/appdistribution) page in the Firebase Console.
2. Select **Budgetwise AI** from the app drop-down at the top.
3. **Drag and drop** your latest `.aab` file into the upload area.
4. Once uploaded:
   - **Add Testers:** Enter email addresses (e.g., `isaac@isaac-trinidad.com`).
   - **Add Release Notes:** Describe what's new in this build.
5. Click **Distribute**.

---

## 💻 Step 3: Distribute via CLI (Alternative)
You can distribute directly from your terminal using the Firebase CLI:

```bash
firebase appdistribution:distribute application-79c36a77-05f8-458c-8964-0b9bc8562c96.aab \
--app 1:141407074198:android:280929fe5fd0a29ccd8fb7 \
--groups testers \
--release-notes "Initial AI budget tracking features"
```

---

## ✅ Prerequisites Met
- Correct Android App registered: `com.budgetwise.financeai`
- Firebase project linked: `budgetwise-ai-88101`

---

## 📈 Monitoring
- **150 Days:** Builds are available for 150 days.
- **30 Days:** Testers have 30 days to accept invitations.
- **Status:** You can track who has accepted, downloaded, and tested the app in the Firebase Console dashboard.

**Last Updated:** December 17, 2025
