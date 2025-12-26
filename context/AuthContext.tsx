import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { cloudflare } from '../app/lib/cloudflare';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
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
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  upgradePlan: (newPlan: 'Starter' | 'Professional' | 'Business' | 'Enterprise') => Promise<boolean>;
  getSubscriptionPlans: () => SubscriptionPlan[];
  sendVerificationEmail: (email: string, userId: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  console.log('AuthProvider initialized with Firebase Auth');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Sync with Firestore to get extra data like 'plan'
        try {
          const userRef = doc(db, 'profiles', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let plan = 'Starter';
          let emailVerified = firebaseUser.emailVerified;
          let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

          if (userSnap.exists()) {
            const data = userSnap.data();
            plan = data.plan || 'Starter';
          } else {
            // First time login/signup sync
            await setDoc(userRef, {
              user_id: firebaseUser.uid,
              name,
              email: firebaseUser.email,
              plan,
              email_verified: emailVerified,
              created_at: new Date().toISOString()
            });
            await createDefaultBudgets(firebaseUser.uid);
          }

          let onboardingComplete = false;

          // Sync with Cloudflare profiles table
          try {
            const existingProfile = await cloudflare.getProfile(firebaseUser.uid);
            if (!existingProfile || !existingProfile.user_id) {
              await cloudflare.updateProfile({
                user_id: firebaseUser.uid,
                name,
                email: firebaseUser.email,
                plan,
                email_verified: emailVerified
              });
            } else {
              if (existingProfile.plan !== plan) {
                await cloudflare.updateProfile({ 
                  ...existingProfile,
                  plan 
                });
              }
              // If monthly_income exists and is > 0, consider onboarding complete
              if (existingProfile.monthly_income && existingProfile.monthly_income > 0) {
                onboardingComplete = true;
              }
            }
          } catch (error) {
            console.error('Error syncing to Cloudflare:', error);
          }

          const newUser: User = {
            id: firebaseUser.uid,
            name,
            email: firebaseUser.email || '',
            plan: plan as any,
            emailVerified,
            onboardingComplete
          };

          console.log('Setting user in AuthContext:', newUser.id, 'Onboarding complete:', newUser.onboardingComplete);
          setUser(newUser);

        } catch (error) {
          console.error('Error in onAuthStateChanged profile sync:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Firebase login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      return true;
    } catch (error) {
      console.error('Firebase signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Firebase reset email error:', error);
      return false;
    }
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
    if (!auth.currentUser) return false;
    
    try {
      const userRef = doc(db, 'profiles', auth.currentUser.uid);
      await updateDoc(userRef, { plan: newPlan });
      
      // Update local state
      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
      
      // Sync to Cloudflare
      const profile = await cloudflare.getProfile(auth.currentUser.uid);
      await cloudflare.updateProfile({ ...profile, plan: newPlan });
      
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

    for (const budget of defaultBudgets) {
      await cloudflare.addBudget(budget);
    }
    
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
      await firebaseSignOut(auth);
      setUser(null);
      console.log('User logged out from Firebase');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    
    try {
      const firebaseUser = auth.currentUser;
      const userRef = doc(db, 'profiles', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      let plan = 'Starter';
      if (userSnap.exists()) {
        plan = userSnap.data().plan || 'Starter';
      }

      let onboardingComplete = false;
      const profile = await cloudflare.getProfile(firebaseUser.uid);
      if (profile && profile.monthly_income && profile.monthly_income > 0) {
        onboardingComplete = true;
      }

      const updatedUser: User = {
        id: firebaseUser.uid,
        name: profile?.name || firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        plan: plan as any,
        emailVerified: firebaseUser.emailVerified,
        onboardingComplete
      };

      console.log('Refreshing user in AuthContext:', updatedUser.id, 'Onboarding complete:', updatedUser.onboardingComplete);
      setUser(updatedUser);
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

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
    verifyEmail,
    refreshProfile
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