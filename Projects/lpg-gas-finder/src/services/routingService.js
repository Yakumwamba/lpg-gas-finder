/**
 * Routing Service - OpenRouteService API Integration
 * Free tier: 2000 requests/day (no API key required)
 *
 * OpenRouteService uses OpenStreetMap data for routing and directions
 * No registration required for basic usage
 *
 * Docs: https://openrouteservice.org/dev/#/api-docs
 */

const ROUTING_BASE_URL = 'https://api.openrouteservice.org/v2';

class RoutingService {
  /**
   * Get directions between two points
   * @param {Object} start - { latitude, longitude } of starting point
   * @param {Object} end - { latitude, longitude } of destination
   * @param {string} profile - 'driving-car', 'cycling-regular', 'foot-walking'
   * @returns {Promise<Object>} Route with distance, duration, and geometry
   */
  async getDirections(start, end, profile = 'driving-car') {
    try {
      // OpenRouteService expects coordinates as [longitude, latitude]
      const startCoords = [start.longitude, start.latitude];
      const endCoords = [end.longitude, end.latitude];

      const response = await fetch(
        `${ROUTING_BASE_URL}/directions/${profile}?start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`
      );

      if (!response.ok) {
        throw new Error(`Routing API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];

      return {
        distance: route.summary.distance, // in meters
        duration: route.summary.duration, // in seconds
        distanceKm: (route.summary.distance / 1000).toFixed(2),
        durationMinutes: Math.round(route.summary.duration / 60),
        geometry: route.geometry, // GeoJSON geometry for drawing on map
        wayPoints: route.way_points,
      };
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw error;
    }
  }

  /**
   * Get distance matrix between multiple points
   * @param {Array<Object>} locations - Array of {latitude, longitude} points
   * @returns {Promise<Array>} 2D array of distances in meters
   */
  async getDistanceMatrix(locations) {
    try {
      // Convert locations to ORS format [longitude, latitude]
      const coordinates = locations.map((loc) => [loc.longitude, loc.latitude]);

      const body = {
        locations: coordinates,
        metrics: ['distance', 'duration'],
      };

      const response = await fetch(`${ROUTING_BASE_URL}/matrix/driving-car`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Distance Matrix API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        distances: data.distances, // 2D array of distances in meters
        durations: data.durations, // 2D array of durations in seconds
      };
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      throw error;
    }
  }

  /**
   * Convert duration in seconds to readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted time string (e.g., "2h 30m" or "15m")
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Convert distance in meters to readable format
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance (e.g., "2.5 km" or "500 m")
   */
  formatDistance(meters) {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  /**
   * Calculate straight-line distance between two points (Haversine formula)
   * Useful as fallback when API is unavailable
   * @param {Object} point1 - { latitude, longitude }
   * @param {Object} point2 - { latitude, longitude }
   * @returns {number} Distance in kilometers
   */
  calculateStraightLineDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const dLon = this.degreesToRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.latitude)) *
        Math.cos(this.degreesToRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new RoutingService();
