import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { sosAPI } from '../src/services/api';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';
import Button from '../src/components/Button';

type SOSState = 'type' | 'countdown' | 'sent';

const EMERGENCY_TYPES = [
  { id: 'medical', label: 'Medical Emergency', icon: 'medkit' },
  { id: 'unsafe', label: 'Unsafe Situation', icon: 'warning' },
  { id: 'crime', label: 'Crime in Progress', icon: 'alert' },
  { id: 'other', label: 'Other Emergency', icon: 'help-circle' },
];

export default function SOSScreen() {
  const router = useRouter();
  const [state, setState] = useState<SOSState>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState<any>(null);
  const [sosId, setSosId] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (state === 'countdown') {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            sendSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const startCountdown = (type?: string) => {
    setSelectedType(type || null);
    setState('countdown');
  };

  const sendSOS = async () => {
    try {
      const response = await sosAPI.create({
        location_lat: location?.lat || 45.0875,
        location_lng: location?.lng || -64.3665,
        alert_type: selectedType || undefined,
      });
      setSosId(response.data.id);
      setState('sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS alert. Please call security directly.');
      setState('type');
    }
  };

  const cancelSOS = async () => {
    if (sosId) {
      try {
        await sosAPI.cancel(sosId);
      } catch (error) {
        console.log('Error cancelling SOS:', error);
      }
    }
    router.back();
  };

  const callSecurity = () => {
    Linking.openURL('tel:9025851103');
  };

  // Type Selection Screen
  if (state === 'type') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.typeContent}>
          <Ionicons name="alert-circle" size={64} color={COLORS.white} />
          <Text style={styles.typeTitle}>What type of emergency?</Text>
          <Text style={styles.typeSubtitle}>Select for faster response or tap SOS</Text>
          
          <View style={styles.typeGrid}>
            {EMERGENCY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.typeButton}
                onPress={() => startCountdown(type.id)}
              >
                <Ionicons name={type.icon as any} size={28} color={COLORS.accent} />
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.mainSOSButton}
            onPress={() => startCountdown()}
          >
            <Text style={styles.mainSOSText}>SEND SOS NOW</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Countdown Screen
  if (state === 'countdown') {
    return (
      <SafeAreaView style={styles.containerRed}>
        <View style={styles.countdownContent}>
          <Animated.View style={[styles.countdownCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </Animated.View>
          <Text style={styles.countdownText}>Sending emergency alert...</Text>
          <Text style={styles.countdownSubtext}>
            {selectedType ? EMERGENCY_TYPES.find(t => t.id === selectedType)?.label : 'SOS Alert'}
          </Text>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setState('type');
              setCountdown(3);
            }}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Alert Sent Screen
  return (
    <SafeAreaView style={styles.containerGreen}>
      <View style={styles.sentContent}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={64} color={COLORS.white} />
        </View>
        <Text style={styles.sentTitle}>Alert Sent!</Text>
        <Text style={styles.sentSubtitle}>Help is on the way</Text>
        
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color={COLORS.accent} />
          <Text style={styles.locationText}>
            Your location has been shared with campus security
          </Text>
        </View>
        
        <View style={styles.sentActions}>
          <TouchableOpacity style={styles.callButton} onPress={callSecurity}>
            <Ionicons name="call" size={24} color={COLORS.white} />
            <Text style={styles.callButtonText}>Call Security</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.safeButton} onPress={cancelSOS}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
            <Text style={styles.safeButtonText}>I'm Safe</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.securityNumber}>Acadia Security: 902-585-1103</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  containerRed: {
    flex: 1,
    backgroundColor: COLORS.accent,
  },
  containerGreen: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  typeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  typeTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  typeSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  typeButton: {
    width: '45%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  mainSOSButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xl,
  },
  mainSOSText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  countdownContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  countdownCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  countdownText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: SPACING.xl,
  },
  countdownSubtext: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xxl,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  sentContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.lg,
  },
  sentSubtitle: {
    fontSize: FONT_SIZE.lg,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.md,
  },
  locationText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  sentActions: {
    width: '100%',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  callButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  safeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  safeButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: SPACING.sm,
  },
  securityNumber: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xl,
  },
});
