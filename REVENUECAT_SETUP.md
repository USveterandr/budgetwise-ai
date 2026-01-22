# RevenueCat Setup Guide

To enable real payments in your app, follow these steps:

1.  **Create a Account:** Go to [RevenueCat](https://www.revenuecat.com/) and create a free account.
2.  **Create a Project:** Name it "BudgetWise".
3.  **Add Apps:**
    *   Add an iOS app (Select "App Store Connect" and follow instructions).
    *   Add an Android app (Select "Google Play Console" and follow instructions).
4.  **Get Public SDK Keys:**
    *   Find the **API Keys** for both iOS and Android in the RevenueCat dashboard (Project Settings > Apps).
5.  **Configure Entitlements & Offerings:**
    *   **Entitlements:** Create one called `premium`. This is what the code checks for (`services/revenueCatService.ts:79`).
    *   **Products:** Import your products from App Store Connect / Google Play (e.g., `budgetwise_monthly_999`).
    *   **Offerings:** Create a "Default" offering and add your `premium` package to it.
6.  **Add Keys to `.env`:**

Open your `.env` file and add:

```env
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_your_ios_key_here
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_your_android_key_here
```

## Google Play configuration (Budgetwise AI Advisor)

Use these canonical identifiers so Play Console, RevenueCat, and the app stay aligned:

- App name (Play Store): **Budgetwise AI Advisor (Play Store)**
- Package name: **com.budgetwise.financeail**
- Service account JSON: **google-services (1).json** (upload this in RevenueCat > Project Settings > App Store Connections > Google Play)
- Financial reports bucket ID: **pubsite_prod_1234567890000000000** (enter in the same RevenueCat Google Play connection to enable financial report imports)

RevenueCat connection steps:
1. In RevenueCat, open Project Settings → App Store Connections → Google Play → Connect.
2. Upload the service account JSON (**google-services (1).json**). Grant the service account the minimum required roles (View financial data, Manage orders/subscriptions as needed for validation).
3. Enter the **Google Play package name** `com.budgetwise.financeail`.
4. Enter the **Financial reports bucket ID** `pubsite_prod_1234567890000000000`.
5. Save, then click **Test connection**. Ensure the Play Console has granted access to financial reports for the service account.
6. In Play Console, verify the app listing uses the same package name and that products/subscriptions match the offerings you configure in RevenueCat (e.g., the `premium` entitlement).

Expo/Android notes:
- Confirm `applicationId` in `android/app/build.gradle` matches `com.budgetwise.financeail` before publishing.
- Regenerate a signed Android build after updating the applicationId so Play can accept uploads under the correct package.

## Important Notes

*   **Testing:** In iOS Simulator, payments will fail unless you use a StoreKit Configuration file (which is complex in Expo Managed). The best way to test is on a **real device** using a TestFlight build (iOS) or Internal Testing track (Android).
*   **Sandbox Users:** Create sandbox testers in App Store Connect / Google Play Console to test purchasing without real money.
