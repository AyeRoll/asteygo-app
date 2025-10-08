// firebase.js (moved to project-level config/ to avoid expo-router treating it as a route)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQ3_HwzxPnM0KIqkfMYXB8p-I6ufQ0Suo",
  authDomain: "asteygo.firebaseapp.com",
  projectId: "asteygo",
  storageBucket: "asteygo.firebasestorage.app",
  messagingSenderId: "941293890230",
  appId: "1:941293890230:web:92ca49ccfc2f493d54d417",
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
export const register = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

// Backwards-compatible aliases used across the codebase
// Expose only the modular exports: auth, db, storage, and helper functions

export default app;
