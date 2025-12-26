import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { cloudflare } from '../app/lib/cloudflare';
import { User, SubscriptionPlan } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  upgradePlan: (newPlan: 'Starter' | 'Professional' | 'Business' | 'Enterprise') => Promise<boolean>;
  getSubscriptionPlans: () => SubscriptionPlan[];
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { isLoaded: clerkLoaded, userId, getToken, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { client } = useClerk();
  
  const [user, setUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = !!userId;
  const loading = !clerkLoaded || !userLoaded || profileLoading;

  useEffect(() => {
    const syncProfile = async () => {
      if (clerkLoaded && userId && clerkUser) {
        setProfileLoading(true);
        try {
          const idToken = await getToken();
          if (idToken) {
            let profile = await cloudflare.getProfile(userId, idToken);
            
            // If profile doesn't exist in D1, create it
            if (!profile || !profile.user_id) {
              const email = clerkUser.emailAddresses[0]?.emailAddress;
              const name = clerkUser.fullName || clerkUser.firstName || email?.split('@')[0] || 'User';
              
              await cloudflare.updateProfile({
                user_id: userId,
                name,
                email,
                plan: 'Starter',
                monthly_income: 0,
                savings_rate: 0,
                currency: 'USD'
              }, idToken);
              
              profile = {
                user_id: userId,
                name,
                email,
                plan: 'Starter',
                monthly_income: 0
              };
            }

            setUser({
              id: userId,
              name: profile.name || clerkUser.fullName || 'User',
              email: profile.email || clerkUser.emailAddresses[0]?.emailAddress || '',
              plan: (profile.plan || 'Starter') as any,
              emailVerified: clerkUser.emailAddresses[0]?.verification.status === 'verified',
              onboardingComplete: !!(profile.monthly_income && profile.monthly_income > 0)
            });
          }
        } catch (error) {
          console.error('Error syncing profile with Cloudflare:', error);
        } finally {
          setProfileLoading(false);
          setInitialized(true);
        }
      } else if (clerkLoaded && !userId) {
        setUser(null);
        setInitialized(true);
      }
    };

    syncProfile();
  }, [clerkLoaded, userId, clerkUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await client.signIn.create({
        identifier: email,
        password,
      });
      if (result.status === 'complete') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Clerk login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const result = await client.signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });
      if (result.status === 'complete') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Clerk signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const upgradePlan = async (newPlan: 'Starter' | 'Professional' | 'Business' | 'Enterprise'): Promise<boolean> => {
    if (!userId) return false;
    try {
      const idToken = await getToken();
      if (idToken) {
        const profile = await cloudflare.getProfile(userId, idToken);
        await cloudflare.updateProfile({ ...profile, plan: newPlan }, idToken);
        setUser(prev => prev ? { ...prev, plan: newPlan } : null);
        return true;
      }
    } catch (e) {
      console.error('Error upgrading plan:', e);
    }
    return false;
  };

  const refreshProfile = async () => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const idToken = await getToken();
      if (idToken) {
        const profile = await cloudflare.getProfile(userId, idToken);
        if (profile && profile.user_id) {
          setUser(prev => prev ? {
            ...prev,
            name: profile.name || prev.name,
            plan: (profile.plan || prev.plan) as any,
            onboardingComplete: !!(profile.monthly_income && profile.monthly_income > 0)
          } : null);
        }
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    } finally {
      setProfileLoading(false);
    }
  };

  const getSubscriptionPlans = (): SubscriptionPlan[] => {
    return [
      {
        name: 'Starter',
        price: 12.99,
        period: 'month',
        features: [
          'Basic budgeting tools',
          'Up to 50 receipt scans/month',
          'Essential financial reports',
          'Email support'
        ],
        limits: {
          accounts: Infinity,
          receiptsPerMonth: 50,
          investments: 5,
          aiInsights: true,
          prioritySupport: false,
          familySharing: false
        }
      },
      {
        name: 'Professional',
        price: 29.99,
        period: 'month',
        features: [
          'Unlimited receipt scanning',
          'Advanced AI insights',
          'Investment tracking (20 assets)',
          'Custom budget categories',
          'Priority email support'
        ],
        limits: {
          accounts: Infinity,
          receiptsPerMonth: Infinity,
          investments: 20,
          aiInsights: true,
          prioritySupport: true,
          familySharing: true
        }
      },
      {
        name: 'Business',
        price: 59.99,
        period: 'month',
        features: [
          'Unlimited investment tracking',
          'Team collaboration tools',
          'Multi-user access (10 users)',
          'Advanced reporting & analytics',
          'Dedicated account manager'
        ],
        limits: {
          accounts: Infinity,
          receiptsPerMonth: Infinity,
          investments: Infinity,
          aiInsights: true,
          prioritySupport: true,
          familySharing: true
        }
      }
    ];
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    initialized,
    login,
    signup,
    logout,
    sendPasswordResetEmail: async () => true, // Clerk handles this differently
    upgradePlan,
    getSubscriptionPlans,
    refreshProfile,
    getToken
  }), [user, isAuthenticated, loading, initialized, getToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}