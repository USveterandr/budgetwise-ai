import React, { useContext, useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    updatePassword
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

    async function changePassword(oldPassword, newPassword) {
        if (!currentUser) {
            throw new Error("No user is signed in.");
        }

        const providerId = currentUser.providerData[0]?.providerId;
        if (providerId !== 'password') {
            throw new Error("Password can only be changed for email/password accounts.");
        }

        if (!currentUser.email) {
            throw new Error("User email not found for re-authentication.");
        }

        // 1. Re-authenticate the user to confirm their identity.
        const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
        await reauthenticateWithCredential(currentUser, credential);

        // 2. If re-authentication is successful, update the password.
        await updatePassword(currentUser, newPassword);
    }

    async function updateUserProfile(updates) {
        if (!currentUser) throw new Error("No user is signed in.");

        // Update Firebase Auth profile
        if (updates.displayName !== undefined) {
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

    async function deleteAccount(password) {
        if (!currentUser) throw new Error("No user is signed in.");

        const providerId = currentUser.providerData[0]?.providerId;

        // Step 1: Re-authenticate the user to confirm their identity.
        if (providerId === 'password') {
            if (!password) {
                throw new Error("Password is required to delete this account.");
            }
            if (!currentUser.email) {
                throw new Error("User email not found for re-authentication.");
            }
            const credential = EmailAuthProvider.credential(currentUser.email, password);
            await reauthenticateWithCredential(currentUser, credential);
        } else if (providerId === 'google.com') {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(currentUser, provider);
        } else {
            throw new Error(`Re-authentication for provider "${providerId}" is not supported.`);
        }

        // If re-authentication is successful, proceed with deletion.
        const userToDelete = currentUser;

        // Step 2: Delete profile picture from Storage (if it exists)
        try {
            const storageRef = ref(storage, `profile-pictures/${userToDelete.uid}`);
            await deleteObject(storageRef);
        } catch (error) {
            if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting profile picture:", error);
            }
        }

        // Step 3: Delete user document from Firestore
        const userDocRef = doc(db, "users", userToDelete.uid);
        await deleteDoc(userDocRef);

        // Step 4: Delete the user from Firebase Authentication
        await deleteUser(userToDelete);
    }

    async function signOutFromAllDevices() {
        if (!currentUser) throw new Error("No user is signed in.");
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
            lastGlobalSignOut: new Date()
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        let unsubscribeSnapshot;
        if (currentUser) {
            // Capture the time when this session (or effect) started
            const sessionStartTime = new Date();
            const userDocRef = doc(db, "users", currentUser.uid);

            unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setUserProfile({ ...currentUser, ...data });

                    // Check if a global sign out occurred after this session started
                    if (data.lastGlobalSignOut) {
                        const lastGlobalSignOut = data.lastGlobalSignOut.toDate ? data.lastGlobalSignOut.toDate() : new Date(data.lastGlobalSignOut);
                        if (lastGlobalSignOut > sessionStartTime) {
                            logout();
                        }
                    }
                } else {
                    setUserProfile(currentUser);
                }
            });
        } else {
            setUserProfile(null);
        }

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
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
        deleteAccount,
        signOutFromAllDevices,
        changePassword,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}