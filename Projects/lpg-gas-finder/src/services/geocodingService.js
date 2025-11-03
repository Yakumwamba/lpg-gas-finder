/**
 * Geocoding Service - Nominatim (OpenStreetMap) API Integration
 * Free tier: Unlimited (1 request/second limit)
 *
 * Nominatim is a free geocoding service powered by OpenStreetMap
 * No API key required, but please follow usage policies
 *
 * Docs: https://nominatim.org/release-docs/latest/api/Overview/
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const APP_NAME = 'LPGGasFinder'; // Required by Nominatim usage policy

class GeocodingService {
  /**
   * Convert address to coordinates (forward geocoding)
   * @param {string} address - Full address or place name
   * @param {Object} options - { countryCode, limit }
   * @returns {Promise<Array>} Array of matching locations with coordinates
   */
  async geocodeAddress(address, options = {}) {
    try {
      const { countryCode = 'ZM', limit = 5 } = options;

      const params = new URLSearchParams({
        q: address,
        format: 'json',
        limit: limit,
        countrycodes: countryCode,
        'accept-language': 'en',
        user_agent: APP_NAME,
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map((result) => ({
        displayName: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        boundingBox: result.boundingbox,
        placeType: result.type,
        osmId: result.osm_id,
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {number} zoomLevel - Detail level (10-18, higher = more detail)
   * @returns {Promise<Object>} Address information
   */
  async reverseGeocode(latitude, longitude, zoomLevel = 15) {
    try {
      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: zoomLevel,
        'accept-language': 'en',
        user_agent: APP_NAME,
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`);

      if (!response.ok) {
        throw new Error(`Reverse Geocoding API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        displayName: data.display_name,
        address: data.address || {},
        placeType: data.type,
        osmId: data.osm_id,
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Get detailed address components
   * Parses the address object to extract street, city, country, etc.
   * @param {Object} addressObj - Address object from reverseGeocode
   * @returns {Object} Structured address components
   */
  parseAddress(addressObj) {
    return {
      street: addressObj.road || addressObj.house_number || '',
      area: addressObj.suburb || addressObj.neighbourhood || '',
      city: addressObj.city || addressObj.town || addressObj.village || '',
      region: addressObj.state || addressObj.province || '',
      country: addressObj.country || '',
      postalCode: addressObj.postcode || '',
      countryCode: addressObj.country_code || '',
    };
  }

  /**
   * Search for places by name with location bias
   * @param {string} query - Search query (e.g., "LPG station", "gas cylinder")
   * @param {Object} nearPoint - { latitude, longitude } to bias search
   * @returns {Promise<Array>} Array of matching places
   */
  async searchPlaces(query, nearPoint = null) {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: 10,
        'accept-language': 'en',
        user_agent: APP_NAME,
      });

      // Bias results to area around user location if provided
      if (nearPoint) {
        params.append(
          'viewbox',
          `${nearPoint.longitude - 0.05},${nearPoint.latitude + 0.05},${nearPoint.longitude + 0.05},${nearPoint.latitude - 0.05}`
        );
        params.append('bounded', '1');
      }

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`);

      if (!response.ok) {
        throw new Error(`Place search API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map((result) => ({
        displayName: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        placeType: result.type,
        osmId: result.osm_id,
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Format address for display
   * @param {Object} location - Location object with address info
   * @returns {string} Formatted address string
   */
  formatAddress(location) {
    if (location.displayName) {
      return location.displayName;
    }

    const parts = [];
    if (location.street) parts.push(location.street);
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);

    return parts.join(', ') || 'Unknown location';
  }

  /**
   * Get nearby features by type
   * Searches for specific amenities/features near a location
   * @param {string} featureType - Type like "fuel", "restaurant", "hospital"
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<Array>} Nearby features
   */
  async getNearbyFeatures(featureType, latitude, longitude, radiusKm = 5) {
    try {
      // This uses Nominatim's search with geographic bias
      const query = `${featureType}`;

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: 20,
        'accept-language': 'en',
        user_agent: APP_NAME,
        // Add bounding box based on radius
        viewbox: `${longitude - (radiusKm / 111)},${latitude + (radiusKm / 111)},${longitude + (radiusKm / 111)},${latitude - (radiusKm / 111)}`,
        bounded: '1',
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`);

      if (!response.ok) {
        throw new Error(`Nearby features API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map((result) => ({
        displayName: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        placeType: result.type,
      }));
    } catch (error) {
      console.error('Error searching nearby features:', error);
      throw error;
    }
  }
}

export default new GeocodingService();
