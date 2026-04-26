import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme/colors';

export const createHomeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.primary,
      padding: 16,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    greeting: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '700',
    },
    email: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 14,
      marginTop: 6,
    },
    logoutButton: {
      borderWidth: 1,
      borderColor: '#FFFFFF',
      borderRadius: 999,
      minHeight: 36,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    logoutText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    panel: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    panelTitle: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
    },
    centeredContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    errorContainer: {
      borderWidth: 1,
      borderColor: '#fecaca',
      backgroundColor: '#fef2f2',
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
    },
    errorText: {
      color: '#b91c1c',
      marginBottom: 10,
    },
    retryButton: {
      alignSelf: 'flex-start',
      backgroundColor: theme.primary,
      borderRadius: 999,
      minHeight: 36,
      paddingHorizontal: 14,
      justifyContent: 'center',
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: 12,
    },
    houseCard: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    houseCardContent: {
      flex: 1,
    },
    houseName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },
    houseCode: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 4,
      fontFamily: 'monospace',
    },
    memberCount: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    ownerBadge: {
      marginTop: 4,
      color: theme.primary,
      fontWeight: '700',
      fontSize: 12,
    },
    chevron: {
      fontSize: 24,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    bottomActions: {
      marginTop: 'auto',
      gap: 10,
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
  });