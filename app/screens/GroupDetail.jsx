// app/screens/GroupDetailScreen.js
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db as firebaseDb } from "../../config/firebase";

export default function GroupDetail({ route, navigation }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const currentUser = auth.currentUser;
  const flatListRef = useRef();

  // Fetch group data
  useEffect(() => {
    const groupRef = doc(firebaseDb, "groups", groupId);
    const unsubscribeGroup = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) setGroup({ id: docSnap.id, ...docSnap.data() });
    });

    return () => unsubscribeGroup();
  }, [groupId]);

  // Fetch messages in real-time
  useEffect(() => {
    const messagesQuery = query(
      collection(firebaseDb, "group_messages"),
      where("group_id", "==", groupId),
      orderBy("created_at", "asc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetched);

      // Optional: scroll to bottom
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => unsubscribeMessages();
  }, [groupId]);

  // Send chat message
  const sendMessage = async () => {
    if (!input.trim()) return;
    await addDoc(collection(firebaseDb, "group_messages"), {
      group_id: groupId,
      sender_id: currentUser.uid,
      sender_name: currentUser.email || "Anonymous",
      text: input,
      created_at: serverTimestamp(),
    });
    setInput("");
  };

  // Invite member
  const inviteMember = async () => {
    if (!inviteEmail.trim()) return Alert.alert("Enter a valid email");
    if (group.members?.includes(inviteEmail))
      return Alert.alert("User already in group");

    const groupRef = doc(firebaseDb, "groups", groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(inviteEmail),
    });
    Alert.alert("User invited!");
    setInviteEmail("");
  };

  // Leave group
  const leaveGroup = async () => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          const groupRef = doc(firebaseDb, "groups", groupId);
          await updateDoc(groupRef, {
            members: arrayRemove(currentUser.email),
          });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.groupName}>{group?.name || "Group"}</Text>
        <Text style={styles.groupDesc}>{group?.description}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender_id === currentUser?.uid && {
                backgroundColor: "#FF6347",
                alignSelf: "flex-end",
              },
            ]}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: item.sender_id === currentUser?.uid ? "#fff" : "#000",
              }}
            >
              {item.sender_name}:
            </Text>
            <Text
              style={{
                color: item.sender_id === currentUser?.uid ? "#fff" : "#000",
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
        style={styles.chatArea}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ paddingHorizontal: 10 }}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.inviteContainer}>
          <TextInput
            style={styles.inviteInput}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholder="Invite member by email"
          />
          <TouchableOpacity style={styles.inviteButton} onPress={inviteMember}>
            <Text style={{ color: "#fff" }}>Invite</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.leaveButton} onPress={leaveGroup}>
          <Text style={{ color: "#fff" }}>Leave Group</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 15, backgroundColor: "#f4f4f4" },
  groupName: { fontSize: 20, fontWeight: "bold" },
  groupDesc: { fontSize: 14, color: "#555", marginTop: 4 },
  chatArea: { flex: 1, padding: 10 },
  messageBubble: {
    backgroundColor: "#e8e8e8",
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    maxWidth: "75%",
  },
  inputArea: { flexDirection: "row", paddingVertical: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  sendButton: {
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteContainer: { flexDirection: "row", paddingVertical: 10 },
  inviteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  inviteButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  leaveButton: {
    backgroundColor: "#ff3b30",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
  },
});
