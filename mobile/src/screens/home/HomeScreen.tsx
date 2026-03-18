import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user, logout } = useAuth();
  const roomates = ['roomate1', 'roomate2', 'roomate3'];

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.infoText}>Welcome, {user.name}</Text>
      <Text style={styles.infoText}>{user.email}</Text>
      <View style={styles.spacer} />
      <Button
        title="Open Budget"
        onPress={() => navigation.navigate('Budget', { userName: user.name, roomates })}
      />
      <Button title="Logout" onPress={logout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  spacer: {
    height: 8,
  },
  infoText: {
    fontSize: 16,
  },
});
