import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { cloudflare } from '../app/lib/cloudflare';
import { User, SubscriptionPlan } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; status?: string }>;
  verifySignup: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  resetPassword: (code: string, newPassword: string) => Promise<boolean>;
  upgradePlan: (newPlan: 'Starter' | 'Professional' | 'Business' | 'Enterprise') => Promise<boolean>;
  getSubscriptionPlans: () => SubscriptionPlan[];
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  /* 
     We use the dedicated hooks from Clerk instead of accessing client directly.
     This prevents "Cannot read properties of undefined (reading 'signUp')" errors
     if the client object is not yet fully initialized.
  */
  const { isLoaded: clerkLoaded, userId, getToken, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  
  const [user, setUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = !!userId;
  // Wait for all Clerk hooks to be loaded
  const loading = !clerkLoaded || !userLoaded || !signInLoaded || !signUpLoaded || profileLoading;

  useEffect(() => {
    // ... (rest of profile sync logic remains same)
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
              onboardingComplete: !!(profile.monthly_income && profile.monthly_income > 0),
              businessIndustry: profile.business_industry
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
    if (!signInLoaded || !signIn) return false;
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Clerk login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; status?: string }> => {
    if (!signUpLoaded || !signUp) return { success: false };
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return { success: true, status: 'complete' };
      } else if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return { success: true, status: 'pending_verification' };
      }
      return { success: false, status: result.status || 'unknown' };
    } catch (error) {
      console.error('Clerk signup error:', error);
      throw error;
    }
  };

  const verifySignup = async (code: string): Promise<boolean> => {
    if (!signUpLoaded || !signUp) return false;
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Clerk verify error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (signOut) {
        await signOut();
    }
    setUser(null);
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    if (!signInLoaded || !signIn) return false;
    try {
      await signIn.create({
        identifier: email,
        strategy: 'reset_password_email_code',
      });
      return true;
    } catch (error) {
      console.error('Clerk forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (code: string, newPassword: string): Promise<boolean> => {
    if (!signInLoaded || !signIn) return false;
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        // Automatically sign in the user after password reset
        await setActive({ session: result.createdSessionId });
        return true;
      }
      console.warn('Clerk reset password status:', result.status);
      return false;
    } catch (error) {
      console.error('Clerk reset password error:', error);
      throw error;
    }
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
        console.log('[AuthContext] Fetching profile for refresh...');
        const profile = await cloudflare.getProfile(userId, idToken);
        console.log('[AuthContext] Refreshed profile data:', JSON.stringify(profile));
        
        if (profile && profile.user_id) {
          const newOnboardingStatus = !!(profile.monthly_income && profile.monthly_income > 0);
          console.log(`[AuthContext] Updating user state. Monthly Income: ${profile.monthly_income}, Onboarding Complete: ${newOnboardingStatus}`);
          
          setUser(prev => prev ? {
            ...prev,
            name: profile.name || prev.name,
            plan: (profile.plan || prev.plan) as any,
            onboardingComplete: newOnboardingStatus,
            businessIndustry: profile.business_industry || prev.businessIndustry
          } : null);
        } else {
            console.warn('[AuthContext] Profile refresh returned empty or invalid data');
        }
      }
    } catch (e) {
      console.error('[AuthContext] Error refreshing profile:', e);
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
          familySharing: false,
          maxDevices: 3
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
          familySharing: true,
          maxDevices: 5
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
          familySharing: true,
          maxDevices: 10
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
    sendPasswordResetEmail,
    resetPassword,
    upgradePlan,
    getSubscriptionPlans,
    refreshProfile,
    getToken,
    verifySignup
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