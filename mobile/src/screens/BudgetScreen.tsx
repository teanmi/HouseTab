import React, { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "@react-native-community/blur";

type Expense = {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  splitType: "everyone" | "individual" | "none";
  date?: string;
};

type ExpenseItemProps = {
  item: Expense;
};

const ExpenseItem = ({ item }: ExpenseItemProps) => (
  <View style={styles.expenseItem}>
    <Text style={styles.expenseName}>{item.name}</Text>
    <Text style={styles.expenseAmount}>${item.amount}</Text>
  </View>
);

type ExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    amount: string,
    paidBy: string,
    splitType: string,
    date: string
  ) => void;
  users: string[];
};

const ExpenseModal = ({ visible, onClose, onSave, users }: ExpenseModalProps) => {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState(users[0]);
  const [splitType, setSplitType] = useState<"everyone" | "individual" | "none">("everyone");
  const [date, setDate] = useState("");

  const [paidByModalVisible, setPaidByModalVisible] = useState(false);
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  const blurOpacity = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(blurOpacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleSave = () => {
    if (!expenseName || !expenseAmount) return;

    onSave(expenseName, expenseAmount, paidBy, splitType, date);

    setExpenseName("");
    setExpenseAmount("");
    setDate("");
    setPaidBy(users[0]);
    setSplitType("everyone");
  };

  return (
    <>
      {/* Main Expense Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { opacity: blurOpacity }]}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
            />
          </Animated.View>

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>Add Expense</Text>

            <TextInput
              style={styles.input}
              placeholder="Expense Name"
              value={expenseName}
              onChangeText={setExpenseName}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />
            <View style={styles.buttonGroup}>
              <Button
                title={`Paid By: ${paidBy}`}
                onPress={() => setPaidByModalVisible(true)}
              />
              <View style={{ marginBottom: 20 }}>
                <Button
                  title={`Split: ${splitType}`}
                  onPress={() => setSplitModalVisible(true)}
                />
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Date (optional)"
              value={date}
              onChangeText={setDate}
            />

            <View style={styles.buttonGroup}>
              <Button title="Save Expense" onPress={handleSave} />
              <Button title="Cancel" onPress={onClose} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Paid By Modal */}
      <Modal visible={paidByModalVisible} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>Who Paid?</Text>

            {users.map((user) => (
              <View key={user} style={styles.buttonGroup}>
              <Button
                title={user === paidBy ? `✓ ${user}` : user}
                onPress={() => {
                  setPaidBy(user);
                  setPaidByModalVisible(false);
                }}
              />
              </View>
            ))}

            <View style = {styles.buttonGroup}><Button title="Back" onPress={() => setPaidByModalVisible(false)} /></View>
          </View>
        </View>
      </Modal>

      {/* Split Modal */}
      <Modal visible={splitModalVisible} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>Split Expense</Text>
            <View style={styles.buttonGroup}>
              <Button
                title={splitType === "everyone" ? "✓ Split With Everyone" : "Split With Everyone"}
                onPress={() => {
                  setSplitType("everyone");
                  setSplitModalVisible(false);
                }}
              />

              <Button
                title={splitType === "individual" ? "✓ Split Individually" : "Split Individually"}
                onPress={() => {
                  setSplitType("individual");
                  setSplitModalVisible(false);
                }}
              />

              <Button
                title={splitType === "none" ? "✓ Don't Split" : "Don't Split"}
                onPress={() => {
                  setSplitType("none");
                  setSplitModalVisible(false);
                }}
              />

              <Button title="Back" onPress={() => setSplitModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

function BudgetScreen({
  userName,
  roomates,
  onBack,
}: {
  userName: string;
  roomates: string[];
  onBack: () => void;
}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const addExpense = (
    name: string,
    amount: string,
    paidBy: string,
    splitType: string,
    date: string
  ) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      name,
      amount: Number(amount),
      paidBy,
      splitType: splitType as any,
      date,
    };

    setExpenses((prev) => [...prev, newExpense]);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.subtitle}>Welcome {userName}</Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseItem item={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet</Text>}
      />

      <View style={styles.spacer} />

      <Button title="Add Expense" onPress={() => setModalVisible(true)} />

      <View style={styles.spacer} />

      <Button title="Back" onPress={onBack} />

      <ExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addExpense}
        users={[userName, ...roomates]}
      />
    </SafeAreaView>
  );
}

export default BudgetScreen;

const styles = StyleSheet.create({
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

  expenseAmount: { fontWeight: "600" },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },

  spacer: { height: 12 },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 35,
  },

  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
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

  buttonGroup: {
    marginTop: 10,
    gap: 10,
  },
});