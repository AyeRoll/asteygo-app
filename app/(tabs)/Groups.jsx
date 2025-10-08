import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../config/firebase"; // make sure you have firebase.js setup
import styles from "../../global";

const Groups = () => {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    // Listen to travel_groups collection in Firestore
    const unsubscribe = onSnapshot(
      collection(db, "travel_groups"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching groups:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    try {
      await addDoc(collection(db, "travel_groups"), {
        name: groupName,
        created_at: serverTimestamp(),
      });
      setGroupName("");
      setModalVisible(false);
    } catch (e) {
      console.error("Error creating group:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>👥 Groups</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.scrollViewContent}>
          {groups.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No groups yet. Create one!
            </Text>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() =>
                  router.push(`/screens/GroupDetail?groupId=${group.id}`)
                }
              >
                <View style={styles.groupCardIcon}>
                  <Text>🌍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupCardTitle}>{group.name}</Text>
                  <Text style={styles.groupCardSubtitle}>
                    {group.created_at?.toDate
                      ? `Created ${group.created_at
                          .toDate()
                          .toLocaleDateString()}`
                      : "Created N/A"}
                  </Text>
                </View>
                <Text style={styles.groupCardArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Group Modal */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.dialogTitle}>Create Group</Text>
            <TextInput
              placeholder="Group Name"
              style={styles.dialogInput}
              value={groupName}
              onChangeText={setGroupName}
            />
            <TouchableOpacity
              style={styles.dialogButton}
              onPress={handleCreateGroup}
            >
              <Text style={styles.dialogButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogButtonOutline}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.dialogButtonTextOutline}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Groups;
