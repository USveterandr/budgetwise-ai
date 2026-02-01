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

# Detailed Expo Integration Guide

## Introduction
Expo is a framework for building React Native apps. It's a popular choice for rapidly iterating on your app, while letting Expo take care of all the platform-specific code.

To use and test RevenueCat with Expo, you'll need to create an Expo development build. Follow the instructions below and learn more about Expo development builds here.

This guide is specific to Expo, but you may also find our React Native guide useful.

## Create an Expo development build

### Set up the Expo project
You can use an existing Expo project, or create a new one.

This command will create a default project with example code, and install the Expo CLI as a dependency:

```bash
npx create-expo-app@latest
```

Change to the project directory:

```bash
cd <expo-project-directory>
```

Install the expo-dev-client:

```bash
npx expo install expo-dev-client
```

### Install RevenueCat's SDKs
Install RevenueCat's `react-native-purchases` for core functionality and `react-native-purchases-ui` for UI components like Paywalls, Customer Center, and more.

Either run:

```bash
npx expo install react-native-purchases react-native-purchases-ui
```

or update your package.json with the latest package versions:

```json
{
  "dependencies": {
    "react-native-purchases": "latest_version",
    "react-native-purchases-ui": "latest_version"
  }
}
```

After installing RevenueCat's SDKs, you must run the full build process as described below in the Testing your app section to ensure all dependencies are installed. Hot reloading without building will result in errors, such as:

`Invariant Violation: new NativeEventEmitter() requires a non-null argument.`

## RevenueCat Dashboard Configuration

### Configure a new project
RevenueCat projects are top-level containers for your apps, products, entitlements, paywalls, and more. If you don't already have a RevenueCat project for your app, create one here.

### Connect to a Store (Apple, Google, Web, etc.)
Depending on which platform you're building for, you'll need to connect your RevenueCat project to one, or multiple, stores. Set up your project's supported stores here.

### Add Products
For each store you're supporting, you'll need to add the products you plan on offering to your customers. Set up your products for each store here.

### Create an Entitlement
An entitlement represents a level of access, features, or content that a customer is "entitled" to. When customers purchase a product, they're granted an entitlement. Create an entitlement here. Then, attach your products to your new entitlement.

### Create an Offering
An offering is a collection of products that are "offered" to your customers on your paywall. Create an offering for your products here.

### Configure a Paywall
A paywall is where your customers can purchase your products. RevenueCat's Paywalls allow you to remotely build and configure your paywall without any code changes or app updates. Create a paywall here.

## RevenueCat SDK Configuration

### Initialize the SDK
Once you've installed the RevenueCat SDK, you'll need to configure it. Add the following code to the entry point of your app and be sure to replace `<revenuecat_project_platform_api_key>` with your project's API keys.

More information about configuring the SDK can be found here.

```javascript
import { Platform } from 'react-native';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

//...

export default function App() {

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: <revenuecat_project_apple_api_key>});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: <revenuecat_project_google_api_key>});

      // OR: if building for Amazon, be sure to follow the installation instructions then:
       Purchases.configure({ apiKey: <revenuecat_project_amazon_api_key>, useAmazon: true });
    }

  }, []);
}
```

### Identify a user and check subscription status
RevenueCat is the single source of truth for your customer's subscription status across all platforms. Learn more about the different ways to identify your customers to RevenueCat here.

Then, check the customer's subscription status by fetching the CustomerInfo object:

```javascript
try {
  const customerInfo = await Purchases.getCustomerInfo();
  // access latest customerInfo
} catch (e) {
 // Error fetching customer info
}
```

and inspecting the entitlements object to see if the customer is subscribed to your entitlement:

```javascript
if(typeof customerInfo.entitlements.active[<my_entitlement_identifier>] !== "undefined") {
  // Grant user "pro" access
}
```

### Present a paywall
If the customer is not subscribed to your entitlement, you can present a paywall to them where they can purchase your products.

There are several ways to present a paywall in Expo, each with different use cases, so please review the React Native Paywalls documentation.

## Testing your app
To test, we'll use EAS to build the app for the simulator. You'll need to sign up at expo.dev and use the account below.

For more information about EAS, see the EAS docs.

You can also follow these instructions on Expo's docs: https://docs.expo.dev/tutorial/eas/configure-development-build/#initialize-a-development-build

Get started by installing the EAS-CLI:

```bash
npm install -g eas-cli
```

Then login to EAS:

```bash
eas login
```

After logging in, initialize the EAS configuration:

```bash
eas init
```

