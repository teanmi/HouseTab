import React, { useMemo } from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createAuthStyles } from '../../screens/auth/authStyles';

type EmailInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function EmailInput({
  value,
  onChangeText,
  placeholder = 'Email',
}: EmailInputProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createAuthStyles(theme), [theme]);

  return (
    <TextInput
      style={styles.input}
      autoCapitalize="none"
      keyboardType="email-address"
      placeholder={placeholder}
      placeholderTextColor={theme.placeholderText}
      value={value}
      onChangeText={onChangeText}
      autoCorrect={false}
      autoComplete="email"
      textContentType="emailAddress"
    />
  );
}
