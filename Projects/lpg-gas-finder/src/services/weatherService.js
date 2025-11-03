/**
 * Weather Service - OpenWeatherMap API Integration
 * Free tier: 1000 calls/day
 *
 * To use: Get free API key from https://openweathermap.org/api
 * Sign up at: https://home.openweathermap.org/users/sign_up
 */

// Replace with your free API key from OpenWeatherMap
const WEATHER_API_KEY = 'c84c2be1f11660d7a093df1996ad81ba'; // Use 'demo' for testing, replace with real key
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  /**
   * Get current weather for a location
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} Weather data including temp, condition, humidity
   */
  async getCurrentWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        cloudiness: data.clouds.all,
        timestamp: new Date(data.dt * 1000),
        icon: data.weather[0].icon, // Icon code for displaying weather icons
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  /**
   * Get 5-day weather forecast
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Array>} Array of forecast data for next 5 days
   */
  async getForecast(latitude, longitude) {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.list.map((forecast) => ({
        temperature: forecast.main.temp,
        condition: forecast.weather[0].main,
        description: forecast.weather[0].description,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        timestamp: new Date(forecast.dt * 1000),
        icon: forecast.weather[0].icon,
      }));
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  /**
   * Get weather icon URL for displaying weather conditions
   * @param {string} iconCode - Icon code from OpenWeatherMap
   * @returns {string} URL to weather icon image
   */
  getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Check if weather is suitable for travel/refilling
   * Returns warnings for extreme conditions
   * @param {Object} weather - Weather object from getCurrentWeather
   * @returns {Object} Contains isGood (boolean) and warning (string if not good)
   */
  getWeatherSuitability(weather) {
    const warnings = [];

    if (weather.temperature < -10) {
      warnings.push('⚠️ Extremely cold - LPG may not flow properly');
    } else if (weather.temperature < 0) {
      warnings.push('🥶 Very cold - LPG flow may be slow');
    }

    if (weather.temperature > 50) {
      warnings.push('⚠️ Extremely hot - Pressure may be high');
    } else if (weather.temperature > 35) {
      warnings.push('🔥 Very hot - Be careful with pressure');
    }

    if (weather.windSpeed > 40) {
      warnings.push('⚠️ Strong winds - Safety risk');
    }

    if (weather.humidity > 95) {
      warnings.push('💧 Very high humidity');
    }

    return {
      isGood: warnings.length === 0,
      warnings: warnings,
      temperature: weather.temperature,
      condition: weather.condition,
    };
  }
}

export default new WeatherService();
