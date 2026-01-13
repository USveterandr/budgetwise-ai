# BudgetWise AI - Personal Finance Tracker

This is a personal finance tracking application built with Expo that helps users manage their income, expenses, and budgets with AI-powered insights.

## Tech Stack

- **Frontend:** Expo (React Native), TypeScript
- **Authentication:** Firebase Authentication (Email/Password & Google OAuth)
- **AI Engine:** Google Gemini API (`gemini-1.5-pro` for chat, `gemini-1.5-flash` for vision)
- **Backend:** Cloudflare Workers (Serverless API)
- **Database:** Cloudflare D1 (SQL at the Edge)
- **Storage:** Cloudflare R2 (Receipt images & Avatars) + Firebase Storage (User profile pictures)
- **State Management:** React Context (`AuthContext`, `FinanceContext`)
- **Notifications:** Expo Notifications

## Architecture Overview

### Frontend (Mobile/Web)
- **Navigation:** `expo-router` (File-based routing in `app/`)
- **Styling:** Standard React Native `StyleSheet` and `expo-linear-gradient`
- **Data Flow:** Context providers sync with both Firebase and Cloudflare D1

### Authentication Flow
1. User authenticates via Firebase (Email/Password or Google OAuth)
2. Firebase provides user authentication and profile management
3. User financial data is stored in Cloudflare D1 for performance
4. Profile pictures stored in Firebase Storage

### Backend (API)
- **Platform:** Cloudflare Workers (`backend/`)
- **Security:** Request validation and user-based data isolation
- **API Pattern:** RESTful endpoints handling JSON data

## Features

- **Dashboard Overview**: Real-time financial snapshot with net worth, income, expenses, and savings rate
- **Transaction Management**: Add, view, and categorize income and expenses
- **Budget Planning**: Set category-based spending limits with progress tracking
- **Investment Portfolio**: Track stocks, bonds, ETFs, crypto, and other investments
- **Budget Alerts**: Get notified when you reach 80% and 100% of your budget limits
- **Financial Reports**: Visualize spending patterns and trends
- **AI Insights**: Personalized financial recommendations
- **Receipt Scanner**: Scan receipts using your camera to automatically extract transaction details

## Receipt Scanner (How it Works)

The receipt scanner leverages Gemini 1.5 Flash's multimodal capabilities to process images directly:

1.  **Capture:** User takes a photo using `expo-camera`.
2.  **Preprocessing:** Image is resized and converted to Base64.
3.  **AI Analysis:** Sent to Gemini Vision with a prompt to extract:
    *   Merchant Name
    *   Date
    *   Total Amount
    *   Line Items
    *   Category (Auto-classified)
4.  **Verification:** User reviews the extracted data before saving to D1.

## AI Insights Implementation

We use `gemini-1.5-pro` to provide context-aware financial advice.

- **Context Injection:** The AI is fed a summary of the user's current financial state (Net Worth, Recent Transactions, Budget Status) with every prompt.
- **Privacy:** Only anonymized financial data is sent to the model. No PII (Personally Identifiable Information) is shared in the prompt context.
- **Capabilities:**
    - Spending anomaly detection
    - Budget overrun predictions
    - Personalized savings tips

## Project Structure

```
├── app/                  # Expo Router pages
│   ├── (auth)/           # Authentication screens (Login, Signup)
│   ├── (tabs)/           # Main app tabs (Dashboard, Budget, etc.)
│   └── onboarding/       # New user setup flow
├── backend/              # Cloudflare Worker API
├── components/           # Reusable UI components
├── context/              # Global state (Auth, Finance)
├── services/             # API clients (Gemini, Cloudflare)
└── constants/            # App-wide constants (Colors, Layout)
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   Create a `.env` file in the root directory with the following variables (see `.env.example`):

   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here

   # Google Gemini API Key (get from https://aistudio.google.com/)
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Backend URL (if running local worker or deployed)
   EXPO_PUBLIC_API_URL=https://your-worker.workers.dev
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Production Deployment

For detailed production build and deployment instructions for iOS, Android, and Web, see [PRODUCTION_BUILD_GUIDE.md](./PRODUCTION_BUILD_GUIDE.md).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.