import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { User } from '../api/auth';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import type { AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

type Props = {
  onAuthSuccess: (nextToken: string, nextUser: User) => Promise<void>;
};

export function AuthNavigator({ onAuthSuccess }: Props) {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login">
        {(props: NativeStackScreenProps<AuthStackParamList, 'Login'>) => (
          <LoginScreen {...props} onAuthSuccess={onAuthSuccess} />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props: NativeStackScreenProps<AuthStackParamList, 'Register'>) => (
          <RegisterScreen {...props} onAuthSuccess={onAuthSuccess} />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}
