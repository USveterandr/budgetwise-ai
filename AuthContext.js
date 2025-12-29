import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo
} from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a document for the new user in the 'users' collection
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            createdAt: new Date(),
            // You can add any other default fields here
            // e.g., displayName: 'New User'
        });

        return userCredential;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function googleSignIn() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if a user document already exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // If the document doesn't exist (e.g., first-time Google sign-in), create it
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date(),
            });
        }
        return result;
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // User is signed in, fetch their profile from Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    // Combine auth data and firestore data
                    setUserProfile({ ...user, ...userDoc.data() });
                } else {
                    // Fallback to just auth data if firestore doc is missing
                    setUserProfile(user);
                }
            } else {
                // User is signed out
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        login,
        signup,
        logout,
        googleSignIn,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}