import React, { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import type { AuthStackParamList } from '../../navigation/types';
import { createAuthStyles } from './authStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createAuthStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.welcomeContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>HouseTab</Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.heroPrimaryButton}
          >
            <Text style={styles.heroPrimaryButtonText}>Sign In</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={styles.heroSecondaryButton}
          >
            <Text style={styles.heroSecondaryButtonText}>Register</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}