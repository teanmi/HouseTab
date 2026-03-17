import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
import type { User } from '../api/auth';

type AuthStatus = 'checking' | 'loggedOut' | 'loggedIn';

type AuthContextValue = {
  authStatus: AuthStatus;
  user: User | null;
  token: string | null;
  saveAuth: (nextToken: string, nextUser: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AUTH_TOKEN_KEY = 'auth_token';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
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

        const data = await authApi.getMe(storedToken);
        setToken(storedToken);
        setUser(data.user);
        setAuthStatus('loggedIn');
      } catch (_error) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
        setAuthStatus('loggedOut');
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      authStatus,
      user,
      token,
      saveAuth,
      logout,
    }),
    [authStatus, user, token, saveAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
