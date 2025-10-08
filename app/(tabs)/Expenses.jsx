import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../../config/firebase.js";

// Optional: category colors
const EXPENSE_COLORS = {
  food: "#FF6347",
  travel: "#36A2EB",
  lodging: "#FFCE56",
  shopping: "#4BC0C0",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth;

    const fetchData = async () => {
      unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) await signInAnonymously(auth);
        const user = auth.currentUser;

        if (!user) {
          setIsLoading(false);
          return;
        }

        try {
          // Fetch groups user belongs to
          const groupsRef = collection(db, "travel_groups");
          const groupsQuery = query(
            groupsRef,
            where("members", "array-contains", user.email)
          );
          const groupsSnapshot = await getDocs(groupsQuery);
          const fetchedGroups = groupsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setGroups(fetchedGroups);

          if (fetchedGroups.length > 0) {
            // Subscribe to expenses of first group
            const expensesRef = collection(db, "group_expenses");
            const expensesQuery = query(
              expensesRef,
              where("group_id", "==", fetchedGroups[0].id),
              orderBy("date", "desc")
            );

            const unsubscribeExpenses = onSnapshot(
              expensesQuery,
              (querySnapshot) => {
                const fetchedExpenses = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setExpenses(fetchedExpenses);
                setIsLoading(false);
              }
            );

            return () => unsubscribeExpenses();
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        }
      });
    };

    fetchData();
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  const getTotalSpent = () =>
    expenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach((exp) => {
      if (exp.category) {
        categoryTotals[exp.category] =
          (categoryTotals[exp.category] || 0) + (exp.total_amount || 0);
      }
    });
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name:
        category.charAt(0).toUpperCase() + category.slice(1).replace("_", " "),
      value: amount,
      color: EXPENSE_COLORS[category] || "#8884d8",
    }));
  };

  const pieData = getExpensesByCategory();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Expenses</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6347" />
        ) : (
          <View style={styles.expensesContainer}>
            {/* Total Spent */}
            <View style={styles.budgetCard}>
              <Text style={styles.budgetCardTitle}>Total Spent</Text>
              <Text style={styles.budgetCardValue}>
                ${getTotalSpent().toFixed(2)}
              </Text>
            </View>

            {/* Category Breakdown */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              {pieData.length === 0 ? (
                <Text style={styles.noDataText}>
                  No expenses yet. Add your first expense!
                </Text>
              ) : (
                <View style={styles.chartPlaceholder}>
                  {/* TODO: Replace this with a Pie Chart later */}
                  <Text style={styles.chartPlaceholderText}>
                    Pie Chart Placeholder
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  screenTitle: { fontSize: 24, fontWeight: "bold" },
  scrollViewContent: { padding: 16 },
  expensesContainer: { padding: 16 },
  budgetCard: {
    backgroundColor: "#FF6347",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  budgetCardTitle: { color: "white", fontSize: 16 },
  budgetCardValue: { color: "white", fontSize: 40, fontWeight: "bold" },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  chartPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  chartPlaceholderText: { fontSize: 16, color: "#666" },
  noDataText: { textAlign: "center", color: "#666", marginTop: 20 },
});
