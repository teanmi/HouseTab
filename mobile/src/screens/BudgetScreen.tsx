import React, { useState } from "react";
import { Text, FlatList, View, Pressable } from "react-native";
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setEditingExpense(null)
  };


  type SplitType = "everyone" | "individual" | "none";

  const handleSaveExpense = (
    name: string,
    amount: string,
    paidBy: string,
    splitType: SplitType,
    splitWith?: string[],
    date?: string
  ) => {

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? { ...e, name, amount: Number(amount), paidBy, splitType, splitWith, date }
            : e
        )
      );
    } else {
      const newExpense: Expense = {
        id: nanoid(),
        name,
        amount: parseFloat(amount),
        paidBy,
        splitType: splitType as any,
        splitWith: splitWith ?? (splitType === "everyone" ? [userName, ...roomates] : []),
        date
      };

      setExpenses(prev => [...prev, newExpense]);
    }
    setModalVisible(false);
    setEditingExpense(null);
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
          <Pressable
            onPress={() => {
              setEditingExpense(item);
              setModalVisible(true);
            }}
          >
            <ExpenseItem item={item} onDelete={deleteExpense}/>
          </Pressable>
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
        onClose={() => {
          setModalVisible(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        expenseToEdit={editingExpense}
        users={[userName, ...roomates]}
      />

    </SafeAreaView>
  );
}

export default BudgetScreen;
