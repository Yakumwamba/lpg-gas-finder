/**
 * Location Service
 * Handles device location retrieval using Expo Location
 */

import * as Location from 'expo-location';

const locationService = {
  /**
   * Request location permissions from the user
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  },

  /**
   * Get the user's current location
   * @returns {Promise<Object|null>} Location object with latitude, longitude, and accuracy
   */
  async getCurrentLocation() {
    try {
      // Check if permissions are granted
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          console.warn('Location permission not granted');
          return null;
        }
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 1000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },

  /**
   * Watch the user's location for continuous updates
   * @param {Function} callback - Callback function to receive location updates
   * @returns {Promise<Object>} Subscription object to stop watching
   */
  async watchLocation(callback) {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          console.warn('Location permission not granted');
          return null;
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when user moves 10 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          });
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  },

  /**
   * Get address from coordinates (reverse geocoding)
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object|null>} Address information
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        return addresses[0];
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },

  /**
   * Get coordinates from address (forward geocoding)
   * @param {string} address
   * @returns {Promise<Object|null>} Location coordinates
   */
  async geocode(address) {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations && locations.length > 0) {
        return {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },
};

export default locationService;
