import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import locationService from '../services/locationService';
import { fetchNearbyStations } from '../config/api';
import weatherService from '../services/weatherService';
import routingService from '../services/routingService';
import theme from '../config/theme';

/**
 * Map Screen - Shows nearby stations with location details
 * Note: For full map support, install react-native-maps:
 * npm install react-native-maps && expo install react-native-maps
 */
const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [routeData, setRouteData] = useState({});
  const [loadingRoute, setLoadingRoute] = useState(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);

        // Fetch nearby stations
        const nearbyStations = await fetchNearbyStations(
          location.latitude,
          location.longitude,
          5
        );
        setStations(nearbyStations);

        // Fetch current weather
        try {
          const currentWeather = await weatherService.getCurrentWeather(
            location.latitude,
            location.longitude
          );
          setWeather(currentWeather);
        } catch (weatherError) {
          console.warn('Weather fetch error:', weatherError);
          // Continue without weather - it's not critical
        }
      }
    } catch (error) {
      console.error('Location initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStationPress = async (station) => {
    const isSelected = selectedStation?.id === station.id;
    if (isSelected) {
      setSelectedStation(null);
      setRouteData({});
    } else {
      setSelectedStation(station);
      // Fetch route data for this station
      await fetchRouteData(station);
    }
  };

  const fetchRouteData = async (station) => {
    if (!currentLocation) return;

    setLoadingRoute(station.id);
    try {
      const route = await routingService.getDirections(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: station.latitude, longitude: station.longitude }
      );
      setRouteData((prev) => ({
        ...prev,
        [station.id]: route,
      }));
    } catch (error) {
      console.warn('Route fetch error:', error);
      // Fallback: use straight-line distance
      const straightDist = routingService.calculateStraightLineDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: station.latitude, longitude: station.longitude }
      );
      setRouteData((prev) => ({
        ...prev,
        [station.id]: { distanceKm: straightDist.toFixed(2), durationMinutes: 'N/A' },
      }));
    } finally {
      setLoadingRoute(null);
    }
  };

  const renderStationCard = ({ item: station }) => {
    const route = routeData[station.id];
    const isLoading = loadingRoute === station.id;

    return (
      <TouchableOpacity
        style={[
          styles.stationCard,
          selectedStation?.id === station.id && styles.stationCardActive,
        ]}
        onPress={() => handleStationPress(station)}
        activeOpacity={0.7}
      >
        <View style={styles.stationHeader}>
          <View style={styles.stationTitleContainer}>
            <MaterialCommunityIcons name="gas-cylinder" size={24} color={theme.colors.secondary} />
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{station.name}</Text>
              <Text style={styles.stationAddress}>{station.address}</Text>
            </View>
          </View>
          <View style={styles.stationDistance}>
            <Text style={styles.distanceText}>{station.distance.toFixed(1)}</Text>
            <Text style={styles.distanceUnit}>km</Text>
          </View>
        </View>

        {/* Route Info */}
        {route && (
          <View style={styles.routeInfo}>
            <View style={styles.routeMetric}>
              <MaterialCommunityIcons name="routes" size={16} color={theme.colors.secondary} />
              <Text style={styles.routeMetricText}>{route.distanceKm} km</Text>
            </View>
            <View style={styles.routeMetric}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.secondary} />
              <Text style={styles.routeMetricText}>
                {typeof route.durationMinutes === 'number' ? `${route.durationMinutes} min` : route.durationMinutes}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.stationDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{station.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rating:</Text>
            <Text style={styles.detailValue}>
              ⭐ {station.rating}/5
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.priceValue}>ZMW {station.price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View
              style={[
                styles.statusBadge,
                station.isOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            >
              <Text style={styles.statusText}>
                {station.isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hours:</Text>
            <Text style={styles.detailValue}>
              {station.hours.open} - {station.hours.close}
            </Text>
          </View>
        </View>

        {selectedStation?.id === station.id && (
          <View>
            {isLoading && (
              <View style={styles.loadingRoute}>
                <ActivityIndicator size="small" color={theme.colors.secondary} />
                <Text style={styles.loadingRouteText}>Calculating route...</Text>
              </View>
            )}
            {!isLoading && (
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => Alert.alert('Navigate', `Directions to ${station.name}`, [
                  { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                  { text: 'OK', onPress: () => {} }
                ])}
              >
                <MaterialCommunityIcons name="directions" size={18} color="white" />
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="map-alert" size={64} color={theme.colors.secondary} />
          <Text style={styles.errorText}>Unable to get your location</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={initializeLocation}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Location Header */}
      <View style={styles.locationHeader}>
        <View style={styles.headerContent}>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.secondary} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Your Location</Text>
              <Text style={styles.locationCoords}>
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
              <Text style={styles.accuracyText}>
                Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
              </Text>
            </View>
          </View>

          {/* Weather Widget */}
          {weather && (
            <View style={styles.weatherWidget}>
              <View style={styles.weatherContent}>
                <View>
                  <Text style={styles.weatherTemp}>{Math.round(weather.temperature)}°C</Text>
                  <Text style={styles.weatherCondition}>{weather.condition}</Text>
                </View>
                <MaterialCommunityIcons
                  name={weather.condition === 'Clouds' ? 'cloud' : 'sun'}
                  size={32}
                  color={theme.colors.secondary}
                  style={styles.weatherIcon}
                />
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetail}>
                  <MaterialCommunityIcons name="water-percent" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <MaterialCommunityIcons name="wind" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.weatherDetailText}>{Math.round(weather.windSpeed)} m/s</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={initializeLocation}>
          <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Stations List */}
      <Text style={styles.stationsTitle}>
        {stations.length} Station{stations.length !== 1 ? 's' : ''} Nearby
      </Text>

      {stations.length > 0 ? (
        <FlatList
          data={stations}
          renderItem={renderStationCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={true}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="map-search" size={48} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>No stations found nearby</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  locationHeader: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  locationCoords: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  weatherWidget: {
    backgroundColor: `${theme.colors.secondary}0F`,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherTemp: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  weatherCondition: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  weatherIcon: {
    marginRight: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  refreshButton: {
    padding: 8,
  },
  stationsTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  stationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stationCardActive: {
    borderColor: theme.colors.secondary,
    borderWidth: 2,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.primary}0A`,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    gap: 12,
  },
  routeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetricText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary,
  },
  stationTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  stationName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  stationAddress: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  stationDistance: {
    alignItems: 'center',
  },
  distanceText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary,
  },
  distanceUnit: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  stationDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: `${theme.colors.success}1A`,
  },
  statusClosed: {
    backgroundColor: `${theme.colors.secondary}1A`,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  loadingRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    gap: 8,
  },
  loadingRouteText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  directionsButton: {
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  directionsText: {
    color: 'white',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  retryButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textTertiary,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default MapScreen;