Then run the following command, which will prompt you to select the platforms you'd like to configure for EAS Build.

```bash
eas build:configure
```

### Testing on iOS simulator
Next, you'll need to update eas.json with the simulator build profile as described here.

Your eas.json file might look like this:

```json
{
  "cli": {
    "version": ">= 7.3.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {},
    "ios-simulator": {
      "extends": "development",
      "ios": {
        "simulator": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

Next, build the app for the simulator:

```bash
eas build --platform ios --profile ios-simulator
```

Building creates a container app with your installed dependencies. Once the build completes and you run it on the device (or simulator, in this case), the app will hot reload with your local changes during development.

Enter your app's bundle ID, matching your RevenueCat config and App Store Connect. Once the build completes, Expo will ask if you want to open the app in the simulator. Choose yes, and it'll launch the simulator with your app.

After your app is running, you'll need to start the Expo server:

```bash
npx expo start
```

Finally, choose the local development server in the iOS simulator.

### Testing on Android device or emulator
To test on an Android device, you'll need to build the app for a physical device or Android emulator as described here.

Please ensure that developmentClient in your eas.json file is set to true under the build.development profile. Then, build the app:

```bash
eas build --platform android --profile development
```

Enter your app's application ID matches your RevenueCat config and Google Play Console. Choose "Yes" when asked if you want to create a new Android Keystore.

Once the build completes, you can run the application on the device or emulator. To run the app on an Android device, install Expo Orbit, connect your device to your computer, and select your device from the Orbit menu. Alternatively, use the provided QR code method.

To run the app on an Android emulator, choose "Yes" in the terminal after the build completes.

After the app is running, you'll need to start the Expo server:

```bash
npx expo start
```

## Expo Go
Expo Go is a sandbox that allows you to rapidly prototype your app. While it doesn’t support running custom native code—such as the native modules required for in-app purchases—react-native-purchases includes a built-in Preview API Mode specifically for Expo Go.

When your app runs inside Expo Go, react-native-purchases automatically detects the environment and replaces native calls with JavaScript-level mock APIs. This allows your app to load and execute all subscription-related logic without errors, even though real purchases will not function in this mode.

This means you can still preview subscription UIs, test integration flows, and continue development without needing to build a custom development client immediately.

However, to fully test in-app purchases and access real RevenueCat functionality, you must use a development build.

# Detailed Expo Integration Guide

## Introduction
Expo is a framework for building React Native apps. It's a popular choice for rapidly iterating on your app, while letting Expo take care of all the platform-specific code.

To use and test RevenueCat with Expo, you'll need to create an Expo development build. Follow the instructions below and learn more about Expo development builds here.

This guide is specific to Expo, but you may also find our React Native guide useful.

## Create an Expo development build

### Set up the Expo project
You can use an existing Expo project, or create a new one.

This command will create a default project with example code, and install the Expo CLI as a dependency:

```bash
npx create-expo-app@latest
```

Change to the project directory:

```bash
cd <expo-project-directory>
```

Install the expo-dev-client:

```bash
npx expo install expo-dev-client
```

### Install RevenueCat's SDKs
Install RevenueCat's `react-native-purchases` for core functionality and `react-native-purchases-ui` for UI components like Paywalls, Customer Center, and more.

Either run:

```bash
npx expo install react-native-purchases react-native-purchases-ui
```

or update your package.json with the latest package versions:

```json
{
  "dependencies": {
    "react-native-purchases": "latest_version",
    "react-native-purchases-ui": "latest_version"
  }
}
```

After installing RevenueCat's SDKs, you must run the full build process as described below in the Testing your app section to ensure all dependencies are installed. Hot reloading without building will result in errors, such as:

`Invariant Violation: new NativeEventEmitter() requires a non-null argument.`

## RevenueCat Dashboard Configuration

### Configure a new project
RevenueCat projects are top-level containers for your apps, products, entitlements, paywalls, and more. If you don't already have a RevenueCat project for your app, create one here.

### Connect to a Store (Apple, Google, Web, etc.)
Depending on which platform you're building for, you'll need to connect your RevenueCat project to one, or multiple, stores. Set up your project's supported stores here.

### Add Products
For each store you're supporting, you'll need to add the products you plan on offering to your customers. Set up your products for each store here.

### Create an Entitlement
An entitlement represents a level of access, features, or content that a customer is "entitled" to. When customers purchase a product, they're granted an entitlement. Create an entitlement here. Then, attach your products to your new entitlement.

### Create an Offering
An offering is a collection of products that are "offered" to your customers on your paywall. Create an offering for your products here.

### Configure a Paywall
A paywall is where your customers can purchase your products. RevenueCat's Paywalls allow you to remotely build and configure your paywall without any code changes or app updates. Create a paywall here.

## RevenueCat SDK Configuration

### Initialize the SDK
Once you've installed the RevenueCat SDK, you'll need to configure it. Add the following code to the entry point of your app and be sure to replace `<revenuecat_project_platform_api_key>` with your project's API keys.

More information about configuring the SDK can be found here.

```javascript
import { Platform } from 'react-native';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

