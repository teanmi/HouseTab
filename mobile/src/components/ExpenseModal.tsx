import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Alert,
} from "react-native";

import { BlurView } from "@react-native-community/blur";
import DateTimePicker from "@react-native-community/datetimepicker";

import PressableButton from "./PressableButton";
import { styles } from "../styles/budgetStyles";
import { Expense } from "../types/Expense";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    amount: string,
    paidBy: string,
    splitType: "everyone" | "individual" | "none",
    splitWith?: string[],
    date?: string
  ) => void;
  users: string[];
  expenseToEdit?: Expense | null;
};

const ExpenseModal = ({ visible, onClose, onSave, users, expenseToEdit }: Props) => {

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"everyone" | "individual" | "none">("everyone");

  const [paidByModalVisible, setPaidByModalVisible] = useState(false);
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [blurOpacity] = useState(new RNAnimated.Value(0));

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

  React.useEffect(() => {
    if (expenseToEdit) {
      setExpenseName(expenseToEdit.name);
      setExpenseAmount(expenseToEdit.amount.toString());
      setPaidBy(expenseToEdit.paidBy);
      setSplitType(expenseToEdit.splitType);
      setDate(expenseToEdit.date ? new Date(expenseToEdit.date) : null);

      setSelectedUsers(
        expenseToEdit.splitWith && expenseToEdit.splitWith.length > 0
          ? expenseToEdit.splitWith
          : expenseToEdit.splitType === "everyone"
          ? [...users] // default to everyone if no splitWith
          : []
      );
    } else {
      setSelectedUsers(users);
    }
  }, [expenseToEdit]);


  const handleSave = () => {

    const parsedAmount = parseFloat(expenseAmount);

    if (!expenseName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid number.");
      return;
    }

    onSave(
      expenseName,
      parsedAmount.toString(),
      paidBy,
      splitType,
      selectedUsers,
      date ? date.toISOString() : "",
    );

    resetForm();
  };

  const resetForm = () => {
    setExpenseName("");
    setExpenseAmount("");
    setDate(null);
    setSplitType("everyone");
    setSelectedUsers(users);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const splitLabels = {
    everyone: "Everyone",
    individual: "Individuals",
    none: "Don't Split",
  };

  const toggleUser = (user: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(user)) {
        if (prev.length === 1) return prev; // prevent removing last person
        return prev.filter((u) => u !== user);
      }
      return [...prev, user];
    });
  };

  return (
    <>
      {/* MAIN EXPENSE MODAL */}
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
              keyboardType="numeric"
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
                {date ? date.toLocaleDateString() : "Select Date (Optional)"}
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

      {/* PAID BY MODAL */}
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

            <View style={styles.buttonGroup}>
              <PressableButton
                title="Back"
                onPress={() => setPaidByModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* SPLIT MODAL */}
      <Modal visible={splitModalVisible} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>Split Expense</Text>
            <View style={styles.buttonGroup}>

              <PressableButton
                title={splitType === "everyone" ? "✓ Split With Everyone" : "Split With Everyone"}
                onPress={() => {
                  setSplitType("everyone");
                  setSelectedUsers(users);
                }}
              />

              <PressableButton
                title={splitType === "individual" ? "✓ Split Individually" : "Split Individually"}
                onPress={() => {
                  setSplitType("individual");
                  setSelectedUsers(users.filter((u) => u === paidBy));
                }}
              />

              <PressableButton
                title={splitType === "none" ? "✓ Don't Split" : "Don't Split"}
                onPress={() => {
                  setSplitType("none");
                  setSelectedUsers([]);
                }}
              />

              {splitType === "individual" && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "600", marginBottom: 6 }}>
                    Split Between
                  </Text>

                  {users.map((user) => {
                    const selected = selectedUsers.includes(user);

                    return (
                        <Pressable
                        key={user}
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                        }}
                        onPress={() => toggleUser(user)}
                        >
                        <Text>{user}</Text>
                        <Text style={{ fontSize: 20 }}>{selected ? "☑" : "☐"}</Text>
                        </Pressable>
                    );
                  })}
                </View>
              )}

              <PressableButton
                title="Save"
                onPress={() => {
                  setSplitModalVisible(false);
                  if (selectedUsers.length === 0){
                    setSplitType("none");
                  }
                  if (selectedUsers.length === users.length){
                    setSplitType("everyone");
                  }
                }}
              />

            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ExpenseModal;
