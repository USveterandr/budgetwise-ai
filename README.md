# BudgetWise AI - Personal Finance Tracker

This is a personal finance tracking application built with Expo that helps users manage their income, expenses, and budgets with AI-powered insights.

## Features

- **Dashboard Overview**: Real-time financial snapshot with net worth, income, expenses, and savings rate
- **Transaction Management**: Add, view, and categorize income and expenses
- **Budget Planning**: Set category-based spending limits with progress tracking
- **Investment Portfolio**: Track stocks, bonds, ETFs, crypto, and other investments
- **Budget Alerts**: Get notified when you reach 80% and 100% of your budget limits
- **Financial Reports**: Visualize spending patterns and trends
- **AI Insights**: Personalized financial recommendations
- **Receipt Scanner**: Scan receipts using your camera to automatically extract transaction details

## New Feature: Receipt Scanner

The receipt scanner allows users to:
- Capture receipts using their device's camera
- Automatically extract transaction details (amount, date, merchant)
- Pre-fill transaction forms with scanned data
- Quickly add expenses without manual data entry

Access the scanner from:
1. Dashboard quick actions (Scan button)
2. Transactions screen (Scan button)

## New Feature: Investment Portfolio

The investment portfolio feature allows users to:
- Track various investment types (stocks, bonds, ETFs, crypto, real estate)
- View portfolio performance with gain/loss calculations
- See asset allocation by investment type
- Add, edit, and delete investments
- Monitor current values vs. purchase prices

Access the portfolio from:
1. Dashboard quick actions (Invest button)
2. Portfolio tab in the navigation

## New Feature: Budget Alerts

The budget alerts feature notifies users when they reach critical budget thresholds:
- Receive notifications when you've used 80% of your budget (warning)
- Receive notifications when you've exceeded 100% of your budget (alert)
- View all notifications in the dedicated notifications center
- Mark notifications as read to keep track of what you've seen

Access notifications from:
1. Notification badge on the dashboard
2. Notifications tab in the navigation

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Clerk API Keys (get from https://dashboard.clerk.dev/)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # Google Gemini API Key (get from https://aistudio.google.com/)
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
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