import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from './src/api/auth';
import type { User } from './src/api/auth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { HomeScreen } from './src/screens/home/HomeScreen';

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

        const data = await authApi.getMe(storedToken);
        setRootState(prev => ({
          ...prev,
          token: storedToken,
          user: data.user,
          authStatus: 'loggedIn',
        }));
      } catch (_error) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
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

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  infoText: {
    fontSize: 16,
  },
});

export default App;
