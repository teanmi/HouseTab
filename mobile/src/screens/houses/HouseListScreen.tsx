import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

type House = {
  id: number;
  name: string;
  join_code: string;
  member_count: number;
  role: 'owner' | 'member';
};

export const HouseListScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { token } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHouses();
  }, [token]);

  const fetchHouses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/houses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(token);
      console.log('Fetch houses response status:', response);

      if (!response.ok) {
        throw new Error('Failed to fetch houses');
      }

      const data = await response.json();
      setHouses(data.houses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHouseCard = ({ item }: { item: House }) => (
    <TouchableOpacity
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
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Houses</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchHouses} />
        </View>
      )}

      {houses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No houses yet</Text>
          <Text style={styles.emptySubtext}>
            Create a house or join an existing one
          </Text>
        </View>
      ) : (
        <FlatList
          data={houses}
          renderItem={renderHouseCard}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={houses.length > 2}
          style={styles.list}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Create House" onPress={() => navigation.navigate('CreateHouse')} color="#1d4ed8" />
        <Button title="Join House" onPress={() => navigation.navigate('JoinHouse')} color="#3b82f6" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  houseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  houseCardContent: {
    flex: 1,
  },
  houseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  houseCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  ownerBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  buttonContainer: {
    gap: 8,
  },
});
