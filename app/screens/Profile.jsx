// src/screens/ProfileScreen.js
import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";
import styles from "../../global";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#FF6347" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ padding: 20 }}>
        <Text style={styles.screenTitle}>👤 Profile</Text>
        <Text style={styles.profileText}>
          Email: {user.email || "Anonymous"}
        </Text>
        <Text style={styles.profileText}>UID: {user.uid}</Text>

        <TouchableOpacity style={styles.dialogButton} onPress={handleSignOut}>
          <Text style={styles.dialogButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
