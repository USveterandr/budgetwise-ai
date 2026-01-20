import React, { useContext, useState, useEffect } from "react";
import { cloudflare } from "./app/lib/cloudflare";
import { tokenCache } from "./utils/tokenCache";
import { revenueCat } from "./services/revenueCatService";

const TOKEN_KEY = "budgetwise_jwt_token";

const AuthContext = React.createContext({
    currentUser: null,
    userProfile: null,
    isAuthenticated: false,
    loading: true,
    login: async (email, password) => { },
    signup: async (email, password, name) => { },
    resetPassword: async (email) => { },
    confirmPasswordReset: async (token, newPassword) => { },
    logout: async () => { },
    refreshProfile: async () => { }
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
        if (__DEV__) console.log("[AuthContext] Initializing session...");
        try {
            const token = await tokenCache.getToken(TOKEN_KEY);
            if (__DEV__) console.log("[AuthContext] Token found:", token ? "YES" : "NO");

            if (token) {
                // Determine user from token or just fetch profile using token
                if (__DEV__) console.log("[AuthContext] Fetching profile...");
                const profile = await cloudflare.getProfile(token);
                if (profile && !profile.error) {
                    if (__DEV__) console.log("[AuthContext] Profile loaded:", profile.email);
                    setUserProfile(profile);
                    setCurrentUser({ uid: profile.user_id, email: profile.email });
                    
                    // Initialize RevenueCat
                    await revenueCat.configure(profile.user_id);
                    // Check if they have an active subscription from the app store that our DB missed
                    const isSubscriber = await revenueCat.getSubscriptionStatus();
                    if (isSubscriber && profile.subscription_status !== 'active') {
                        // Sync back to DB
                        await cloudflare.updateProfile({ subscription_status: 'active' }, token);
                        setUserProfile(prev => ({ ...prev, subscription_status: 'active' }));
                    }

                } else {
                    if (__DEV__) console.log("[AuthContext] Invalid profile or token, logging out");
                    await logout();
                }
            } else {
                if (__DEV__) console.log("[AuthContext] No token found, user is guest");
            }
        } catch (e) {
            if (__DEV__) console.error("[AuthContext] Failed to load user session:", e);
        } finally {
            if (__DEV__) console.log("[AuthContext] Session initialization complete");
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await cloudflare.login(email, password);
        await tokenCache.saveToken(TOKEN_KEY, data.token);

        setCurrentUser({ uid: data.userId, email: email });
        setUserProfile(data.profile);
        
        await revenueCat.configure(data.userId); // Configure purchases on login
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
        await revenueCat.logout();
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

    const upgradeSubscription = async (packageToPurchase) => {
        try {
             // Real Purchase Flow
             const success = await revenueCat.purchasePackage(packageToPurchase);
             
             if (success) {
                const token = await tokenCache.getToken(TOKEN_KEY);
                // Update remote profile
                await cloudflare.updateProfile({ subscription_status: 'active' }, token);
                
                // Update local state
                setUserProfile(prev => ({
                    ...prev,
                    subscription_status: 'active'
                }));
                return true;
             }
             return false;
        } catch (e) {
            console.error('Subscription upgrade failed:', e);
            return false;
        }
    };

    const restoreSubscription = async () => {
        const success = await revenueCat.restorePurchases();
        if (success) {
            const token = await tokenCache.getToken(TOKEN_KEY);
            await cloudflare.updateProfile({ subscription_status: 'active' }, token);
            setUserProfile(prev => ({ ...prev, subscription_status: 'active' }));
            return true;
        }
        return false;
    };

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
        updateProfile,
        upgradeSubscription,
        restoreSubscription
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
