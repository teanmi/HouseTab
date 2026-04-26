import { StyleSheet } from 'react-native';
import type { Theme } from '../theme/colors';

export const createBudgetStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.primary,
      padding: 16,
    },
    panel: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 14,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
      marginTop: 6,
      color: theme.textSecondary,
    },
    totalCard: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 14,
      marginTop: 12,
    },
    totalLabel: {
      color: theme.textSecondary,
      fontSize: 12,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    totalValue: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '700',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    statusText: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    errorText: {
      color: theme.error,
      marginBottom: 8,
      fontSize: 13,
    },
    section: {
      flex: 1,
      marginTop: 8,
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    expensesList: {
      flex: 1,
    },
    expenseItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    expenseName: {
      fontSize: 16,
      color: theme.text,
    },
    expenseAmount: {
      fontWeight: '600',
      paddingRight: 12,
      color: theme.text,
    },
    expenseMeta: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    spacer: {
      height: 12,
    },
    total: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: theme.text,
    },
    centeredContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      gap: 6,
    },
    emptyContainer: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    actionContainer: {
      paddingTop: 16,
      gap: 10,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 999,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 999,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBackground,
    },
    secondaryButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonPressed: {
      opacity: 0.85,
    },
    pressableButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 999,
      alignItems: 'center',
    },
    pressableButtonPressed: {
      opacity: 0.7,
    },
    pressableText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.35)',
    },
    bottomSheet: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 12,
      color: theme.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      color: theme.text,
    },
    deleteButton: {
      backgroundColor: theme.error,
      justifyContent: 'center',
      alignItems: 'center',
      width: 100,
      marginVertical: 4,
      borderRadius: 14,
    },
    deleteText: {
      color: 'white',
      fontWeight: '600',
    },
    buttonGroup: {
      marginTop: 10,
      gap: 10,
    },
    listContent: {
      paddingBottom: 12,
    },
    buttonSpacing: {
      marginBottom: 20,
    },
    sheetHandle: {
      width: 40,
      height: 5,
      backgroundColor: theme.border,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 15,
    },
    balanceCard: {
      backgroundColor: theme.inputBackground,
      padding: 14,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    balanceName: {
      fontWeight: '700',
      fontSize: 16,
      color: theme.text,
    },
    balanceLabel: {
      marginTop: 4,
      color: theme.textSecondary,
    },
    overviewTrack: {
      height: 12,
      backgroundColor: theme.border,
      borderRadius: 6,
      overflow: 'hidden',
      marginTop: 4,
    },
    overviewText: {
      marginTop: 4,
      color: theme.textSecondary,
    },
  });
