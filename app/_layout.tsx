import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../providers/AuthProvider";

  function AuthGate() {
    const { user, initializing } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
      // If we are initializing, don't do anything
      if (initializing) return;

      if (segments[0] !== "(auth)" && !user){
        // If the user is not logged in, redirect to the sign-in page
        router.replace("/(auth)/signin");
      } else if (segments[0] === "(auth)" && user) {
        // If the user is logged in, redirect away from the sign-in page
        router.replace("/(tabs)");
      }
    }, [user, initializing]);

    const needsRedirect =
    (!user && segments[0] !== "(auth)") ||
    (user && segments[0] === "(auth)");

    if (initializing || needsRedirect) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      return <Stack screenOptions={{ headerShown: false }}/>;
    }

    }


export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}