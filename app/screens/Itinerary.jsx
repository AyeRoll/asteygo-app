// app/screens/Itinerary.js
import {
  addDoc,
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db as firebaseDb } from "../../config/firebase";

export default function Itinerary({ route }) {
  const { groupId } = route.params;
  const [itinerary, setItinerary] = useState([]);
  const [newItem, setNewItem] = useState("");

  const currentUser = auth.currentUser;

  // Real-time fetch of itinerary items
  useEffect(() => {
    const itineraryQuery = query(
      collection(firebaseDb, "group_itineraries"),
      where("group_id", "==", groupId)
    );

    const unsubscribe = onSnapshot(itineraryQuery, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItinerary(fetched);
    });

    return () => unsubscribe();
  }, [groupId]);

  // Add new itinerary item
  const addItem = async () => {
    if (!newItem.trim()) return Alert.alert("Enter an itinerary item");

    try {
      await addDoc(collection(firebaseDb, "group_itineraries"), {
        group_id: groupId,
        user_id: currentUser.uid,
        description: newItem,
        created_at: new Date(),
      });
      setNewItem("");
    } catch (err) {
      console.error("Error adding itinerary item:", err);
      Alert.alert("Failed to add item");
    }
  };

  // Optional: remove item
  const removeItem = async (id) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this itinerary item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firebaseDb, "group_itineraries", id));
            } catch (err) {
              console.error("Error deleting item:", err);
              Alert.alert("Failed to remove item");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Group Itinerary</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new itinerary item"
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={{ color: "#fff" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={itinerary}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.description}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No itinerary items yet.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  addButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: { fontSize: 16 },
  removeText: { color: "#ff3b30", fontWeight: "bold" },
});
