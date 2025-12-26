---
description: how to handle the signup workflow in the budgetwise app
---

# Signup Workflow

This workflow describes the process for a new user to sign up for the BudgetWise AI application.

## 1. Landing Page
- User clicks on **"Create Account"** or **"Start Free Trial"** on the landing page (`app/index.tsx`).
- This navigates the user to the signup screen (`/signup`).

## 2. Signup Screen
- User enters their **Full Name**, **Email**, and **Password**.
- User clicks **"Create Account"**.
- The `handleSignup` function in `app/(auth)/signup.tsx` is called:
  - It validates the input fields.
  - It calls `signUp.create` from `@clerk/clerk-expo` to create a new user in Clerk.
  - Upon success, it calls `signUp.prepareEmailAddressVerification` with `strategy: 'email_code'`.
  - The UI transitions to the **Email Verification** state.

## 3. Email Verification
- User receives a 6-digit code in their email.
- User enters the code and clicks **"Verify Email"**.
- The `onPressVerify` function is called:
  - It calls `signUp.attemptEmailAddressVerification`.
  - If verification is complete (`status === 'complete'`), it calls `setActive` to set the session.
  - The user is then redirected to the dashboard (`/(tabs)/dashboard`).

## 4. Backend Synchronization
- The `AuthContext.tsx` contains a `useEffect` that listens for changes in the Clerk user state.
- When a user is authenticated (`clerkUser` is present):
  - It syncs the user profile to **Supabase** (`profiles` table).
  - It syncs the user profile to **Firebase Firestore** (`profiles` collection).
  - It creates default budget categories for the new user in both Supabase and Firestore.

## 5. Alternative: Google OAuth
- User can click **"Sign Up with Google"** (on supported platforms, currently disabled on web to avoid CAPTCHA issues on localhost).
- This initiates the `googleAuth()` flow.
- Upon success, the session is activated, and the user is redirected to the dashboard.
- The `AuthContext` will handle the synchronization to backends automatically.

## Troubleshooting
- **CAPTCHA issues on localhost**: If using Google OAuth on web/localhost, you may see CAPTCHA errors. Use email signup for local testing.
- **Verification code not received**: Use the **"Resend Code"** functionality.
- **Email already exists**: The user is prompted to login instead.
