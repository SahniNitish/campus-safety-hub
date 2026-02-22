import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { alertsAPI } from '../../src/services/api';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS, ALERT_TYPES } from '../../src/constants/theme';
import Card from '../../src/components/Card';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [latestAlert, setLatestAlert] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLatestAlert();
  }, []);

  const fetchLatestAlert = async () => {
    try {
      const response = await alertsAPI.getAll();
      if (response.data.length > 0) {
        setLatestAlert(response.data[0]);
      }
    } catch (error) {
      console.log('Error fetching alerts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLatestAlert();
    setRefreshing(false);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  const quickActions = [
    { id: 'escort', title: 'Safety Escort', icon: 'walk', route: '/escort-request' },
    { id: 'report', title: 'Report Incident', icon: 'document-text', route: '/incident-report' },
    { id: 'friend', title: 'Friend Walk', icon: 'people', route: '/friend-walk' },
    { id: 'map', title: 'Campus Map', icon: 'map', route: '/(tabs)/map' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {firstName}</Text>
            <Text style={styles.welcomeText}>Stay safe on campus</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.profileButton}
          >
            <Ionicons name="person-circle" size={44} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => router.push('/sos')}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle" size={48} color={COLORS.white} />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>EMERGENCY</Text>
          </TouchableOpacity>
          <Text style={styles.sosTip}>Tap for immediate help</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name={action.icon as any} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Latest Alert */}
        {latestAlert && (
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
              <Text style={styles.sectionTitle}>Recent Alert</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <Card style={styles.alertCard}>
              <View style={styles.alertContent}>
                <View style={[
                  styles.alertIcon,
                  { backgroundColor: ALERT_TYPES[latestAlert.alert_type as keyof typeof ALERT_TYPES]?.color || COLORS.info }
                ]}>
                  <Ionicons
                    name={ALERT_TYPES[latestAlert.alert_type as keyof typeof ALERT_TYPES]?.icon as any || 'information-circle'}
                    size={20}
                    color={COLORS.white}
                  />
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {latestAlert.title}
                  </Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {latestAlert.message}
                  </Text>
                  <Text style={styles.alertTime}>
                    {format(new Date(latestAlert.created_at), 'MMM d, h:mm a')}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Emergency Contacts Quick Access */}
        <TouchableOpacity
          style={styles.emergencyContactsButton}
          onPress={() => router.push('/emergency-contacts')}
        >
          <Ionicons name="call" size={24} color={COLORS.white} />
          <Text style={styles.emergencyContactsText}>Emergency Contacts</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.gray[800],
  },
  welcomeText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  sosSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  sosText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  sosSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  sosTip: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },
  actionsSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  alertSection: {
    marginTop: SPACING.md,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  alertCard: {
    padding: SPACING.md,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[400],
  },
  emergencyContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  emergencyContactsText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
