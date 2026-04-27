import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export const JoinHouseScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createHouseFormStyles(theme), [theme]);
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
        throw new Error(
          data?.message || `Failed to join house (status ${response.status})`,
        );
      }

      // Support a few possible response shapes for the joined house id
      const idCandidates = [
        data?.house?.id,
        data?.house_id,
        data?.id,
        data?.house?.house_id,
        data?.houseId,
      ];

      const found = idCandidates.find(v => v !== undefined && v !== null);
      const joinedHouseId = Number(found ?? NaN);

      if (!Number.isFinite(joinedHouseId)) {
        console.warn(
          'JoinHouseScreen: joined house id missing in response, falling back to Home',
          data,
        );
        navigation.navigate('Home');
        return;
      }

      navigation.navigate('HouseDetails', { houseId: joinedHouseId });
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
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.formContainerCentered}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 64}
      >
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.title}>Join a house</Text>
            <Text style={styles.subtitle}>
              Enter the code your roommate shared.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Join Code</Text>
            <TextInput
              style={styles.input}
              placeholder="A0A00A"
              value={joinCode}
              onChangeText={text => setJoinCode(text.toUpperCase())}
              editable={!isLoading}
              placeholderTextColor={theme.placeholderText}
              maxLength={6}
              autoCapitalize="characters"
            />
            <Text style={styles.hint}>
              Ask your roommate for their 6-character house code.
            </Text>
          </View>

          <View style={styles.buttonStack}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                (isLoading || joinCode.length !== 6) && { opacity: 0.7 },
              ]}
              onPress={handleJoinHouse}
              disabled={isLoading || joinCode.length !== 6}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Joining...' : 'Join House'}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
