import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Fallback to localStorage for backward compatibility
          const token = localStorage.getItem('userToken');
          if (token) {
            const userData = JSON.parse(localStorage.getItem('userData')) || {
              id: 'user_1',
              firstName: 'User',
              lastName: 'Example',
              email: 'user@example.com'
            };
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              firstName: session.user.user_metadata?.firstName || 'User',
              lastName: session.user.user_metadata?.lastName || 'User'
            });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata?.firstName || 'User',
            lastName: session.user.user_metadata?.lastName || 'User'
          });
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.user_metadata?.firstName || 'User',
          lastName: data.user.user_metadata?.lastName || 'User'
        });
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Also clean up localStorage for backward compatibility
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userTier');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Legacy login method for backward compatibility
  const legacyLogin = (userData, token) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    legacyLogin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};