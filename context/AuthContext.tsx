import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '../app/lib/supabase';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-expo';
import { User, SubscriptionPlan } from '../types';

// Types are now imported from ../types

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  upgradePlan: (newPlan: 'Starter' | 'Professional' | 'Business' | 'Enterprise') => Promise<boolean>;
  getSubscriptionPlans: () => SubscriptionPlan[];
  sendVerificationEmail: (email: string, userId: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  console.log('AuthProvider initialized');

  // Sync Clerk user to local state and Supabase
  useEffect(() => {
    const syncUser = async () => {
      if (!isClerkLoaded) return;

      if (clerkUser) {
        const plan = (clerkUser.publicMetadata?.plan as any) || (clerkUser.unsafeMetadata?.plan as any) || 'Starter';
        const email = clerkUser.primaryEmailAddress?.emailAddress || '';
        const name = clerkUser.fullName || email.split('@')[0];
        
        const newUser: User = {
          id: clerkUser.id,
          name,
          email,
          plan,
          emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified'
        };

        setUser(newUser);
        
        // Sync to Supabase profiles table to ensure data integrity for other tables
        try {
          const { data: existingProfile } = await supabase.from('profiles').select('*').eq('user_id', clerkUser.id).single();
          
          if (!existingProfile) {
            await supabase.from('profiles').insert({
              user_id: clerkUser.id,
              name,
              email,
              plan,
              email_verified: newUser.emailVerified
            });
            await createDefaultBudgets(clerkUser.id);
          } else {
            // Update plan if changed in Clerk
            if (existingProfile.plan !== plan) {
              await supabase.from('profiles').update({ plan }).eq('user_id', clerkUser.id);
            }
          }
        } catch (error) {
          console.error('Error syncing to Supabase:', error);
        }

        // Sync to Firebase Firestore
        try {
          const userRef = doc(db, 'profiles', clerkUser.id);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              user_id: clerkUser.id,
              name,
              email,
              plan,
              email_verified: newUser.emailVerified,
              created_at: new Date().toISOString()
            });
          } else {
            const currentData = userSnap.data();
            if (currentData.plan !== plan) {
              await updateDoc(userRef, { plan });
            }
          }
        } catch (error) {
          console.error('Error syncing to Firebase:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
      setInitialized(true);
    };

    syncUser();
  }, [clerkUser, isClerkLoaded]);

  // Deprecated: Login is handled by Clerk hooks in components
  const login = async (email: string, password: string): Promise<boolean> => {
    console.warn('AuthContext.login is deprecated. Use useSignIn from @clerk/clerk-expo instead.');
    return true;
  };

  // Deprecated: Signup is handled by Clerk hooks in components
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    console.warn('AuthContext.signup is deprecated. Use useSignUp from @clerk/clerk-expo instead.');
    return true;
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    // Clerk handles this via their own flow usually, but we can stub it or use Clerk's API if needed
    console.log('Password reset requested for:', email);
    return true;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    return true;
  };

  const sendVerificationEmail = async (email: string, userId: string): Promise<boolean> => {
    return true;
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    return true;
  };

  const upgradePlan = async (newPlan: 'Starter' | 'Professional' | 'Business' | 'Enterprise'): Promise<boolean> => {
    if (!clerkUser) return false;
    
    try {
      // In a real app, this would be done via Clerk's backend API or a webhook from a payment provider (Stripe).
      // Client-side update of publicMetadata is not allowed for security.
      // However, we can update unsafeMetadata for demo purposes if the user hasn't set up a backend.
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          plan: newPlan
        }
      });
      
      // Also update local state immediately for UI responsiveness
      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
      
      // Sync to Supabase
      await supabase.from('profiles').update({ plan: newPlan }).eq('user_id', clerkUser.id);
      
      return true;
    } catch (e) {
      console.error('Error upgrading plan:', e);
    }
    return false;
  };

  const getSubscriptionPlans = (): SubscriptionPlan[] => {
    return [
      {
        name: 'Starter',
        price: 12.99,
        period: 'month',
        features: [
          'Perfect for individuals',
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
          'Ideal for couples & small businesses',
          'Everything in Starter',
          'Unlimited receipt scanning',
          'Advanced AI insights',
          'Investment tracking (20 assets)',
          'Custom budget categories',
          'Priority email support',
          'Tax preparation assistance'
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
          'Designed for medium-sized businesses',
          'Everything in Professional',
          'Unlimited investment tracking',
          'Team collaboration tools',
          'Multi-user access (10 users)',
          'Advanced reporting & analytics',
          'Dedicated account manager',
          'API access',
          'Custom integrations'
        ],
        limits: {
          accounts: Infinity,
          receiptsPerMonth: Infinity,
          investments: Infinity,
          aiInsights: true,
          prioritySupport: true,
          familySharing: true
        }
      },
      {
        name: 'Enterprise',
        price: 99.99,
        period: 'month',
        features: [
          'Built for large corporations',
          'Everything in Business',
          'Unlimited users',
          'Advanced security features',
          'Custom reporting dashboards',
          '24/7 priority phone support',
          'SLA guarantee',
          'Personalized onboarding',
          'Custom feature development'
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

  const createDefaultBudgets = async (userId: string) => {
    const month = new Date().toISOString().slice(0, 7);
    const defaultBudgets = [
      { user_id: userId, category: 'Housing', budget_limit: 2000, spent: 0, month },
      { user_id: userId, category: 'Food', budget_limit: 600, spent: 0, month },
      { user_id: userId, category: 'Transportation', budget_limit: 400, spent: 0, month },
      { user_id: userId, category: 'Entertainment', budget_limit: 300, spent: 0, month },
      { user_id: userId, category: 'Utilities', budget_limit: 250, spent: 0, month },
    ];
    await supabase.from('budgets').insert(defaultBudgets);
    
    // Sync to Firestore
    try {
      for (const budget of defaultBudgets) {
        const budgetRef = doc(db, 'budgets', `${userId}_${budget.category}_${month}`);
        await setDoc(budgetRef, budget);
      }
    } catch (error) {
      console.error('Error syncing default budgets to Firebase:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  console.log('AuthProvider rendering with user:', user);

  const contextValue = useMemo(() => ({
    user, 
    isAuthenticated: !!user, 
    loading, 
    initialized,
    login, 
    signup, 
    logout,
    sendPasswordResetEmail,
    resetPassword,
    upgradePlan,
    getSubscriptionPlans,
    sendVerificationEmail,
    verifyEmail
  }), [user, loading, initialized]);

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