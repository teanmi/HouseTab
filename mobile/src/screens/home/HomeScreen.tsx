import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/types';
import { API_BASE_URL } from '../../config';
import { createHomeStyles } from './homeStyles';
import { useTheme } from '../../context/ThemeContext';

type House = {
  id: number;
  name: string;
  join_code: string;
  member_count: number;
  role: 'owner' | 'member';
};

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user, token, logout } = useAuth();
  const { theme } = useTheme();
  const styles = createHomeStyles(theme);

  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHouses = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/houses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch houses');
      }

      const data = await response.json();
      setHouses(Array.isArray(data?.houses) ? data.houses : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchHouses();
  }, [fetchHouses]);

  if (!user || !token) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">Welcome, {user.name}</Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">{user.email}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Your Houses</Text>

        {isLoading ? (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color="#1d4ed8" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchHouses}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : houses.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyText}>No houses yet</Text>
            <Text style={styles.emptySubtext}>Create a house or join an existing one</Text>
          </View>
        ) : (
          <FlatList
            data={houses}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={styles.houseCard}
                onPress={() => navigation.navigate('HouseDetails', { houseId: item.id })}
              >
                <View style={styles.houseCardContent}>
                  <Text style={styles.houseName}>{item.name}</Text>
                  <Text style={styles.houseCode}>Code: {item.join_code}</Text>
                  <Text style={styles.memberCount}>{item.member_count} members</Text>
                  {item.role === 'owner' && <Text style={styles.ownerBadge}>Owner</Text>}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            )}
          />
        )}

        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('CreateHouse')}
          >
            <Text style={styles.primaryButtonText}>Create House</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('JoinHouse')}
          >
            <Text style={styles.secondaryButtonText}>Join House</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}