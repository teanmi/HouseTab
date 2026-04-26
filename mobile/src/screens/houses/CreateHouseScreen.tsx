import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createHouseFormStyles } from './houseStyles';

export const CreateHouseScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createHouseFormStyles(theme), [theme]);
  const [houseName, setHouseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdHouse, setCreatedHouse] = useState<{
    id: number;
    name: string;
    join_code: string;
  } | null>(null);

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
      setCreatedHouse(data.house);
      setHouseName('');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create house',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create a house</Text>
          <Text style={styles.subtitle}>
            Set up a shared space for your group.
          </Text>
        </View>

        <View style={styles.panel}>
          {createdHouse && (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>House created</Text>
              <Text style={styles.successText}>
                Share this code with others: {createdHouse.join_code}
              </Text>

              <View style={styles.successActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate('HouseDetails', {
                      houseId: createdHouse.id,
                    })
                  }
                >
                  <Text style={styles.primaryButtonText}>View House</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>House Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Sunny Apartments"
              value={houseName}
              onChangeText={setHouseName}
              editable={!isLoading}
              placeholderTextColor={theme.placeholderText}
            />
            <Text style={styles.hint}>
              Pick a friendly name everyone will recognize.
            </Text>
          </View>

          <View style={styles.buttonStack}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleCreateHouse}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Creating...' : 'Create House'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate('Home')}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
