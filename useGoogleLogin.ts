import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./config/firebase";

// Configure Google Sign-In with your client IDs
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export const useGoogleLogin = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    profilePicture?: string;
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      if (user) {
        setUserInfo({
          name: user.displayName || "Anonymous User",
          email: user.email || "",
          profilePicture: user.photoURL || undefined,
        });
      } else {
        setUserInfo(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      // Check if device supports Google Play Services (Android) or is configured (iOS)
      await GoogleSignin.hasPlayServices();

      // Trigger native Google Sign-In
      const response = await GoogleSignin.signIn();

      // Get the ID token from the response
      const idToken = response.data?.idToken;

      if (idToken) {
        // Create Firebase credential and sign in
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        setUserId(userCredential.user.uid);
        console.log("[Google Auth] Signed in as:", userCredential.user.uid);
      } else {
        console.error("[Google Auth] No ID token returned");
      }
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        console.log("[Google Auth] Sign-in was cancelled by user");
      } else {
        console.error("[Google Auth] Error:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      await signOut(auth);
      setUserId(null);
      console.log("[Google Auth] Signed out");
    } catch (error) {
      console.error("[Google Auth] Logout error:", error);
    }
  };

  const refreshUser = async () => {
    const user = auth.currentUser;
    setUserId(user?.uid ?? null);
    if (user) {
      setUserInfo({
        name: user.displayName || "Anonymous User",
        email: user.email || "",
        profilePicture: user.photoURL || undefined,
      });
    } else {
      setUserInfo(null);
    }
    return user;
  };

  return { handleLogin, handleLogout, userId, userInfo, refreshUser };
};
