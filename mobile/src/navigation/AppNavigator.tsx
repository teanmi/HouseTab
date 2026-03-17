import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { User } from '../api/auth';
import { HomeScreen } from '../screens/home/HomeScreen';
import type { AppStackParamList } from './types';

const AppStack = createNativeStackNavigator<AppStackParamList>();

type Props = {
  user: User;
  onLogout: () => Promise<void>;
};

export function AppNavigator({ user, onLogout }: Props) {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" options={{ headerShown: false }}>
        {() => <HomeScreen user={user} onLogout={onLogout} />}
      </AppStack.Screen>
    </AppStack.Navigator>
  );
}
