/**
 * API Configuration
 * Backend API endpoints and helper functions
 * Integrates with Go backend server for authentication, user management, and provider data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API Base URL - Update this with your actual backend URL
const API_BASE_URL = 'http://localhost:8080/api/v1';

const TOKEN_KEY = '@lpg_gas_finder_token';

/**
 * API Client - Handles HTTP requests with authentication
 */
export const apiClient = {
  token: null,

  /**
   * Initialize token from storage
   */
  async init() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      this.token = token;
      return token;
    } catch (error) {
      console.error('Error loading token:', error);
      return null;
    }
  },

  /**
   * Set authentication token
   */
  async setToken(token) {
    try {
      this.token = token;
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  /**
   * Clear authentication token
   */
  async clearToken() {
    try {
      this.token = null;
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  },

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  },
};

// Initialize token on module load
apiClient.init();

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Sign up new user
   */
  async signup(email, password, name, userType = 'customer') {
    try {
      const response = await apiClient.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          name,
          user_type: userType,
        }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Sign up failed');
    }
  },

  /**
   * Sign in existing user
   */
  async signin(email, password) {
    try {
      const response = await apiClient.request('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Sign in failed');
    }
  },

  /**
   * Sign out current user
   */
  async signout() {
    try {
      await apiClient.request('/auth/signout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw error, as we'll clear token locally anyway
    }
  },

  /**
   * Send phone verification code
   */
  async sendPhoneCode(phoneNumber) {
    try {
      const response = await apiClient.request('/auth/phone/send', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to send verification code');
    }
  },

  /**
   * Verify phone number with code
   */
  async verifyPhone(phoneNumber, code) {
    try {
      const response = await apiClient.request('/auth/phone/verify', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
          code,
        }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Phone verification failed');
    }
  },
};

/**
 * User API endpoints
 */
export const userAPI = {
  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await apiClient.request('/users/profile', {
        method: 'GET',
      });

      return response.user || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      return response.user || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * Update user location
   */
  async updateLocation(latitude, longitude) {
    try {
      const response = await apiClient.request('/users/location', {
        method: 'PUT',
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update location');
    }
  },
};

/**
 * Provider API endpoints
 */
export const providerAPI = {
  /**
   * List all providers
   */
  async listProviders() {
    try {
      const response = await fetch(`${API_BASE_URL}/providers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  },

  /**
   * Get a specific provider by ID
   */
  async getProvider(providerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch provider');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching provider:', error);
      return null;
    }
  },
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Fetch nearby stations (helper function)
 * This can be replaced with actual backend call if needed
 */
export async function fetchNearbyStations(latitude, longitude, maxDistance) {
  // Try to fetch from backend first
  try {
    const providers = await providerAPI.listProviders();

    if (providers && providers.length > 0) {
      // Calculate distances and filter
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
        hours: provider.hours || { open: '08:00', close: '18:00' },
        distance: calculateDistance(
          latitude,
          longitude,
          provider.latitude || 0,
          provider.longitude || 0
        ),
      }));

      // Filter by distance and sort
      return stationsWithDistance
        .filter((station) => station.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);
    }
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
  }

  // Return empty array if no data available
  return [];
}

export default {
  API_BASE_URL,
  apiClient,
  authAPI,
  userAPI,
  providerAPI,
  calculateDistance,
  fetchNearbyStations,
};
