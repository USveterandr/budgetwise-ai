# Firebase Studio Prompts for BudgetWise AI

Use these prompts in **Firebase Studio**, **Genkit**, or **AI Logic** sections of the Firebase Console to build and refine your application.

---

## 1. Master Project Context Prompt
**Use this first to give the AI context about your entire application.**

> "I am building BudgetWise AI, a high-end personal finance and budgeting application using Expo (React Native), Firebase (Firestore, Auth, Storage), and Google Gemini. The app features an AI Financial Advisor, an OCR-powered Receipt Scanner, and advanced Budget Planning tools. My tech stack includes React Native, NativeWind, and RevenueCat for subscriptions. Please help me architect the Firebase backend to support real-time transaction tracking, cross-platform synchronization, and AI-driven financial insights."

---

## 2. AI Advisor System Prompt (Genkit / AI Logic)
**Use this for the 'AI Advisor' feature to ensure it acts as a professional financial coach.**

> "You are the BudgetWise AI Financial Advisor, a world-class certified financial planner. Your goal is to help users save money, invest wisely, and understand their spending habits.
> 
> **Instructions:**
> - Access user transaction data securely to provide personalized advice.
> - Maintain a professional, encouraging, and data-driven tone.
> - Provide actionable tips (e.g., 'Switching to a generic brand for groceries could save you $40/month').
> - Use the 50/30/20 rule as a baseline for budget recommendations.
> - Highlight potential overspending in specific categories like 'Dining Out' or 'Subscriptions'.
> - Always include a disclaimer that you provide educational insights, not legal or tax advice."

---

## 3. Receipt OCR Prompt (Gemini Vision)
**Use this for the 'Enhanced Receipt Scanner' to extract structured data from images.**

> "Analyze this receipt image and extract the following information in a JSON format:
> - merchant_name: The name of the store or vendor.
> - total_amount: The final amount paid.
> - currency: The currency (e.g., USD, EUR).
> - transaction_date: The date on the receipt (YYYY-MM-DD).
> - category: Suggest a finance category (e.g., Groceries, Transport, Entertainment).
> - line_items: An array of objects with { item: string, price: number }.
> 
> If any field is unclear, return null for that field. Ensure the output is valid JSON."

---

## 4. Budget Suggestion Logic Prompt
**Use this to generate personalized budgets based on user profile data.**

> "Based on a user's monthly income of {{income}} and their primary financial goal of {{goal}}, generate a comprehensive monthly budget recommendation. 
> Break it down into:
> 1. Essential Expenses (Needs) - 50%
> 2. Discretionary Spending (Wants) - 30%
> 3. Savings & Debt Repayment - 20%
> 
> Provide specific category limits and explain the reasoning behind each allocation based on current economic trends."

---

## 5. Firestore Security Rules Architect Prompt
**Use this to generate or refine your `firestore.rules`.**

> "Generate Firestore security rules for a finance app where:
> - Users can only read and write their own 'profiles', 'transactions', and 'budgets'.
> - Each document must have a 'userId' field that matches the authenticated user's UID.
> - Transactions must have a valid 'amount' (number) and 'date' (timestamp).
> - Prevent any batch deletes that exceed 10 records for security.
> - Allow the Firebase AI Extension to read transaction history for insight generation."

---

## Next Steps to "Create This App":
1. **Initialize Firebase Features**: Run `firebase init` if not already done.
2. **Deploy to Hosting**: Build the web version and run `firebase deploy --only hosting`.
3. **Set Up SHA Keys**: For Android Google Sign-in to work, you must add your SHA-1 and SHA-256 keys to the Firebase Console.
4. **Link RevenueCat**: Ensure your Firebase UID is used as the App User ID in RevenueCat to sync subscription status accurately.
