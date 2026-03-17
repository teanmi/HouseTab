import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from './src/config';

type User = {
  id: number;
  name: string;
  email: string;
};

type RootState = {
  authStatus: 'checking' | 'loggedOut' | 'loggedIn';
  user: User | null;
  token: string | null;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const AUTH_TOKEN_KEY = 'auth_token';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [rootState, setRootState] = useState<RootState>({
    authStatus: 'checking',
    user: null,
    token: null,
  });

  const saveAuth = useCallback(async (nextToken: string, nextUser: User) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setRootState(prev => ({
      ...prev,
      token: nextToken,
      user: nextUser,
      authStatus: 'loggedIn',
    }));
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setRootState(prev => ({
      ...prev,
      token: null,
      user: null,
      authStatus: 'loggedOut',
    }));
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) {
          setRootState(prev => ({ ...prev, authStatus: 'loggedOut' }));
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          setRootState(prev => ({ ...prev, authStatus: 'loggedOut' }));
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          return;
        }

        const data = await response.json();
        setRootState(prev => ({
          ...prev,
          token: storedToken,
          user: data.user as User,
          authStatus: 'loggedIn',
        }));
      } catch (_error) {
        setRootState(prev => ({ ...prev, authStatus: 'loggedOut' }));
      }
    };

    bootstrap();
  }, []);

  if (rootState.authStatus === 'checking') {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Checking login session...</Text>
      </SafeAreaView>
    );
  }

  if (rootState.authStatus === 'loggedIn' && rootState.user) {
    return <HomeScreen user={rootState.user} onLogout={logout} />;
  }

  return (
    <NavigationContainer>
      <AuthStack.Navigator>
        <AuthStack.Screen name="Login">
          {(props: NativeStackScreenProps<AuthStackParamList, 'Login'>) => (
            <LoginScreen {...props} onAuthSuccess={saveAuth} />
          )}
        </AuthStack.Screen>
        <AuthStack.Screen name="Register">
          {(props: NativeStackScreenProps<AuthStackParamList, 'Register'>) => (
            <RegisterScreen {...props} onAuthSuccess={saveAuth} />
          )}
        </AuthStack.Screen>
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}

async function parseApiResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || 'Request failed');
  }
  return body;
}

function LoginScreen({
  navigation,
  onAuthSuccess,
}: {
  navigation: { navigate: (screen: 'Register') => void };
  onAuthSuccess: (nextToken: string, nextUser: User) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseApiResponse(response);
      await onAuthSuccess(data.token as string, data.user as User);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={isLoading ? 'Signing in...' : 'Sign In'}
        onPress={handleLogin}
        disabled={isLoading}
      />
      <View style={styles.spacer} />
      <Button
        title="Create account"
        onPress={() => navigation.navigate('Register')}
      />
    </SafeAreaView>
  );
}

function RegisterScreen({
  navigation,
  onAuthSuccess,
}: {
  navigation: { navigate: (screen: 'Login') => void };
  onAuthSuccess: (nextToken: string, nextUser: User) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Please enter name, email, and password.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await parseApiResponse(response);
      await onAuthSuccess(data.token as string, data.user as User);
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
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={isLoading ? 'Creating account...' : 'Create Account'}
        onPress={handleRegister}
        disabled={isLoading}
      />
      <View style={styles.spacer} />
      <Button
        title="Back to login"
        onPress={() => navigation.navigate('Login')}
      />
    </SafeAreaView>
  );
}

function HomeScreen({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => Promise<void>;
}) {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.infoText}>Welcome, {user.name}</Text>
      <Text style={styles.infoText}>{user.email}</Text>
      <View style={styles.spacer} />
      <Button title="Logout" onPress={onLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  spacer: {
    height: 8,
  },
  infoText: {
    fontSize: 16,
  },
});

export default App;
