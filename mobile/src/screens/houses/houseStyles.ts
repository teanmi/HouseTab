import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme/colors';

export const createHouseFormStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.primary,
      padding: 16,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 14,
    },
    title: {
      color: theme.text,
      fontSize: 30,
      fontWeight: '700',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 14,
      marginTop: 6,
    },
    titleWhite: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '700',
    },
    subtitleGrey: {
      color: '#E5E5EA',
      fontSize: 14,
      marginTop: 6,
    },
    panel: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    section: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    hint: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 8,
    },
    successCard: {
      backgroundColor: 'rgba(52, 199, 89, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(52, 199, 89, 0.25)',
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
    },
    successTitle: {
      color: theme.success,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    successText: {
      color: theme.text,
      fontSize: 13,
      lineHeight: 18,
    },
    successActions: {
      gap: 10,
      marginTop: 12,
    },
    buttonStack: {
      gap: 10,
      marginTop: 'auto',
      paddingTop: 10,
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
    content: {
      flexGrow: 1,
    },
  });

export const createHouseDetailsStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.primary,
      padding: 16,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 14,
    },
    title: {
      color: theme.text,
      fontSize: 30,
      fontWeight: '700',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 14,
      marginTop: 6,
    },
    panel: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    codeCard: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 14,
      marginTop: 12,
    },
    codeLabel: {
      color: theme.textSecondary,
      fontSize: 12,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    codeValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 1.5,
      fontFamily: 'monospace',
    },
    section: {
      marginTop: 16,
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
    memberItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    memberEmail: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    roleBadge: {
      borderRadius: 999,
      backgroundColor: 'rgba(41, 131, 183, 0.12)',
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    roleText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
      textTransform: 'capitalize',
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
    centeredContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      padding: 16,
    },
    errorCard: {
      width: '100%',
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      fontSize: 15,
      color: theme.error,
      textAlign: 'center',
    },
    smallAction: {
      borderRadius: 999,
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: theme.primary,
    },
    smallActionText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: 12,
    },
  });
