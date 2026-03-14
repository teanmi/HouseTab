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

type Props = {
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

const ExpenseModal = ({ visible, onClose, onSave, users }: Props) => {

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"everyone" | "individual" | "none">("everyone");

  const [paidByModalVisible, setPaidByModalVisible] = useState(false);
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

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

    onSave(
      expenseName,
      parsedAmount.toString(),
      paidBy,
      splitType,
      date ? date.toISOString() : ""
    );

    resetForm();
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
    if (selectedDate) setDate(selectedDate);
  };

  const splitLabels = {
    everyone: "Everyone",
    individual: "Individuals",
    none: "Don't Split",
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

              <PressableButton
                title="Back"
                onPress={() => setSplitModalVisible(false)}
              />

            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ExpenseModal;
