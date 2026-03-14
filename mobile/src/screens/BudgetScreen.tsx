import React, { useState } from "react";
import { Text, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { nanoid } from "nanoid/non-secure";

import ExpenseItem from "../components/ExpenseItem";
import ExpenseModal from "../components/ExpenseModal";
import PressableButton from "../components/PressableButton";

import { Expense } from "../types/Expense";
import { styles } from "../styles/budgetStyles";

function BudgetScreen({ userName, roomates, onBack }: any) {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
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
      amount: parseFloat(amount),
      paidBy,
      splitType: splitType as any,
      date
    };

    setExpenses(prev => [...prev, newExpense]);
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
        renderItem={({ item }) =>
          <ExpenseItem item={item} onDelete={deleteExpense}/>
        }
      />

      <View style={styles.spacer} />
      
      <View style={styles.buttonGroup}>
        <PressableButton
          title="Add Expense"
          onPress={() => setModalVisible(true)}
        />

        <PressableButton
          title="Back"
          onPress={onBack}
        />
      </View>

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
