import React, { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createAuthStyles } from '../../screens/auth/authStyles';

type PasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function PasswordInput({
  value,
  onChangeText,
  placeholder = 'Password',
}: PasswordInputProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createAuthStyles(theme), [theme]);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={!showPassword}
        keyboardType="default"
        placeholder={placeholder}
        placeholderTextColor={theme.placeholderText}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
      />
      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Text style={styles.showPasswordButtonText}>
          {showPassword ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
