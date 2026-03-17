import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authApi } from './src/api/auth';
import type { User } from './src/api/auth';
import { RootNavigator } from './src/navigation/RootNavigator';

type RootState = {
  authStatus: 'checking' | 'loggedOut' | 'loggedIn';
  user: User | null;
  token: string | null;
};

const AUTH_TOKEN_KEY = 'auth_token';

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

  return (
    <RootNavigator
      authStatus={rootState.authStatus}
      user={rootState.user}
      onAuthSuccess={saveAuth}
      onLogout={logout}
    />
  );
}

export default App;
