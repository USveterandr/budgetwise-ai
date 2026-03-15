# OpenCode Interaction Prompts for BudgetWise AI

Use these prompts with **OpenCode** (or similar AI coding agents) to accelerate development, refactor components, or add new luxury-tier features to your application.

---

## 1. Feature Expansion Prompts
**Use these for adding new modules while maintaining the premium design system.**

### Add a Debt Snowball Calculator
> "I want to add a 'Debt Snowball Calculator' screen to the `app/(app)` directory. Use the existing luxury theme (Gold/Obsidian/Midnight). It should fetch current debts from `context/FinanceContext.tsx` and allow users to simulate different payoff strategies. Ensure it uses `LinearGradient` and `BlurView` for that premium look. Check `app/(app)/debts.tsx` for reference on how we currently display debt data."

### Implement a Subscription Plan Switcher
> "Create a new component `components/PlanSwitcher.tsx` that allows users to toggle between Monthly and Yearly billing. Integrate it with `RevenueCat` logic found in `services/revenueCat.ts` and `AuthContext.js`. The UI should be extremely premium, using subtle micro-animations when switching and gold accents for the 'Value' pick."

---

## 2. Refactoring & Optimization
**Use these to clean up the code after the recent folder merge.**

### Reconcile (tabs) and (app) Structure
> "We recently merged two project versions. I have an old `app/(tabs)` structure and a new `app/(app)` structure. Please analyze `app/(app)/dashboard.tsx` and see if there are any specific UI features from the old `app/(tabs)/dashboard.tsx` that we should migrate over to the new one to make it 'complete'. Specifically look for the 'Hypnotic' background effects and 'Liquid Flow' transactions."

### Centralize Global Styles
> "Look at the inline styles in `app/(app)/portfolio.tsx` and `app/(app)/dashboard.tsx`. Help me move these repeated style patterns into a centralized `constants/GlobalStyles.ts` or enhance `constants/Colors.ts` so that the 'Glass Card' and 'Luxury Orb' effects can be reused across the entire app with a single line of code."

---

## 3. Backend & Logic Prompts
**Use these for fixing integration issues or adding complex data logic.**

### Sync Firestore with RevenueCat
> "I need to ensure that when a user's subscription status changes in RevenueCat (e.g., they upgrade to Pro), their `plan` field in the Firestore `users` collection is automatically updated. Look at `AuthContext.js` and `components/CustomPaywall.tsx`. How should I restructure the `useEffect` in `AuthContext` to listen for these changes and update the user document?"

### Enhance Receipt Scanner with AI Logic
> "I want to improve the `components/receipts/EnhancedReceiptScanner.tsx`. When a receipt is scanned using Gemini, instead of just saving the raw text, add a step that uses the `geminiService.ts` to automatically assign the transaction to one of our predefined budget categories in `context/FinanceContext.tsx`."

---

## 4. Debugging & Performance
**Use these when you hit errors or the app feels slow.**

### Fix Watchman / iCloud Permission Errors
> "This project is located in iCloud Drive, which sometimes causes 'Watchman' permission errors. Update the `.watchmanconfig` or provide a script that can clear the cache and restart the Expo dev server efficiently without me having to manually kill processes every time."

### Optimize Chart Rendering
> "The charts in `app/(app)/analyze.tsx` feel a bit sluggish on low-end devices. Analyze my use of `recharts` (or your current charting library) and suggest optimizations, like memoizing the data transformation or using a more lightweight SVG-based approach specifically for the mobile view."

---

## 5. Deployment & Production Tips
> "Provide a plan to automate my `firebase deploy` process. I want a single command `npm run ship` that runs the build, deploys security rules, updates the hosting, and sends a notification to my team that a new version is live."
