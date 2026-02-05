import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '../store/userStore';
import { userApi } from '../api/client';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inner provider that uses Clerk hooks
function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken: getClerkToken, signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { setUser, setAuthenticated, logout } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
      setAuthenticated(isSignedIn);
      
      if (isSignedIn && clerkUser) {
        // Sync user data from backend
        syncUserData();
      }
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  const syncUserData = async () => {
    try {
      const token = await getClerkToken();
      if (token) {
        await SecureStore.setItemAsync('clerk-token', token);
        
        // Fetch user profile from backend
        const profile = await userApi.getProfile();
        setUser(profile.data);
        
        // Fetch user stats
        const stats = await userApi.getStats();
        useUserStore.getState().setStats(stats.data);
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      await SecureStore.deleteItemAsync('clerk-token');
      logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getToken = async () => {
    const token = await getClerkToken();
    if (token) {
      await SecureStore.setItemAsync('clerk-token', token);
    }
    return token;
  };

  const value = {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded || isLoading,
    user: clerkUser,
    signOut,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Main provider that wraps with ClerkProvider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </ClerkProvider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
