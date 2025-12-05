import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../app/lib/supabase';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Premium';
  emailVerified: boolean; // Added for email verification
}

interface SubscriptionPlan {
  name: 'Free' | 'Pro' | 'Premium';
  price: number;
  period: 'month' | 'year';
  features: string[];
  limits: {
    accounts: number;
    receiptsPerMonth: number;
    investments: number;
    aiInsights: boolean;
    prioritySupport: boolean;
    familySharing: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  upgradePlan: (newPlan: 'Pro' | 'Premium') => Promise<boolean>;
  getSubscriptionPlans: () => SubscriptionPlan[];
  sendVerificationEmail: (email: string, userId: string) => Promise<boolean>; // Added for email verification
  verifyEmail: (token: string) => Promise<boolean>; // Added for email verification
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // First check if user exists in profiles table
      const { data: profileData } = await supabase.from('profiles').select('*').eq('email', email).single();
      
      if (profileData) {
        // Check if user has verified their email
        if (!profileData.email_verified) {
          setLoading(false);
          throw new Error('Please verify your email before logging in');
        }
        
        // Check if user has a password hash stored
        const { data: authData } = await supabase.from('user_auth').select('password_hash').eq('user_id', profileData.user_id).single();
        
        if (authData && authData.password_hash) {
          // Verify password
          const isValid = await bcrypt.compare(password, authData.password_hash);
          if (isValid) {
            setUser({ 
              id: profileData.user_id, 
              name: profileData.name, 
              email: profileData.email, 
              plan: profileData.plan || 'Free',
              emailVerified: profileData.email_verified || false
            });
            setLoading(false);
            return true;
          }
        }
      }
      
      // Create new user if not exists (demo mode)
      const userId = `user_${Date.now()}`;
      const { data: newUser } = await supabase.from('profiles').insert({ 
        user_id: userId, 
        name: email.split('@')[0], 
        email, 
        plan: 'Pro',
        email_verified: true // For demo purposes, we'll auto-verify
      }).select().single();
      
      if (newUser) {
        // Hash and store password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await supabase.from('user_auth').insert({ user_id: userId, password_hash: hash });
        
        setUser({ 
          id: newUser.user_id, 
          name: newUser.name, 
          email: newUser.email, 
          plan: newUser.plan,
          emailVerified: true
        });
        await createDefaultBudgets(userId);
        setLoading(false);
        return true;
      }
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from('profiles').select('*').eq('email', email).single();
      
      if (existingUser) {
        // User already exists
        setLoading(false);
        return false;
      }
      
      const userId = `user_${Date.now()}`;
      const { data, error } = await supabase.from('profiles').insert({ 
        user_id: userId, 
        name, 
        email, 
        plan: 'Free',
        email_verified: false // New users need to verify email
      }).select().single();
      
      if (data && !error) {
        // Hash and store password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await supabase.from('user_auth').insert({ user_id: userId, password_hash: hash });
        
        setUser({ 
          id: data.user_id, 
          name: data.name, 
          email: data.email, 
          plan: 'Free',
          emailVerified: false
        });
        
        // Send verification email
        await sendVerificationEmail(email, userId);
        await createDefaultBudgets(userId);
        setLoading(false);
        return true;
      }
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
    return false;
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    try {
      // Check if user exists
      const { data: profileData } = await supabase.from('profiles').select('user_id').eq('email', email).single();
      
      if (profileData) {
        // Generate reset token (in a real app, this would be a secure random token)
        const resetToken = await bcrypt.hash(email + Date.now(), 10);
        const expiry = new Date(Date.now() + 3600000); // 1 hour from now
        
        // Store reset token
        await supabase.from('password_reset_tokens').upsert({
          user_id: profileData.user_id,
          token: resetToken,
          expires_at: expiry.toISOString()
        });
        
        // In a real app, you would send an email here with the reset link
        console.log(`Password reset link: /reset-password?token=${encodeURIComponent(resetToken)}`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      // Verify token
      const { data: tokenData } = await supabase.from('password_reset_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (tokenData) {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        
        // Update password
        await supabase.from('user_auth').update({ password_hash: hash }).eq('user_id', tokenData.user_id);
        
        // Delete used token
        await supabase.from('password_reset_tokens').delete().eq('token', token);
        
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Added for email verification
  const sendVerificationEmail = async (email: string, userId: string): Promise<boolean> => {
    try {
      // Generate verification token
      const verificationToken = await bcrypt.hash(email + userId + Date.now(), 10);
      const expiry = new Date(Date.now() + 86400000); // 24 hours from now
      
      // Store verification token
      await supabase.from('email_verification_tokens').upsert({
        user_id: userId,
        token: verificationToken,
        expires_at: expiry.toISOString()
      });
      
      // In a real app, you would send an email here with the verification link
      console.log(`Verification link: /verify-email?token=${encodeURIComponent(verificationToken)}`);
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Added for email verification
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      // Verify token
      const { data: tokenData } = await supabase.from('email_verification_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (tokenData) {
        // Update user profile to mark email as verified
        const { error } = await supabase.from('profiles').update({ email_verified: true }).eq('user_id', tokenData.user_id);
        
        if (!error) {
          // Update user state if this is the current user
          if (user && user.id === tokenData.user_id) {
            setUser({ ...user, emailVerified: true });
          }
          
          // Delete used token
          await supabase.from('email_verification_tokens').delete().eq('token', token);
          
          return true;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const upgradePlan = async (newPlan: 'Pro' | 'Premium'): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase.from('profiles').update({ plan: newPlan }).eq('user_id', user.id);
      
      if (!error) {
        setUser({ ...user, plan: newPlan });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const getSubscriptionPlans = (): SubscriptionPlan[] => {
    return [
      {
        name: 'Free',
        price: 0,
        period: 'month',
        features: ['Basic budgeting', '5 accounts', 'Monthly reports'],
        limits: {
          accounts: 5,
          receiptsPerMonth: 10,
          investments: 0,
          aiInsights: false,
          prioritySupport: false,
          familySharing: false
        }
      },
      {
        name: 'Pro',
        price: 9.99,
        period: 'month',
        features: ['Unlimited accounts', 'AI insights', 'Receipt scanning', 'Priority support'],
        limits: {
          accounts: Infinity,
          receiptsPerMonth: Infinity,
          investments: Infinity,
          aiInsights: true,
          prioritySupport: true,
          familySharing: false
        }
      },
      {
        name: 'Premium',
        price: 19.99,
        period: 'month',
        features: ['Everything in Pro', 'Investment tracking', 'Tax reports', 'Family sharing'],
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
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading, 
      login, 
      signup, 
      logout,
      sendPasswordResetEmail,
      resetPassword,
      upgradePlan,
      getSubscriptionPlans,
      sendVerificationEmail,
      verifyEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}