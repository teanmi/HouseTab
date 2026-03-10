import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const AUTH_TOKEN_KEY = 'auth_token';
const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

const Stack = createNativeStackNavigator<AuthStackParamList>();

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
  const [authStatus, setAuthStatus] = useState<
    'checking' | 'loggedOut' | 'loggedIn'
  >('checking');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const saveAuth = useCallback(async (nextToken: string, nextUser: User) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setAuthStatus('loggedIn');
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthStatus('loggedOut');
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) {
          setAuthStatus('loggedOut');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          setAuthStatus('loggedOut');
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          return;
        }

        const data = await response.json();
        setToken(storedToken);
        setUser(data.user as User);
        setAuthStatus('loggedIn');
      } catch (_error) {
        setAuthStatus('loggedOut');
      }
    };

    bootstrap();
  }, []);

  const context = useMemo(
    () => ({
      saveAuth,
      logout,
      token,
      user,
    }),
    [logout, saveAuth, token, user],
  );

  if (authStatus === 'checking') {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Checking login session...</Text>
      </SafeAreaView>
    );
  }

  if (authStatus === 'loggedIn' && context.user) {
    return <HomeScreen user={context.user} onLogout={context.logout} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login">
          {props => <LoginScreen {...props} onAuthSuccess={context.saveAuth} />}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {props => (
            <RegisterScreen {...props} onAuthSuccess={context.saveAuth} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
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
