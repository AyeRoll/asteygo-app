// firebase.js (moved to project-level config/ to avoid expo-router treating it as a route)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (single instance)
const app = initializeApp(firebaseConfig);

// Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Auth for React Native with AsyncStorage persistence
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If initializeAuth was already called (e.g., hot reload or multiple imports),
  // fall back to the existing auth instance.
  try {
    _auth = getAuth(app);
  } catch (err) {
    // Re-throw if we can't recover
    throw err;
  }
}

export const auth = _auth;

// Auth helper functions (use modular API and exported `auth`)
export const register = async (email, password, name) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  if(name && result.user){
    await updateProfile(result.user, { displayName: name});
  }
};

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

// Re-export onAuthStateChanged so consumers import from one place
export { onAuthStateChanged };

// Backwards-compatible aliases used across the codebase
// Expose only the modular exports: auth, db, storage, and helper functions

export default app;
