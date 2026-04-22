import React, { useEffect, useState } from 'react';
import {
  Text,
  FlatList,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

import ExpenseItem from '../components/ExpenseItem';
import ExpenseModal from '../components/ExpenseModal';
import PressableButton from '../components/PressableButton';

import { Expense } from '../types/Expense';
import { styles } from '../styles/budgetStyles';
import type { AppStackParamList } from '../navigation/types';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { expenseApi } from '../api/expenses';

import BalancesModal from '../components/BalancesModal';

type BudgetScreenProps = {
  navigation: NavigationProp<AppStackParamList, 'Budget'>;
  route: RouteProp<AppStackParamList, 'Budget'>;
};

export function BudgetScreen({ navigation, route }: BudgetScreenProps) {
  const { userName, houseId } = route.params;
  const { token } = useAuth();
  const [roommates, setRoommates] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [balancesVisible, setBalancesVisible] = useState(false);
  const [isLoadingRoommates, setIsLoadingRoommates] = useState(true);
  const [roommatesError, setRoommatesError] = useState<string | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoommates = async () => {
      if (!token) {
        setRoommatesError('Missing authentication token');
        setIsLoadingRoommates(false);
        return;
      }

      try {
        setIsLoadingRoommates(true);
        setRoommatesError(null);

        const response = await fetch(`${API_BASE_URL}/houses/${houseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch roommates');
        }

        const data = await response.json();
        const fetchedRoommates = (data.members || [])
          .map((member: { name: string }) => member.name)
          .filter((name: string) => name && name !== userName);

        setRoommates(fetchedRoommates);
      } catch (err) {
        setRoommatesError(err instanceof Error ? err.message : 'Unknown error');
        setRoommates([]);
      } finally {
        setIsLoadingRoommates(false);
      }
    };

    fetchRoommates();
  }, [houseId, token, userName]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!token) {
        setExpensesError('Missing authentication token');
        setIsLoadingExpenses(false);
        return;
      }

      try {
        setIsLoadingExpenses(true);
        setExpensesError(null);

        const data = await expenseApi.getExpenses(token, houseId);
        setExpenses(data.expenses || []);
      } catch (err) {
        setExpensesError(err instanceof Error ? err.message : 'Unknown error');
        setExpenses([]);
      } finally {
        setIsLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [houseId, token]);

  const total = expenses.filter(e => e.type !== 'settlement').reduce((sum, e) => sum + e.amount, 0);

  const users = [userName, ...roommates];

  const balances: Record<string, number> = {};
  users.forEach(user => (balances[user] = 0));

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

      settlements.push(
        `${debtor.name} pays ${creditor.name} $${payment.toFixed(2)}`,
      );

      debtor.amount -= payment;
      creditor.amount -= payment;

      if (debtor.amount === 0) debtors.shift();
      if (creditor.amount === 0) creditors.shift();
    }

    return settlements;
  }

  const settlements = calculateSettlements(balances);

  const deleteExpense = async (id: string) => {
    if (!token) {
      Alert.alert('Not authenticated', 'Please log in again.');
      return;
    }

    try {
      await expenseApi.deleteExpense(token, id, houseId);
      setExpenses(prev => prev.filter(e => String(e.id) !== String(id)));
      setEditingExpense(null);
    } catch (err) {
      Alert.alert(
        'Unable to delete expense',
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  };

  type SplitType = 'everyone' | 'individual' | 'none';

  const handleSaveExpense = async (
    name: string,
    amount: string,
    paidBy: string,
    splitType: SplitType,
    splitWith?: string[],
    date?: string,
  ) => {
    if (splitType === 'everyone' && (isLoadingRoommates || users.length < 2)) {
      Alert.alert(
        'Roommates not ready',
        'Please wait for roommates to load before splitting with everyone.',
      );
      return false;
    }

    if (!token) {
      Alert.alert('Not authenticated', 'Please log in again.');
      return false;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return false;
    }

    const resolvedSplitWith =
      splitType === 'everyone'
        ? users
        : splitType === 'none'
          ? []
          : splitWith && splitWith.length > 0
            ? splitWith
            : [paidBy];

    const payload = {
      houseId,
      name,
      amount: parsedAmount,
      paidBy,
      splitType,
      splitWith: resolvedSplitWith,
      date: date || undefined,
      type: editingExpense?.type ?? 'expense',
    };

    try {
      if (editingExpense) {
        const response = await expenseApi.updateExpense(
          token,
          String(editingExpense.id),
          payload,
        );
        setExpenses(prev =>
          prev.map(e =>
            String(e.id) === String(editingExpense.id) ? response.expense : e,
          ),
        );
      } else {
        const response = await expenseApi.createExpense(token, payload);
        setExpenses(prev => [...prev, response.expense]);
      }

      setModalVisible(false);
      setEditingExpense(null);
      return true;
    } catch (err) {
      Alert.alert(
        editingExpense ? 'Unable to update expense' : 'Unable to create expense',
        err instanceof Error ? err.message : 'Unknown error',
      );
      return false;
    }
  };

  const handleSettle = async (
    payer: string,
    receiver: string,
    amount: number,
  ): Promise<boolean> => {
    if (!token) {
      Alert.alert('Not authenticated', 'Please log in again.');
      return false;
    }

    try {
      const response = await expenseApi.createExpense(token, {
        houseId,
        name: 'Settlement',
        amount,
        paidBy: payer,
        splitType: 'none',
        splitWith: [receiver],
        date: new Date().toISOString(),
        type: 'settlement',
      });

      setExpenses(prev => [...prev, response.expense]);
      return true;
    } catch (err) {
      Alert.alert(
        'Unable to record settlement',
        err instanceof Error ? err.message : 'Unknown error',
      );
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.subtitle}>Welcome {userName}</Text>

      {isLoadingRoommates && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <ActivityIndicator size="small" />
          <Text style={{ marginLeft: 8 }}>Loading roommates...</Text>
        </View>
      )}

      {!!roommatesError && (
        <Text style={{ color: '#d32f2f', marginBottom: 8 }}>
          {roommatesError}
        </Text>
      )}

      {isLoadingExpenses && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <ActivityIndicator size="small" />
          <Text style={{ marginLeft: 8 }}>Loading expenses...</Text>
        </View>
      )}

      {!!expensesError && (
        <Text style={{ color: '#d32f2f', marginBottom: 8 }}>
          {expensesError}
        </Text>
      )}

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      <FlatList
        data={expenses.filter(e => e.type !== 'settlement')}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setEditingExpense(item);
              setModalVisible(true);
            }}
          >
            <ExpenseItem item={item} onDelete={deleteExpense} />
          </Pressable>
        )}
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
        <PressableButton title="Back" onPress={() => navigation.goBack()} />
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
