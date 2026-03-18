import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

type House = {
  id: number;
  name: string;
  join_code: string;
};

export const JoinHouseScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { token } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinHouse = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Required', 'Please enter a join code');
      return;
    }

    try {
      setIsLoading(true);

      // Debug: Log the code being sent
      console.log('Attempting to join house with code:', joinCode);

      const requestBody = { join_code: joinCode };
      console.log('Request body:', JSON.stringify(requestBody));

      const response = await fetch(`${API_BASE_URL}/houses/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join house');
      }

      Alert.alert('Success', `You've joined ${data.house.name}!`, [
        { text: 'OK', onPress: () => navigation.navigate('HouseList') },
      ]);
    } catch (error) {
      console.error('Join house error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to join house',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Join a House</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Join Code</Text>
        <TextInput
          style={styles.input}
          placeholder="A0A00A"
          value={joinCode}
          onChangeText={text => setJoinCode(text.toUpperCase())}
          editable={!isLoading}
          placeholderTextColor="#ccc"
          maxLength={6}
          autoCapitalize="characters"
        />
        <Text style={styles.hint}>
          Ask your roommate for their 6-character house code
        </Text>
      </View>

      {/* this the information field they will be add later on. */}
      {/* <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How to get a join code?</Text>
        <Text style={styles.infoText}>
          1. Your roommate must create a house first
        </Text>
        <Text style={styles.infoText}>
          2. They'll receive a 6-character code
        </Text>
        <Text style={styles.infoText}>
          3. They share the code with you
        </Text>
      </View> */}

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Joining...' : 'Join House'}
          onPress={handleJoinHouse}
          disabled={isLoading || joinCode.length !== 6}
          color="#1d4ed8"
        />
        <Button
          title="Cancel"
          onPress={() => navigation.navigate('HouseList')}
          disabled={isLoading}
          color="#6b7280"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    color: '#333',
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#f3e5f5',
    borderColor: '#9c27b0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a1b9a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#4a148c',
    lineHeight: 18,
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 8,
    marginTop: 16,
  },
});
