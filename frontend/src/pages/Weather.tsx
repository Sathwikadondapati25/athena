import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thermometer, Droplets, Cloud, Search, MapPin } from 'lucide-react';
import api from '../lib/api';

const Weather: React.FC = () => {
  const { user } = useAuth();
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (searchCity?: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/weather?city=${encodeURIComponent(searchCity || city)}`);
      setWeather(response.data.weather);
    } catch (error: any) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  const getRiskColor = (temp: number, humidity: number) => {
    if (temp >= 38 || humidity >= 80) return 'text-red-600 bg-red-50';
    if (temp >= 35 || humidity >= 70) return 'text-orange-600 bg-orange-50';
    if (temp >= 30 || humidity >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLevel = (temp: number, humidity: number) => {
    if (temp >= 38 || humidity >= 80) return 'HIGH';
    if (temp >= 35 || humidity >= 70) return 'MODERATE';
    if (temp >= 30 || humidity >= 60) return 'MODERATE';
    return 'LOW';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Weather Information</h1>
      <p className="text-charcoal-600 mb-8">Check current weather conditions for your location</p>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border border-charcoal-200 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full pl-10 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 disabled:bg-charcoal-400 transition-colors flex items-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {weather && (
          <div className="bg-white p-8 rounded-xl border border-charcoal-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-2">{city}</h2>
              <p className="text-charcoal-500">Current Weather</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-charcoal-50 rounded-lg">
                <Thermometer className="mx-auto text-orange-500 mb-3" size={48} />
                <p className="text-charcoal-500 text-sm mb-1">Temperature</p>
                <p className="text-4xl font-bold text-charcoal-900">{weather.temperature}°C</p>
              </div>

              <div className="text-center p-6 bg-charcoal-50 rounded-lg">
                <Droplets className="mx-auto text-green-500 mb-3" size={48} />
                <p className="text-charcoal-500 text-sm mb-1">Humidity</p>
                <p className="text-4xl font-bold text-charcoal-900">{weather.humidity}%</p>
              </div>

              <div className="text-center p-6 bg-charcoal-50 rounded-lg">
                <Cloud className="mx-auto text-charcoal-500 mb-3" size={48} />
                <p className="text-charcoal-500 text-sm mb-1">Condition</p>
                <p className="text-2xl font-bold text-charcoal-900">{weather.condition}</p>
              </div>
            </div>

            <div className={`p-6 rounded-lg text-center ${getRiskColor(weather.temperature, weather.humidity)}`}>
              <p className="text-sm font-medium mb-2">Current Risk Level</p>
              <p className="text-3xl font-bold">{getRiskLevel(weather.temperature, weather.humidity)}</p>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Use this weather information along with training details to assess risk using the Training Risk Assessment page.
              </p>
            </div>

            {weather.mock && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Weather data is currently in demo mode. In production, this would show real-time weather data from a weather API.
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default Weather;
