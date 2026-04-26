import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme/colors';

export const createAuthStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.primary,
      padding: 24,
    },
    header: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 24,
    },
    logo: {
      width: '70%',
      aspectRatio: 1,
      maxWidth: 260,
      maxHeight: 260,
    },
    brandTitle: {
      marginTop: 0,
      fontSize: 40,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    bottomPanel: {
      backgroundColor: theme.cardBackground,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 'auto',
      marginBottom: 8,
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 14,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      backgroundColor: theme.inputBackground,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 10,
    },
    primaryButton: {
      marginTop: 6,
      backgroundColor: theme.primary,
      borderRadius: 999,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonPressed: {
      opacity: 0.85,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 999,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBackground,
    },
    secondaryButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    welcomeContainer: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 24,
    },
    bottomActions: {
      width: '100%',
      gap: 12,
      paddingBottom: 16,
    },
    heroPrimaryButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 999,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroPrimaryButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    heroSecondaryButton: {
      borderWidth: 1,
      borderColor: '#FFFFFF',
      borderRadius: 999,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    heroSecondaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
