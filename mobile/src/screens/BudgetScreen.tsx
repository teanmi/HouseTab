import React, { useState } from "react";
import { Text, FlatList, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { nanoid } from "nanoid/non-secure";

import ExpenseItem from "../components/ExpenseItem";
import ExpenseModal from "../components/ExpenseModal";
import PressableButton from "../components/PressableButton";

import { Expense } from "../types/Expense";
import { styles } from "../styles/budgetStyles";

import BalancesModal from "../components/BalancesModal";

function BudgetScreen({ userName, roomates, onBack }: any) {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [balancesVisible, setBalancesVisible] = useState(false);

  const total = expenses
    .filter(e => e.type !== "settlement")
    .reduce((sum, e) => sum + e.amount, 0);

  const users = [userName, ...roomates];

  const balances: Record<string, number> = {};
  users.forEach(user => balances[user] = 0);

  expenses.forEach(expense => {

    if (!expense.splitWith || expense.splitWith.length === 0) return;

    const share = expense.amount / expense.splitWith.length;

    expense.splitWith.forEach(user => {
      balances[user] -= share;
    });

    balances[expense.paidBy] += expense.amount;

  });

  function calculateSettlements(balances: Record<string, number>) {

    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, amount]) => {
      if (amount < 0) debtors.push({ name, amount: -amount });
      if (amount > 0) creditors.push({ name, amount });
    });

    const settlements: string[] = [];

    while (debtors.length && creditors.length) {

      const debtor = debtors[0];
      const creditor = creditors[0];

      const payment = Math.min(debtor.amount, creditor.amount);

      settlements.push(`${debtor.name} pays ${creditor.name} $${payment.toFixed(2)}`);

      debtor.amount -= payment;
      creditor.amount -= payment;

      if (debtor.amount === 0) debtors.shift();
      if (creditor.amount === 0) creditors.shift();
    }

    return settlements;
  }

  const settlements = calculateSettlements(balances);

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

  const handleSettle = (payer: string, receiver: string, amount: number) => {

    const settlement: Expense = {
      id: nanoid(),
      name: "Settlement",
      amount,
      paidBy: payer,
      splitType: "none",
      splitWith: [receiver],
      date: new Date().toISOString(),
      type: "settlement",
    };

    setExpenses(prev => [...prev, settlement]);
  };

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>Budget</Text>
      <Text style={styles.subtitle}>Welcome {userName}</Text>

      <Text style={styles.total}>
        Total: ${total.toFixed(2)}
      </Text>

      <FlatList
        data={expenses.filter(e => e.type !== "settlement")}
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
          title="Balances"
          onPress={() => setBalancesVisible(true)}
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
        users={users}
      />
      <BalancesModal
        visible={balancesVisible}
        onClose={() => setBalancesVisible(false)}
        balances={balances}
        settlements={settlements}
        onSettle={handleSettle}
      />

    </SafeAreaView>
  );
}

export default BudgetScreen;
