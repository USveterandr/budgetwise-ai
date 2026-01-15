import React, { useContext, useState, useEffect } from "react";
import { cloudflare } from "./app/lib/cloudflare";
import { tokenCache } from "./utils/tokenCache";

const TOKEN_KEY = "budgetwise_jwt_token";

const AuthContext = React.createContext({
  currentUser: null,
  userProfile: null,
  isAuthenticated: false,
  loading: true,
  login: async (email, password) => {},
  signup: async (email, password, name) => {},
  resetPassword: async (email) => {},
  logout: async () => {},
  refreshProfile: async () => {} 
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await tokenCache.getToken(TOKEN_KEY);
            if (token) {
                // Determine user from token or just fetch profile using token
                const profile = await cloudflare.getProfile(token);
                if (profile && !profile.error) {
                    setUserProfile(profile);
                    setCurrentUser({ uid: profile.user_id, email: profile.email });
                } else {
                    await logout();
                }
            }
        } catch (e) {
            console.error("Failed to load user session", e);
            // Optionally clear token if invalid
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await cloudflare.login(email, password);
        await tokenCache.saveToken(TOKEN_KEY, data.token);
        
        setCurrentUser({ uid: data.userId, email: email });
        setUserProfile(data.profile);
    };

    const signup = async (email, password, name) => {
        // name is optional
        const data = await cloudflare.signup(email, password, name);
        await tokenCache.saveToken(TOKEN_KEY, data.token);
        
        setCurrentUser({ uid: data.userId, email: email });
        setUserProfile({ user_id: data.userId, email, name }); 
    };

    const resetPassword = async (email) => {
        return await cloudflare.resetPassword(email);
    };

    const confirmPasswordReset = async (token, newPassword) => {
        return await cloudflare.confirmPasswordReset(token, newPassword);
    };

    const logout = async () => {
        await tokenCache.deleteToken(TOKEN_KEY);
        setCurrentUser(null);
        setUserProfile(null);
    };
    
    const refreshProfile = async () => {
        try {
             const token = await tokenCache.getToken(TOKEN_KEY);
             if (token) {
                 const profile = await cloudflare.getProfile(token);
                 setUserProfile(profile);
             }
        } catch (e) {
            console.error(e);
        }
    }

    const updateProfile = async (updates) => {
        try {
            const token = await tokenCache.getToken(TOKEN_KEY);
            const success = await cloudflare.updateProfile(token, updates);
            if (success) {
                // Optimistic update or fetch fresh
                 setUserProfile(prev => ({ ...prev, ...updates }));
                 return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    const getToken = async () => {
        return await tokenCache.getToken(TOKEN_KEY);
    }

    const getTrialStatus = () => {
        if (!userProfile) return { daysLeft: 7, isExpired: false, isPaid: false };
        
        if (userProfile.subscription_status === 'active') {
             return { daysLeft: 999, isExpired: false, isPaid: true };
        }

        const start = new Date(userProfile.trial_start_date || userProfile.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const daysLeft = Math.max(0, 7 - diffDays);

        return { 
            daysLeft, 
            isExpired: diffDays > 7, // Strict > 7 check
            isPaid: false 
        };
    };

    const trialStatus = getTrialStatus();

    const value = {
        currentUser,
        userProfile,
        isAuthenticated: !!currentUser,
        loading,
        trialStatus,
        tokenCache,
        getToken,
        login,
        signup,
        resetPassword,
        confirmPasswordReset,
        logout,
        refreshProfile,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
