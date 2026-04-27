import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { AuthStackParamList } from '../../navigation/types';
import { createAuthStyles } from './authStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { saveAuth } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createAuthStyles(theme), [theme]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const panelAnim = useRef(new Animated.Value(24)).current;
  const panelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(panelAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [panelAnim, panelOpacity]);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Please enter name, email, and password.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await authApi.register(name.trim(), email.trim(), password);
      await saveAuth(data.token, data.user);
    } catch (error) {
      Alert.alert(
        'Registration failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>HouseTab</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.bottomPanel,
            {
              opacity: panelOpacity,
              transform: [{ translateY: panelAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start managing your home team</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={theme.placeholderText}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={theme.placeholderText}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={theme.placeholderText}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              isLoading && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back to login</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
