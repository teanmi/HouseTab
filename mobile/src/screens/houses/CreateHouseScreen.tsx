import React, { useState } from 'react';
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

type House = {
  id: number;
  name: string;
  join_code: string;
  created_by: number;
};

type CreateHouseScreenProps = {
  token: string;
  onHouseCreated: (house: House) => void;
  onCancel: () => void;
};

const CreateHouseScreen = ({ token, onHouseCreated, onCancel }: CreateHouseScreenProps) => {
  const [houseName, setHouseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHouse = async () => {
    if (!houseName.trim()) {
      Alert.alert('Required', 'Please enter a house name');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/houses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: houseName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create house');
      }

      const data = await response.json();

      Alert.alert(
        'Success',
        `House created!\n\nShare this code with others: ${data.house.join_code}`,
        [{ text: 'OK', onPress: () => onHouseCreated(data.house) }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create house'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create a New House</Text>

      <View style={styles.section}>
        <Text style={styles.label}>House Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Sunny Apartments"
          value={houseName}
          onChangeText={setHouseName}
          editable={!isLoading}
          placeholderTextColor="#ccc"
        />
      </View>
{/* this the information field they will be add later on. */}
      {/* <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What's a House?</Text>
        <Text style={styles.infoText}>
          A house is a shared space where you and your roommates can manage expenses together.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Share Your Join Code</Text>
        <Text style={styles.infoText}>
          After creating a house, you'll get a unique 6-character code. Share this code with your roommates so they can join.
        </Text>
      </View> */}

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Creating...' : 'Create House'}
          onPress={handleCreateHouse}
          disabled={isLoading}
          color="#1d4ed8"
        />
        <Button
          title="Cancel"
          onPress={onCancel}
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
    fontSize: 16,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#0d47a1',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 8,
    marginTop: 16,
  },
});

export default CreateHouseScreen;
