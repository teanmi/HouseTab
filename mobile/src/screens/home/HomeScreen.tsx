import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user, token, logout } = useAuth();

  if (!user || !token) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.infoText}>{user.email}</Text>
      <View style={styles.spacer} />
      <Button
        title="View Houses"
        onPress={() => navigation.navigate('HouseList')}
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


// const handleSelectHouse = (house: House) => {
//     setSelectedHouse(house);
//     setCurrentScreen('details');
//   };

//   const handleHouseCreated = (_house: any) => {
//     setCurrentScreen('list');
//   };

//   const handleHouseJoined = (_house: any) => {
//     setCurrentScreen('list');
//   };

//   const handleBackToList = () => {
//     setCurrentScreen('list');
//     setSelectedHouse(null);
//   };