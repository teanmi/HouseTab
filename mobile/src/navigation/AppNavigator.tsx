import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { HomeScreen } from '../screens/home/HomeScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import type { AppStackParamList } from './types';

const AppStack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ headerShown: false }}
      />
    </AppStack.Navigator>
  );
}
