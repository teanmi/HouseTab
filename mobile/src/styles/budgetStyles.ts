import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { marginBottom: 10 },

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 12,
  },

  expenseName: { fontSize: 16 },
  expenseAmount: { fontWeight: "600", paddingRight: 12 },

  expenseMeta: { fontSize: 12, color: "#777" },

  spacer: { height: 12 },

  total: { fontSize: 18, fontWeight: "600", marginBottom: 10 },

  pressableButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  pressableButtonPressed: { opacity: 0.7 },

  pressableText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  modalRoot: { flex: 1, justifyContent: "flex-end" },

  bottomSheet: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    marginVertical: 4,
    borderRadius: 8,
  },

  deleteText: {
    color: "white",
    fontWeight: "600",
  },

  buttonGroup: {
    marginTop: 10,
    gap: 10,
  },

  buttonSpacing: {
    marginBottom: 20,
  },

  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },

});
