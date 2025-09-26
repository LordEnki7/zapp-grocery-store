import { initializeApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zapp-ecommerce.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zapp-ecommerce",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zapp-ecommerce.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.appId !== "YOUR_APP_ID" &&
         firebaseConfig.messagingSenderId !== "YOUR_MESSAGING_SENDER_ID";
};

// Initialize Firebase
let app: any;
let db: Firestore | null;
let auth: Auth | null;
let storage: FirebaseStorage | null;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not configured - using development mode');
    // Create mock objects for development
    db = null;
    auth = null;
    storage = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  db = null;
  auth = null;
  storage = null;
}

export { db, auth, storage, isFirebaseConfigured };