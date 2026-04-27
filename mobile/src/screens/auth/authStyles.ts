import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme/colors';

export const createAuthStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 18,
    },
    header: {
      flexGrow: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
      paddingBottom: 14,
    },
    formContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    logo: {
      width: '62%',
      aspectRatio: 1,
      maxWidth: 220,
      maxHeight: 220,
    },
    brandTitle: {
      marginTop: 0,
      fontSize: 36,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    bottomPanel: {
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 4,
    },
    keyboardPanel: {
      marginTop: 'auto',
      width: '100%',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      backgroundColor: theme.inputBackground,
      paddingHorizontal: 13,
      paddingVertical: 11,
      fontSize: 16,
      color: theme.text,
      marginBottom: 9,
    },
    primaryButton: {
      marginTop: 4,
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
      marginTop: 8,
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
