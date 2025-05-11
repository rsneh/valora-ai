import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider, type Auth } from "firebase/auth";
// import { getFirestore, Firestore } from "firebase/firestore";
// import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Replace with your actual firebaseConfig from the Firebase console
// For better security, use environment variables (e.g., import.meta.env.VITE_FIREBASE_API_KEY)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
// const db: Firestore = getFirestore(app);
// const storage: FirebaseStorage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

export { auth, googleProvider, emailProvider /*, db, storage */ };