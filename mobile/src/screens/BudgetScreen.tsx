import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Animated as RNAnimated,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "@react-native-community/blur";
import { nanoid } from "nanoid/non-secure";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Alert } from "react-native";



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
  onDelete: (id: string) => void;
};

const ExpenseItem = ({ item, onDelete }: ExpenseItemProps) => {
  const renderRightActions = (progress: any, dragX: any) => {
    const animatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        dragX.value,
        [-100, 0],
        [0, 100],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        progress.value,
        [0, 1],
        [0, 1],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ translateX }],
        opacity,
      };
    }); 
    
    return (
      <Animated.View style={[styles.deleteButton, animatedStyle]}>
        <Pressable onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
    >
      <View style={styles.expenseItem}>
        <View>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseMeta}>
            Paid by {item.paidBy}
          </Text>
        </View>

        <Text style={styles.expenseAmount}>${item.amount}</Text>
      </View>
    </ReanimatedSwipeable>
  )
};

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

type PressableButtonProps = {
  title: string;
  onPress: () => void;
};

const PressableButton = ({ title, onPress }: PressableButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.pressableButton,
      pressed && styles.pressableButtonPressed,
    ]}
  >
    <Text style={styles.pressableText}>{title}</Text>
  </Pressable>
);

const ExpenseModal = ({ visible, onClose, onSave, users }: ExpenseModalProps) => {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [splitType, setSplitType] = useState<"everyone" | "individual" | "none">("everyone");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  const [paidByModalVisible, setPaidByModalVisible] = useState(false);
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  const blurOpacity = useState(new RNAnimated.Value(0))[0];

  React.useEffect(() => {
    RNAnimated.timing(blurOpacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  React.useEffect(() => {
  if (users.length > 0) {
    setPaidBy(users[0]);
  }
}, [users]);

  const handleSave = () => {
    const parsedAmount = parseFloat(expenseAmount);

    if (!expenseName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid number.");
      return;
    }

    onSave(expenseName, parsedAmount.toString(), paidBy, splitType, date ? date.toISOString() : "");

    setExpenseName("");
    setExpenseAmount("");
    setDate(null);
    setPaidBy(users[0]);
    setSplitType("everyone");
  };

  const resetForm = () => {
    setExpenseName("");
    setExpenseAmount("");
    setDate(null);
    setSplitType("everyone");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const splitLabels = {
    everyone: "Everyone",
    individual: "Individuals",
    none: "Don't Split",
  };

  return (
    <>
      {/* Main Expense Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <RNAnimated.View
            style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
            />
          </RNAnimated.View>

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
              keyboardType="decimal-pad"
              value={expenseAmount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, "");
                setExpenseAmount(cleaned);
              }}
            />
            <View style={styles.buttonGroup}>
              <PressableButton
                title={`Paid By: ${paidBy}`}
                onPress={() => setPaidByModalVisible(true)}
              />
              <View style={styles.buttonSpacing}>
                <PressableButton
                  title={`Split: ${splitLabels[splitType]}`}
                  onPress={() => setSplitModalVisible(true)}
                />
              </View>
            </View>

            <Pressable
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>
                {date ? date.toLocaleDateString() : "Select Date"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <View style={styles.buttonGroup}>
              <PressableButton title="Save Expense" onPress={handleSave} />
              <PressableButton title="Cancel" onPress={handleClose} />
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
              <PressableButton
                title={user === paidBy ? `✓ ${user}` : user}
                onPress={() => {
                  setPaidBy(user);
                  setPaidByModalVisible(false);
                }}
              />
              </View>
            ))}

            <View style = {styles.buttonGroup}><PressableButton title="Back" onPress={() => setPaidByModalVisible(false)} /></View>
          </View>
        </View>
      </Modal>

      {/* Split Modal */}
      <Modal visible={splitModalVisible} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>Split Expense</Text>
            <View style={styles.buttonGroup}>
              <PressableButton
                title={splitType === "everyone" ? "✓ Split With Everyone" : "Split With Everyone"}
                onPress={() => {
                  setSplitType("everyone");
                  setSplitModalVisible(false);
                }}
              />

              <PressableButton
                title={splitType === "individual" ? "✓ Split Individually" : "Split Individually"}
                onPress={() => {
                  setSplitType("individual");
                  setSplitModalVisible(false);
                }}
              />

              <PressableButton
                title={splitType === "none" ? "✓ Don't Split" : "Don't Split"}
                onPress={() => {
                  setSplitType("none");
                  setSplitModalVisible(false);
                }}
              />

              <PressableButton title="Back" onPress={() => setSplitModalVisible(false)} />
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

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addExpense = (
    name: string,
    amount: string,
    paidBy: string,
    splitType: string,
    date: string
  ) => {
    const newExpense: Expense = {
      id: nanoid(),
      name,
      amount: Number.isFinite(parseFloat(amount)) ? parseFloat(amount) : 0,
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

      <Text style={styles.total}>
        Total: ${total.toFixed(2)}
      </Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseItem item={item} onDelete={deleteExpense} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet</Text>}
      />

      <View style={styles.spacer} />

      <PressableButton title="Add Expense" onPress={() => setModalVisible(true)} />

      <View style={styles.spacer} />

      <PressableButton title="Back" onPress={onBack} />

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

  expenseAmount: { 
    fontWeight: "600",
    paddingRight: 12 
  },

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

  buttonSpacing: {
    marginBottom: 20,
  },

  expenseMeta: {
    fontSize: 12,
    color: "#777",
  },

  pressableButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  pressableButtonPressed: {
    opacity: 0.7,
  },

  pressableText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  total: {
    fontSize: 18,
    fontWeight: "600",
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
  }
});