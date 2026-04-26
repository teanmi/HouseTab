import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { HomeScreen } from '../screens/home/HomeScreen';
import { BudgetScreen } from '../screens/houses/BudgetScreen';
import { CreateHouseScreen } from '../screens/houses/CreateHouseScreen';
import { JoinHouseScreen } from '../screens/houses/JoinHouseScreen';
import { HouseDetailsScreen } from '../screens/houses/HouseDetailsScreen';
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
        name="CreateHouse"
        component={CreateHouseScreen}
        options={{ title: 'Create House' }}
      />
      <AppStack.Screen
        name="JoinHouse"
        component={JoinHouseScreen}
        options={{ title: 'Join House' }}
      />
      <AppStack.Screen
        name="HouseDetails"
        component={HouseDetailsScreen}
        options={{ title: 'House Details' }}
      />
      <AppStack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ headerShown: false }}
      />
    </AppStack.Navigator>
  );
}