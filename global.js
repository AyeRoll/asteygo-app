import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  navItem: { padding: 10 },
  navText: { fontSize: 20 },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { marginRight: 10 },
  backButtonText: { fontSize: 20 },
  detailTitle: { fontSize: 20, fontWeight: "bold" },
  budgetCard: {
    padding: 20,
    margin: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
  },
  budgetCardTitle: { fontSize: 18, marginBottom: 5 },
  budgetCardValue: { fontSize: 22, fontWeight: "bold" },
});