//...

export default function App() {

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: <revenuecat_project_apple_api_key>});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: <revenuecat_project_google_api_key>});

      // OR: if building for Amazon, be sure to follow the installation instructions then:
       Purchases.configure({ apiKey: <revenuecat_project_amazon_api_key>, useAmazon: true });
    }

  }, []);
}
```

### Identify a user and check subscription status
RevenueCat is the single source of truth for your customer's subscription status across all platforms. Learn more about the different ways to identify your customers to RevenueCat here.

Then, check the customer's subscription status by fetching the CustomerInfo object:

```javascript
try {
  const customerInfo = await Purchases.getCustomerInfo();
  // access latest customerInfo
} catch (e) {
 // Error fetching customer info
}
```

and inspecting the entitlements object to see if the customer is subscribed to your entitlement:

```javascript
if(typeof customerInfo.entitlements.active[<my_entitlement_identifier>] !== "undefined") {
  // Grant user "pro" access
}
```

### Present a paywall
If the customer is not subscribed to your entitlement, you can present a paywall to them where they can purchase your products.

There are several ways to present a paywall in Expo, each with different use cases, so please review the React Native Paywalls documentation.

## Testing your app
To test, we'll use EAS to build the app for the simulator. You'll need to sign up at expo.dev and use the account below.

For more information about EAS, see the EAS docs.

You can also follow these instructions on Expo's docs: https://docs.expo.dev/tutorial/eas/configure-development-build/#initialize-a-development-build

Get started by installing the EAS-CLI:

```bash
npm install -g eas-cli
```

Then login to EAS:

```bash
eas login
```

After logging in, initialize the EAS configuration:

```bash
eas init
```

Then run the following command, which will prompt you to select the platforms you'd like to configure for EAS Build.

```bash
eas build:configure
```

### Testing on iOS simulator
Next, you'll need to update eas.json with the simulator build profile as described here.

Your eas.json file might look like this:

```json
{
  "cli": {
    "version": ">= 7.3.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {},
    "ios-simulator": {
      "extends": "development",
      "ios": {
        "simulator": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

Next, build the app for the simulator:

```bash
eas build --platform ios --profile ios-simulator
```

Building creates a container app with your installed dependencies. Once the build completes and you run it on the device (or simulator, in this case), the app will hot reload with your local changes during development.

Enter your app's bundle ID, matching your RevenueCat config and App Store Connect. Once the build completes, Expo will ask if you want to open the app in the simulator. Choose yes, and it'll launch the simulator with your app.

After your app is running, you'll need to start the Expo server:

```bash
npx expo start
```

Finally, choose the local development server in the iOS simulator.

### Testing on Android device or emulator
To test on an Android device, you'll need to build the app for a physical device or Android emulator as described here.

Please ensure that developmentClient in your eas.json file is set to true under the build.development profile. Then, build the app:

```bash
eas build --platform android --profile development
```

Enter your app's application ID matches your RevenueCat config and Google Play Console. Choose "Yes" when asked if you want to create a new Android Keystore.

Once the build completes, you can run the application on the device or emulator. To run the app on an Android device, install Expo Orbit, connect your device to your computer, and select your device from the Orbit menu. Alternatively, use the provided QR code method.

To run the app on an Android emulator, choose "Yes" in the terminal after the build completes.

After the app is running, you'll need to start the Expo server:

```bash
npx expo start
```

## Expo Go
Expo Go is a sandbox that allows you to rapidly prototype your app. While it doesn’t support running custom native code—such as the native modules required for in-app purchases—react-native-purchases includes a built-in Preview API Mode specifically for Expo Go.

When your app runs inside Expo Go, react-native-purchases automatically detects the environment and replaces native calls with JavaScript-level mock APIs. This allows your app to load and execute all subscription-related logic without errors, even though real purchases will not function in this mode.

This means you can still preview subscription UIs, test integration flows, and continue development without needing to build a custom development client immediately.

However, to fully test in-app purchases and access real RevenueCat functionality, you must use a development build.
