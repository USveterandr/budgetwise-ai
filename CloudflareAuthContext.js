import React, { useContext, useState, useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Enable dismissal on iOS
WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

const API_URL = Platform.select({
    web: 'http://localhost:8787',
    default: 'https://budgetwise-backend.isaactrinidadllc.workers.dev'
});

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // Create redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'budget-finance-ai-1',
        path: 'auth/callback'
    });

    useEffect(() => {
        // Load stored auth token on mount
        loadStoredAuth();
    }, []);

    useEffect(() => {
        // Load user profile when we have a token
        if (authToken && currentUser) {
            loadUserProfile();
        }
    }, [authToken, currentUser]);

    async function loadStoredAuth() {
        try {
            const storedToken = await SecureStore.getItemAsync('authToken');
            const storedSessionId = await SecureStore.getItemAsync('sessionId');
            
            if (storedToken) {
                // Verify token is still valid
                const response = await fetch(`${API_URL}/auth/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: storedToken })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.valid) {
                        setAuthToken(storedToken);
                        setSessionId(storedSessionId);
                        setCurrentUser({
                            id: data.userId,
                            email: data.email
                        });
                    } else {
                        // Token invalid, clear storage
                        await SecureStore.deleteItemAsync('authToken');
                        await SecureStore.deleteItemAsync('sessionId');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadUserProfile() {
        try {
            const response = await fetch(
                `${API_URL}/api/profile?userId=${currentUser.id}`,
                {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }
            );

            if (response.ok) {
                const profile = await response.json();
                setUserProfile(profile);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async function googleSignIn() {
        try {
            const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
            
            const result = await AuthSession.startAsync({
                authUrl,
                returnUrl: redirectUri
            });

            if (result.type === 'success') {
                const { token, sessionId: newSessionId } = result.params;
                
                if (token) {
                    // Store auth data
                    await SecureStore.setItemAsync('authToken', token);
                    if (newSessionId) {
                        await SecureStore.setItemAsync('sessionId', newSessionId);
                        setSessionId(newSessionId);
                    }
                    
                    setAuthToken(token);
                    
                    // Verify and get user info
                    const verifyResponse = await fetch(`${API_URL}/auth/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });
                    
                    if (verifyResponse.ok) {
                        const userData = await verifyResponse.json();
                        setCurrentUser({
                            id: userData.userId,
                            email: userData.email
                        });
                    }
                    
                    return result;
                }
            }
            
            throw new Error('Authentication failed');
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }

    async function logout() {
        try {
            // Call logout endpoint
            if (sessionId) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ sessionId })
                });
            }
            
            // Clear local storage
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('sessionId');
            
            setAuthToken(null);
            setSessionId(null);
            setCurrentUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async function updateUserProfile(updates) {
        if (!currentUser) throw new Error("No user is signed in.");

        try {
            const response = await fetch(`${API_URL}/api/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    ...updates
                })
            });

            if (response.ok) {
                // Update local state
                setUserProfile(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async function uploadProfilePicture(uri) {
        if (!currentUser) throw new Error("No user is signed in.");

        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('userId', currentUser.id);
            formData.append('avatar', blob);

            const uploadResponse = await fetch(`${API_URL}/profile/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            if (uploadResponse.ok) {
                const data = await uploadResponse.json();
                await updateUserProfile({ avatar_url: data.url });
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    }

    const value = {
        currentUser,
        userProfile,
        authToken,
        googleSignIn,
        logout,
        updateUserProfile,
        uploadProfilePicture,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
