import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2L-gWMVOy1cJ61sbgE0PuwDjvBiMvg5I",
  authDomain: "budgetwise-ai-88101.firebaseapp.com",
  projectId: "budgetwise-ai-88101",
  storageBucket: "budgetwise-ai-88101.firebasestorage.app",
  messagingSenderId: "141407074198",
  appId: "1:141407074198:web:88b902d58815b98ccd8fb7",
  measurementId: "G-R3T4V2ECC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics, db, auth };
