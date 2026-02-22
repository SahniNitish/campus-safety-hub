import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { seedData } from '../src/services/api';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (!isLoading && !seeding) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, seeding, user]);

  const initApp = async () => {
    try {
      await seedData();
    } catch (error) {
      console.log('Seed error (may already exist):', error);
    }
    // Always finish seeding after a short delay
    setTimeout(() => {
      setSeeding(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={64} color={COLORS.white} />
        </View>
        <Text style={styles.title}>Acadia Safe</Text>
        <Text style={styles.subtitle}>Campus Safety App</Text>
      </View>
      <ActivityIndicator size="large" color={COLORS.white} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
