/**
 * API Configuration
 * Backend API endpoints and helper functions
 * Integrates with Go backend server for authentication, user management, and provider data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API Base URL - Update this with your actual backend URL
// Note: Backend routes don't use /api/v1 prefix
const API_BASE_URL = 'http://localhost:8080';

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
        method: 'GET',
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
      const response = await apiClient.request('/auth/send-code', {
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
      const response = await apiClient.request('/auth/verify-phone', {
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
      const response = await apiClient.request('/user/profile', {
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
      const response = await apiClient.request('/user/profile', {
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
      const response = await apiClient.request('/user/location', {
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

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      const response = await apiClient.request('/user/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create order');
    }
  },

  /**
   * Get user orders
   */
  async getOrders() {
    try {
      const response = await apiClient.request('/user/orders', {
        method: 'GET',
      });

      return response.orders || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  },

  /**
   * Update order payment status
   */
  async updateOrderPaymentStatus(orderId, status) {
    try {
      const response = await apiClient.request(`/user/orders/${orderId}/payment-status`, {
        method: 'PUT',
        body: JSON.stringify({ payment_status: status }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update payment status');
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

  /**
   * Get provider image
   */
  async getProviderImage(providerId) {
    try {
      return `${API_BASE_URL}/providers/${providerId}/image`;
    } catch (error) {
      console.error('Error getting provider image URL:', error);
      return null;
    }
  },

  /**
   * Upload provider image (requires authentication)
   */
  async uploadImage(imageData) {
    try {
      const response = await apiClient.request('/image', {
        method: 'POST',
        body: JSON.stringify(imageData),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  /**
   * Get provider orders (for provider role)
   */
  async getOrders() {
    try {
      const response = await apiClient.request('/provider/orders', {
        method: 'GET',
      });

      return response.orders || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch provider orders');
    }
  },

  /**
   * Accept order (for provider role)
   */
  async acceptOrder(orderId) {
    try {
      const response = await apiClient.request(`/provider/orders/${orderId}/accept`, {
        method: 'PUT',
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to accept order');
    }
  },

  /**
   * Reject order (for provider role)
   */
  async rejectOrder(orderId, reason) {
    try {
      const response = await apiClient.request(`/provider/orders/${orderId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reject order');
    }
  },

  /**
   * Get single order details (for provider role)
   */
  async getOrderDetails(orderId) {
    try {
      const response = await apiClient.request(`/provider/orders/${orderId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order details');
    }
  },

  /**
   * Get provider inventory
   */
  async getInventory() {
    try {
      const response = await apiClient.request('/provider/inventory', {
        method: 'GET',
      });

      return response.inventory || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch inventory');
    }
  },

  /**
   * Add inventory item
   */
  async addInventoryItem(itemData) {
    try {
      const response = await apiClient.request('/provider/inventory', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to add inventory item');
    }
  },

  /**
   * Update inventory item
   */
  async updateInventoryItem(itemId, itemData) {
    try {
      const response = await apiClient.request(`/provider/inventory/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update inventory item');
    }
  },

  /**
   * Update inventory stock
   */
  async updateStock(itemId, quantity) {
    try {
      const response = await apiClient.request(`/provider/inventory/${itemId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update stock');
    }
  },
};

/**
 * Customer API endpoints
 */
export const customerAPI = {
  /**
   * Get best provider based on criteria
   */
  async getBestProvider(criteria) {
    try {
      const response = await apiClient.request('/customer/best', {
        method: 'POST',
        body: JSON.stringify(criteria),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to find best provider');
    }
  },
};

/**
 * Courier API endpoints
 */
export const courierAPI = {
  /**
   * Get courier orders
   */
  async getOrders() {
    try {
      const response = await apiClient.request('/courier/orders', {
        method: 'GET',
      });

      return response.orders || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch courier orders');
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.request(`/courier/orders/${orderId}/update-status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order status');
    }
  },

  /**
   * Update courier location
   */
  async updateLocation(latitude, longitude) {
    try {
      const response = await apiClient.request('/courier/location', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update courier location');
    }
  },

  /**
   * Update order location
   */
  async updateOrderLocation(orderId, latitude, longitude) {
    try {
      const response = await apiClient.request(`/courier/orders/${orderId}/location`, {
        method: 'PUT',
        body: JSON.stringify({ latitude, longitude }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order location');
    }
  },

  /**
   * Get single order details
   */
  async getOrderDetails(orderId) {
    try {
      const response = await apiClient.request(`/courier/orders/${orderId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order details');
    }
  },

  /**
   * Get user details
   */
  async getUserDetails(userId) {
    try {
      const response = await apiClient.request(`/courier/users/${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user details');
    }
  },
};

/**
 * Payment API endpoints
 */
export const paymentAPI = {
  /**
   * Initiate deposit
   */
  async initiateDeposit(amount, phoneNumber) {
    try {
      const response = await apiClient.request('/payments/deposit', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          phone_number: phoneNumber,
        }),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to initiate deposit');
    }
  },

  /**
   * Check deposit status
   */
  async checkDepositStatus(depositId) {
    try {
      const response = await apiClient.request(`/payments/status/${depositId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to check deposit status');
    }
  },
};

/**
 * Order tracking API
 */
export const orderAPI = {
  /**
   * Track order by ID
   */
  async trackOrder(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/track`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to track order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking order:', error);
      throw new Error(error.message || 'Failed to track order');
    }
  },
};

/**
 * Pricing API
 */
export const pricingAPI = {
  /**
   * Get cylinder pricing for specific provider and cylinder type
   */
  async getCylinderPrice(providerId, cylinderType) {
    try {
      const response = await fetch(`${API_BASE_URL}/cylinder-pricing/${providerId}/${cylinderType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cylinder pricing:', error);
      throw new Error(error.message || 'Failed to fetch pricing');
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
  customerAPI,
  courierAPI,
  paymentAPI,
  orderAPI,
  pricingAPI,
  calculateDistance,
  fetchNearbyStations,
};
