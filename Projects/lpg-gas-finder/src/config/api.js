/**
 * API Configuration
 * Backend API endpoints and helper functions
 */

// Backend API Base URL - Update this with your actual backend URL
const API_BASE_URL = 'http://localhost:8080/api/v1';

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
 * Fetch nearby stations (mock implementation for fallback)
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
  providerAPI,
  calculateDistance,
  fetchNearbyStations,
};
