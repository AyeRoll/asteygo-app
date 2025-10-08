// app/screens/SavedVideosScreen.js
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db as firebaseDb } from "../../config/firebase";

export default function SavedVideosScreen() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);

  const currentUser = auth.currentUser;

  // Fetch saved videos from Firestore
  useEffect(() => {
    const videosQuery = query(
      collection(firebaseDb, "saved_videos"),
      where("user_id", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(videosQuery, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideos(fetched);
    });

    return () => unsubscribe();
  }, []);

  // Play video placeholder
  const playVideo = (video) => {
    alert(`Play video: ${video.title}`);
    // TODO: integrate react-native-video or navigate to a VideoPlayer screen
  };

  // Delete saved video
  const removeVideo = (id) => {
    Alert.alert("Delete Video", "Are you sure you want to remove this video?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(firebaseDb, "saved_videos", id));
          } catch (err) {
            console.error("Error deleting video:", err);
            Alert.alert("Failed to delete video");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => playVideo(item)}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeVideo(item.id)}
              style={styles.deleteButton}
            >
              <Text style={{ color: "#ff3b30", fontWeight: "bold" }}>
                Delete
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No saved videos yet.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingRight: 10,
  },
  thumbnail: { width: 120, height: 80 },
  textContent: { flex: 1, padding: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  desc: { fontSize: 12, color: "#666", marginTop: 4 },
  deleteButton: { marginLeft: 10 },
});
