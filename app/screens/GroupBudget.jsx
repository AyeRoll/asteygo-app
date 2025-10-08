// app/screens/GroupBudget.js
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db as firebaseDb } from "../../config/firebase";

export default function GroupBudget({ route }) {
  const { groupId } = route.params;
  const [budget, setBudget] = useState(0);
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);

  const currentUser = auth.currentUser;

  // Fetch group budget in real-time
  useEffect(() => {
    const groupRef = doc(firebaseDb, "groups", groupId);
    const unsubscribeGroup = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBudget(data.budget || 0);
      }
    });

    return () => unsubscribeGroup();
  }, [groupId]);

  // Fetch expenses (optional)
  useEffect(() => {
    const fetchExpenses = async () => {
      const expensesQuery = query(
        collection(firebaseDb, "group_expenses"),
        where("group_id", "==", groupId)
      );
      const snapshot = await getDocs(expensesQuery);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(fetched);
    };
    fetchExpenses();
  }, [groupId]);

  // Adjust budget
  const adjustBudget = async (delta) => {
    const value = parseFloat(delta);
    if (isNaN(value)) return Alert.alert("Enter a valid number");

    const groupRef = doc(firebaseDb, "groups", groupId);

    try {
      await updateDoc(groupRef, {
        budget: budget + value,
        lastUpdated: serverTimestamp(),
      });
      setAmount("");
    } catch (err) {
      console.error("Error updating budget:", err);
      Alert.alert("Failed to update budget");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Group Budget</Text>
        <Text style={styles.budget}>${budget.toFixed(2)}</Text>
      </View>

      <View style={styles.adjustContainer}>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => adjustBudget(amount)}
        >
          <Text style={{ color: "#fff" }}>Add/Subtract</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.expenseTitle}>Expenses:</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text>{item.description || "No description"}</Text>
            <Text>${item.amount?.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            No expenses yet.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold" },
  budget: { fontSize: 28, fontWeight: "bold", color: "#FF6347", marginTop: 5 },
  adjustContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
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
  },
  expenseTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
