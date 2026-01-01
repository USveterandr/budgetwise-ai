import React, { useContext, useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
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

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    async function updateUserProfile(updates) {
        if (!currentUser) throw new Error("No user is signed in.");

        // Update Firebase Auth profile
        if (updates.displayName) {
            await updateProfile(currentUser, { displayName: updates.displayName });
        }

        // Update Firestore document
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, updates);

        // Update local state
        setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    async function uploadProfilePicture(uri) {
        if (!currentUser) throw new Error("No user is signed in.");

        // Convert file URI to a blob that can be uploaded
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create a storage reference (e.g., 'profile-pictures/userId.jpg')
        const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);

        // Upload the file
        await uploadBytes(storageRef, blob);

        // Get the public download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Use the existing updateUserProfile function to save the URL
        await updateUserProfile({ photoURL: downloadURL });
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (currentUser) {
            const fetchProfile = async () => {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserProfile({ ...currentUser, ...userDoc.data() });
                } else {
                    // Fallback to just auth data if firestore doc is missing
                    setUserProfile(currentUser);
                }
            };
            fetchProfile();
        } else {
            setUserProfile(null);
        }
    }, [currentUser]);

    const value = {
        currentUser,
        userProfile,
        login,
        signup,
        logout,
        googleSignIn,
        updateUserProfile,
        uploadProfilePicture,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}