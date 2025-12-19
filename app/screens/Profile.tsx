import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "../../config/firebase";
import styles from "../../global";
import { useAuth } from "../../providers/AuthProvider";

const Profile = () => {
  const {user} = useAuth();

  const handleSignOut = async () => {
    await logout(); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16}}>👤 Profile</Text>
        <Text style={{ fontSize:16, marginBottom: 8}}> Email: {user?.email || "Anonymous"}</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 24}}>UID: {user?.uid}</Text>

        <TouchableOpacity style={{ backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center'}} onPress={handleSignOut}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16}}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
