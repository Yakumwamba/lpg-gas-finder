import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import locationService from '../services/locationService';
import { providerAPI, calculateDistance } from '../config/api';
import { useAuth } from '../context/AuthContext';
import theme from '../config/theme';

/**
 * NOTE: HomeScreen now fetches real provider data from the backend API
 * instead of using mock data. This integration enables:
 * - Real-time provider listing from Go backend
 * - Distance calculation using Haversine formula
 * - Dynamic filtering and sorting by distance
 */

/**
 * Home Screen - Displays nearest LPG gas refill stations from backend
 */
const HomeScreen = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestStations, setNearestStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState(5); // km

  /**
   * Initialize location and find nearest stations on component mount
   */
  useEffect(() => {
    initializeLocation();
  }, []);

  /**
   * Refresh provider data when screen comes into focus
   * This ensures the list is always up-to-date with the backend
   */
  useFocusEffect(
    React.useCallback(() => {
      if (currentLocation) {
        fetchProvidersAndFilterByDistance(currentLocation);
      }
    }, [currentLocation, maxDistance])
  );

  const initializeLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        await fetchProvidersAndFilterByDistance(location);
      } else {
        Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load location');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch providers from backend API and filter by distance
   * - Calls backend API to get all LPG providers
   * - Transforms provider data to match UI expectations
   * - Calculates distance from user's current location
   * - Filters providers by maxDistance radius
   * - Sorts results by distance (nearest first)
   */
  const fetchProvidersAndFilterByDistance = async (location) => {
    try {
      // Fetch providers from backend
      const providers = await providerAPI.listProviders();

      if (providers && Array.isArray(providers)) {
        // Transform provider data and calculate distances
        const stationsWithDistance = providers.map((provider) => ({
          id: provider._id || provider.id,
          name: provider.name,
          latitude: provider.latitude || 0,
          longitude: provider.longitude || 0,
          address: provider.address || 'Address not available',
          phone: provider.phone || 'Phone not available',
          rating: provider.rating || 4.5,
          price: provider.price || 0,
          isOpen: provider.is_open !== false,
          distance: calculateDistance(
            location.latitude,
            location.longitude,
            provider.latitude || 0,
            provider.longitude || 0
          ),
        }));

        // Filter by distance and sort
        const filtered = stationsWithDistance
          .filter((station) => station.distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance);

        setNearestStations(filtered);
      } else {
        setNearestStations([]);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Gracefully handle errors - show empty state instead of crashing
      setNearestStations([]);
    }
  };

  const handleRefresh = () => {
    initializeLocation();
  };

  /**
   * Handle distance filter change
   * Updates the search radius and refetches providers with new filter
   */
  const handleDistanceChange = async (distance) => {
    setMaxDistance(distance);
    if (currentLocation) {
      // Re-fetch and filter providers with the new distance
      await fetchProvidersAndFilterByDistance(currentLocation);
    }
  };

  const handleStationSelect = (station) => {
    Alert.alert(
      station.name,
      `\nDistance: ${station.distance.toFixed(2)} km\nPrice: $${station.price}\nRating: ${station.rating}⭐\n\nWould you like directions?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Get Directions',
          onPress: () => {
            // Implement navigation/directions
            Alert.alert('Directions', `Opening directions to ${station.name}`);
          },
        },
      ]
    );
  };

  const renderStationCard = ({ item, index }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.stationCard}
      onPress={() => handleStationSelect(item)}
      activeOpacity={0.7}
    >
        <View style={styles.stationHeader}>
          <View style={styles.stationTitleContainer}>
            <Text style={styles.stationName}>{item.name}</Text>
            {item.brandColor && (
              <View
                style={[
                  styles.brandBadge,
                  { backgroundColor: item.brandColor },
                ]}
              >
                <MaterialCommunityIcons name="gas-cylinder" size={12} color="white" />
                <Text style={styles.brandBadgeText}>{item.brandName}</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, item.isOpen ? styles.open : styles.closed]}>
            <Text style={styles.statusText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>

        <View style={styles.stationInfo}>
          <Text style={styles.stationAddress}>{item.address}</Text>
          <Text style={styles.stationPhone}>{item.phone}</Text>
        </View>

        <View style={styles.stationFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{item.rating}⭐</Text>
            <Text style={styles.distance}>{item.distance.toFixed(2)} km away</Text>
          </View>
          <Text style={styles.price}>${item.price}/unit</Text>
        </View>
      </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LPG Gas Finder</Text>
        <Text style={styles.headerSubtitle}>Find nearest refill stations</Text>
      </View>

      {/* Location Status */}
      {currentLocation && (
        <View style={styles.locationStatus}>
          <Text style={styles.statusLabel}>📍 Your Location</Text>
          <Text style={styles.coordinates}>
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Distance Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Search Radius: {maxDistance} km</Text>
        <View style={styles.filterButtons}>
          {[1, 3, 5, 10].map((distance) => (
            <TouchableOpacity
              key={distance}
              style={[
                styles.filterButton,
                maxDistance === distance && styles.filterButtonActive,
              ]}
              onPress={() => handleDistanceChange(distance)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  maxDistance === distance && styles.filterButtonTextActive,
                ]}
              >
                {distance} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding nearby stations...</Text>
        </View>
      ) : nearestStations.length > 0 ? (
        <ScrollView
          style={styles.resultContainer}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          <View style={{ paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 }}>
            <Text style={styles.resultTitle}>
              {nearestStations.length} Station{nearestStations.length !== 1 ? 's' : ''} Found
            </Text>
            {nearestStations.map((station, index) =>
              renderStationCard({ item: station, index })
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.resultContainer}>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="map-search-outline"
              size={64}
              color={theme.colors.gray300}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyStateText}>No stations found within {maxDistance} km</Text>
            <Text style={styles.emptyStateSubtext}>Try increasing your search radius</Text>
          </View>
        </ScrollView>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationStatus: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  coordinates: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  resultContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  stationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  stationTitleContainer: {
    flex: 1,
  },
  stationName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: 4,
    alignSelf: 'flex-start',
  },
  brandBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginLeft: theme.spacing.md,
  },
  open: {
    backgroundColor: theme.colors.success,
  },
  closed: {
    backgroundColor: theme.colors.error,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  stationInfo: {
    marginBottom: theme.spacing.md,
  },
  stationAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  stationPhone: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  ratingContainer: {
    flex: 1,
  },
  rating: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  distance: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  price: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing['3xl'],
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  refreshButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  refreshButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
});

export default HomeScreen;
