import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Share,
  Text,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createHouseDetailsStyles } from './houseStyles';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createHouseDetailsStyles(theme), [theme]);
  const { houseId } = route.params;
  const [house, setHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing authentication token');
      setIsLoading(false);
      return;
    }

    void fetchHouseDetails();
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

  if (!user || !token) {
    return null;
  }

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
      <SafeAreaView style={styles.screen}>
        <View style={[styles.panel, styles.centeredContainer]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !house) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error || 'House not found'}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.smallAction,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.smallActionText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>{house.name}</Text>
          <Text style={styles.subtitle}>Manage members and share access.</Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Join Code</Text>
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
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        <View style={styles.actionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              navigation.navigate('Budget', { userName: user.name, houseId })
            }
          >
            <Text style={styles.primaryButtonText}>Open Budget</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleShareCode}
          >
            <Text style={styles.secondaryButtonText}>Share Join Code</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
