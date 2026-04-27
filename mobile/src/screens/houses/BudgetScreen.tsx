import React, { useEffect, useMemo, useState } from 'react';
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

import ExpenseItem from '../../components/ExpenseItem';
import ExpenseModal from '../../components/ExpenseModal';

import { Expense } from '../../types/Expense';
import { createBudgetStyles } from '../../styles/budgetStyles';
import type { AppStackParamList } from '../../navigation/types';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { expenseApi } from '../../api/expenses';
import { useTheme } from '../../context/ThemeContext';

import BalancesModal from '../../components/BalancesModal';

type BudgetScreenProps = {
  navigation: NavigationProp<AppStackParamList, 'Budget'>;
  route: RouteProp<AppStackParamList, 'Budget'>;
};

export function BudgetScreen({ navigation, route }: BudgetScreenProps) {
  const { userName, houseId } = route.params;
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createBudgetStyles(theme), [theme]);
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

  const total = expenses
    .filter(e => e.type !== 'settlement')
    .reduce((sum, e) => sum + e.amount, 0);
  const visibleExpenses = expenses.filter(e => e.type !== 'settlement');

  const houseUsers = Array.from(
    new Set([userName, ...roommates].filter(name => !!name?.trim())),
  );

  const users = Array.from(
    new Set(
      [
        ...houseUsers,
        ...expenses.flatMap(expense => [
          expense.paidBy,
          ...(expense.splitWith || []),
        ]),
      ].filter(name => !!name?.trim()),
    ),
  );

  const toCents = (value: number) => Math.round(value * 100);
  const fromCents = (value: number) => value / 100;

  const calculateBalances = (
    allExpenses: Expense[],
    allUsers: string[],
    allHouseUsers: string[],
  ): Record<string, number> => {
    const knownUsers = new Set(allUsers);
    const centBalances: Record<string, number> = {};
    allUsers.forEach(user => {
      centBalances[user] = 0;
    });

    const expensesInOrder = [...allExpenses].sort((a, b) => {
      const idA = Number(a.id);
      const idB = Number(b.id);
      if (Number.isFinite(idA) && Number.isFinite(idB)) {
        return idA - idB;
      }

      return String(a.id).localeCompare(String(b.id));
    });

    for (const expense of expensesInOrder) {
      const payer = expense.paidBy;
      if (!knownUsers.has(payer)) {
        continue;
      }

      const amountCents = toCents(expense.amount);
      if (amountCents <= 0) {
        continue;
      }

      if (expense.type === 'settlement') {
        const receivers = (expense.splitWith || []).filter(
          user => knownUsers.has(user) && user !== payer,
        );

        if (receivers.length === 0) {
          continue;
        }

        const sharePerReceiver = Math.floor(amountCents / receivers.length);
        let remainingCents = amountCents;

        receivers.forEach((receiver, index) => {
          const receiverShare =
            index === receivers.length - 1
              ? remainingCents
              : sharePerReceiver;
          remainingCents -= receiverShare;

          // Cap settlement transfer to prevent over-settling from corrupting balances.
          const payerDebtCents = Math.max(0, -centBalances[payer]);
          const receiverCreditCents = Math.max(0, centBalances[receiver]);
          const transferableCents = Math.min(
            receiverShare,
            payerDebtCents,
            receiverCreditCents,
          );

          if (transferableCents > 0) {
            centBalances[payer] += transferableCents;
            centBalances[receiver] -= transferableCents;
          }
        });

        continue;
      }

      let participants: string[] = [];
      if (expense.splitType === 'everyone') {
        const selected = Array.from(
          new Set((expense.splitWith || []).filter(user => knownUsers.has(user))),
        );
        participants =
          selected.length > 0
            ? selected
            : allHouseUsers.length > 0
            ? allHouseUsers
            : [payer];
      } else if (expense.splitType === 'individual') {
        const selected = Array.from(
          new Set((expense.splitWith || []).filter(user => knownUsers.has(user))),
        );
        participants = selected.length > 0 ? selected : [payer];
      } else if (expense.splitType === 'none') {
        participants = [];
      } else {
        // Fallback for legacy records with missing/invalid splitType.
        const selected = Array.from(
          new Set((expense.splitWith || []).filter(user => knownUsers.has(user))),
        );
        participants =
          selected.length > 0
            ? selected
            : allHouseUsers.length > 0
            ? allHouseUsers
            : [payer];
      }

      if (participants.length === 0) {
        continue;
      }

      const sharePerParticipant = Math.floor(amountCents / participants.length);
      let remainingCents = amountCents;

      participants.forEach((participant, index) => {
        const participantShare =
          index === participants.length - 1
            ? remainingCents
            : sharePerParticipant;
        remainingCents -= participantShare;
        centBalances[participant] -= participantShare;
      });

      centBalances[payer] += amountCents;
    }

    const numericBalances: Record<string, number> = {};
    allUsers.forEach(user => {
      numericBalances[user] = fromCents(centBalances[user]);
    });

    return numericBalances;
  };

  function calculateSettlements(balances: Record<string, number>) {
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, amount]) => {
      const cents = toCents(amount);
      if (cents < 0) debtors.push({ name, amount: -cents });
      if (cents > 0) creditors.push({ name, amount: cents });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const computedSettlements: string[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const paymentCents = Math.min(debtor.amount, creditor.amount);

      computedSettlements.push(
        `${debtor.name} pays ${creditor.name} $${fromCents(paymentCents).toFixed(2)}`,
      );

      debtor.amount -= paymentCents;
      creditor.amount -= paymentCents;

      if (debtor.amount === 0) debtorIndex += 1;
      if (creditor.amount === 0) creditorIndex += 1;
    }

    return computedSettlements;
  }

  const balances = calculateBalances(expenses, users, houseUsers);
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
    if (
      splitType === 'everyone' &&
      (isLoadingRoommates || houseUsers.length < 2)
    ) {
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
        ? houseUsers
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
        editingExpense
          ? 'Unable to update expense'
          : 'Unable to create expense',
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>Welcome {userName}</Text>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {isLoadingRoommates && (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.statusText}>Loading roommates...</Text>
          </View>
        )}

        {!!roommatesError && (
          <Text style={styles.errorText}>{roommatesError}</Text>
        )}

        {!!expensesError && (
          <Text style={styles.errorText}>{expensesError}</Text>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Expenses ({visibleExpenses.length})
            </Text>
          </View>

          <FlatList
            data={visibleExpenses}
            keyExtractor={item => String(item.id)}
            style={styles.expensesList}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              isLoadingExpenses ? (
                <View style={styles.centeredContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={styles.statusText}>Loading expenses...</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No expenses yet</Text>
                </View>
              )
            }
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
        </View>

        <View style={styles.actionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.primaryButtonText}>Add Expense</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setBalancesVisible(true)}
          >
            <Text style={styles.secondaryButtonText}>Balances</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>

      <ExpenseModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        expenseToEdit={editingExpense}
        users={houseUsers}
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
