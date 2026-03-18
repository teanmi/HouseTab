import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

type House = {
  id: number;
  name: string;
  join_code: string;
  created_by: number;
  created_at: string;
  member_count: number;
};

type Member = {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joined_at: string;
};

export const HouseDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'HouseDetails'>>();
  const { user, token } = useAuth();
  const { houseId } = route.params;
  const [house, setHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user || !token) {
    return null;
  }

  useEffect(() => {
    fetchHouseDetails();
  }, [houseId, token]);

  const fetchHouseDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/houses/${houseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch house details');
      }

      const data = await response.json();
      setHouse(data.house);
      setMembers(data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!house) return;

    try {
      await Share.share({
        message: `${house.join_code}`,
        title: `Join ${house.name}`,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to share code');
    }
  };

  const renderMemberItem = ({ item }: { item: Member }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !house) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'House not found'}</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.navigate('HouseList')}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.houseName}>{house.name}</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Join Code:</Text>
          <Text style={styles.codeValue}>{house.join_code}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
        </View>
        {members.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No members yet</Text>
          </View>
        ) : (
          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles.actionContainer}>
        <Button
            title="Open Budget"
            onPress={() =>
            navigation.navigate('Budget', { userName: user.name, houseId })
            }
        />
        <Button
          title="Share Join Code"
          onPress={handleShareCode}
          color="#1d4ed8"
        />
        <Button
          title="Go Back"
          onPress={() => navigation.navigate('HouseList')}
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
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  houseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  codeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#999',
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e7d32',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  actionContainer: {
    padding: 16,
    gap: 8,
  },
});
