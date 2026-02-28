import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { locationsAPI } from '../../src/services/api';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS, CAMPUS_LOCATIONS } from '../../src/constants/theme';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import Card from '../../src/components/Card';

const { width, height } = Dimensions.get('window');

const LOCATION_TYPES = [
  { id: 'all', label: 'All', icon: 'apps', color: COLORS.primary },
  { id: 'emergency_phone', label: 'Phones', icon: 'call', color: COLORS.info },
  { id: 'aed', label: 'AEDs', icon: 'heart', color: COLORS.accent },
  { id: 'safe_building', label: 'Safe', icon: 'business', color: COLORS.secondary },
  { id: 'security_office', label: 'Security', icon: 'shield', color: COLORS.primary },
  { id: 'parking', label: 'Parking', icon: 'car', color: COLORS.gray[600] },
];

// Acadia University Campus region
const ACADIA_REGION = {
  latitude: 45.0875,
  longitude: -64.3665,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
    fetchLocations();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
    } catch (error) {
      console.log('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = selectedFilter === 'all' 
    ? locations 
    : locations.filter(loc => loc.location_type === selectedFilter);

  const getLocationIcon = (type: string) => {
    const locType = LOCATION_TYPES.find(t => t.id === type);
    return locType?.icon || 'location';
  };

  const getLocationColor = (type: string) => {
    const locType = LOCATION_TYPES.find(t => t.id === type);
    return locType?.color || COLORS.primary;
  };

  const calculateDistance = (lat: number, lng: number) => {
    if (!userLocation) return null;
    const R = 6371; // km
    const dLat = (lat - userLocation.latitude) * Math.PI / 180;
    const dLon = (lng - userLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c * 1000; // meters
    return d < 1000 ? `${Math.round(d)}m` : `${(d/1000).toFixed(1)}km`;
  };

  const handleMarkerPress = (location: any) => {
    setSelectedLocation(location);
    mapRef.current?.animateToRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    }, 500);
  };

  const centerOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const centerOnCampus = () => {
    mapRef.current?.animateToRegion(ACADIA_REGION, 500);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading map..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Map</Text>
        <Text style={styles.subtitle}>Safety resources at Acadia</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {LOCATION_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              selectedFilter === type.id && styles.filterChipActive,
            ]}
            onPress={() => {
              setSelectedFilter(type.id);
              setSelectedLocation(null);
            }}
          >
            <Ionicons 
              name={type.icon as any} 
              size={16} 
              color={selectedFilter === type.id ? COLORS.white : COLORS.gray[600]} 
            />
            <Text style={[
              styles.filterLabel,
              selectedFilter === type.id && styles.filterLabelActive,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={ACADIA_REGION}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          mapType="standard"
        >
          {/* Location Markers */}
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.lat,
                longitude: location.lng,
              }}
              title={location.name}
              description={location.description}
              onPress={() => handleMarkerPress(location)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getLocationColor(location.location_type) },
                selectedLocation?.id === location.id && styles.markerSelected,
              ]}>
                <Ionicons 
                  name={getLocationIcon(location.location_type) as any} 
                  size={16} 
                  color={COLORS.white} 
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton} onPress={centerOnCampus}>
            <Ionicons name="school" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton} onPress={centerOnUser}>
            <Ionicons name="locate" size={22} color={COLORS.info} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            {LOCATION_TYPES.filter(t => t.id !== 'all').map((type) => (
              <View key={type.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: type.color }]} />
                <Text style={styles.legendText}>{type.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Selected Location Details */}
      {selectedLocation && (
        <View style={styles.detailsContainer}>
          <Card style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View style={[styles.detailsIcon, { backgroundColor: getLocationColor(selectedLocation.location_type) }]}>
                <Ionicons 
                  name={getLocationIcon(selectedLocation.location_type) as any} 
                  size={20} 
                  color={COLORS.white} 
                />
              </View>
              <View style={styles.detailsInfo}>
                <Text style={styles.detailsName}>{selectedLocation.name}</Text>
                {userLocation && (
                  <Text style={styles.detailsDistance}>
                    {calculateDistance(selectedLocation.lat, selectedLocation.lng)} away
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedLocation(null)}
              >
                <Ionicons name="close" size={20} color={COLORS.gray[500]} />
              </TouchableOpacity>
            </View>
            {selectedLocation.description && (
              <Text style={styles.detailsDescription}>{selectedLocation.description}</Text>
            )}
          </Card>
        </View>
      )}

      {/* Locations Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredLocations.length} {selectedFilter === 'all' ? 'locations' : LOCATION_TYPES.find(t => t.id === selectedFilter)?.label} on campus
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.gray[800],
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: COLORS.white,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    right: SPACING.sm,
    top: SPACING.sm,
    gap: SPACING.sm,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  legend: {
    position: 'absolute',
    left: SPACING.sm,
    bottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  legendTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[600],
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  markerSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
  },
  detailsContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  detailsCard: {
    padding: SPACING.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  detailsName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  detailsDistance: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  detailsDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[600],
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  countContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  countText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },
});
