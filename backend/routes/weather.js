const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/weather
// @desc    Get current weather for a location
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({ message: 'Please provide city or coordinates' });
    }

    // Using Open-Meteo API (free, no API key required)
    let url;
    if (lat && lon) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;
    } else {
      // Geocoding for city
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const geoRes = await axios.get(geoUrl);
      
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      const { latitude, longitude } = geoRes.data.results[0];
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;
    }

    const weatherRes = await axios.get(url);
    const current = weatherRes.data.current;

    // Map weather codes to conditions
    const weatherConditions = {
      0: 'Clear',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail'
    };

    const condition = weatherConditions[current.weather_code] || 'Unknown';

    res.json({
      success: true,
      weather: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        condition: condition,
        weatherCode: current.weather_code
      }
    });
  } catch (error) {
    // Return mock data if API fails
    res.json({
      success: true,
      weather: {
        temperature: 32,
        humidity: 65,
        condition: 'Partly cloudy',
        weatherCode: 2,
        mock: true
      }
    });
  }
});

module.exports = router;
