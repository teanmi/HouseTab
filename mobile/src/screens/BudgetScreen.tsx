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
};

type ExpenseItemProps = {
  item: Expense;
};

const ExpenseItem = ({ item }: ExpenseItemProps) => {
  return (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseName}>{item.name}</Text>
      <Text style={styles.expenseAmount}>${item.amount}</Text>
    </View>
  );
};

type ExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, amount: string) => void;
};

const ExpenseModal = ({ visible, onClose, onSave }: ExpenseModalProps) => {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const blurOpacity = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    if (visible) {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSave = () => {
    if (!expenseName || !expenseAmount) return;
    onSave(expenseName, expenseAmount);
    setExpenseName("");
    setExpenseAmount("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalRoot}>
        {/* Animated Blur Background */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: blurOpacity },
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
          />
        </Animated.View>

        {/* Bottom Sheet */}
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
            <Button title="Save Expense" onPress={handleSave} />
            <Button title="Cancel" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
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

  const addExpense = (name: string, amount: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      name,
      amount: Number(amount),
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses yet</Text>
        }
      />

      <View style={styles.spacer} />

      <Button title="Add Expense" onPress={() => setModalVisible(true)} />

      <View style={styles.spacer} />

      <Button title="Back" onPress={onBack} />

      <ExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addExpense}
      />
    </SafeAreaView>
  );
}

export default BudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    marginBottom: 10,
  },

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 12,
  },

  expenseName: {
    fontSize: 16,
  },

  expenseAmount: {
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },

  spacer: {
    height: 12,
  },

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