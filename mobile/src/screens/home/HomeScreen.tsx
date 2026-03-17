import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { User } from '../../api/auth';

type Props = {
  user: User;
  onLogout: () => Promise<void>;
};

export function HomeScreen({ user, onLogout }: Props) {
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
