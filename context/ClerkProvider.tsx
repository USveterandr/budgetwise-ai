import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Make sure the publishable key is available
const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey as string || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file or in your expo config.'
  );
}

// Token cache for web
const tokenCache = {
  getToken: async (key: string): Promise<string | null | undefined> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return undefined;
    }
  },
  saveToken: async (key: string, value: string): Promise<void | undefined> => {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return undefined;
    }
  },
};

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      {children}
    </ClerkProvider>
  );
}