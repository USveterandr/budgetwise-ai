// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

export { app, analytics };
