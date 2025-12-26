# Onboarding Workflow Fix

## Problem
The onboarding workflow had a race condition where the application would attempt to navigate to the dashboard before the user's profile update was fully propagated to the application state. This could cause the `RootLayout` to redirect the user back to the onboarding screen, creating a loop or a confusing user experience.

## Solution
Modified `app/onboarding.tsx` to:
1.  **Remove manual navigation:** The `handleComplete` function no longer manually navigates to the dashboard immediately after the API call.
2.  **Add State Listener:** Added a `useEffect` hook that watches for changes in `user.onboardingComplete`. When this flag becomes true, the component automatically navigates to the dashboard.
3.  **Add Safety Checks:** Added a check to ensure `user.id` is available before attempting to update the profile.

## Verification
1.  Log in to the application.
2.  If you are redirected to the onboarding screen, enter your details (Name, Income, etc.).
3.  Click "Complete Setup".
4.  Verify that a success message appears (or the app simply updates).
5.  Verify that you are automatically redirected to the Dashboard once the update is processed.
