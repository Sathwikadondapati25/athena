import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

const RiskAssessment: React.FC = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    sport: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: 60,
    intensity: 'Medium',
    numberOfAthletes: 10,
    hydrationAvailable: true,
    shadeAvailable: true,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await api.get('/weather?city=New%20York');
        setWeather(response.data.weather);
      } catch (error) {
        console.error('Failed to fetch weather');
      }
    };

    fetchWeather();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assessmentData = {
        ...formData,
        temperature: weather?.temperature || 30,
        humidity: weather?.humidity || 60,
        weatherCondition: weather?.condition || 'Partly cloudy',
        weatherWarning: weather?.weatherCode >= 95 ? 'Heat warning' : '',
      };

      const response = await api.post('/risk-assessments', assessmentData);
      setResult(response.data.assessment);
    } catch (error: any) {
      console.error('Assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'VERY HIGH': return 'bg-red-900 text-white border-red-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'GO': return 'bg-green-600';
      case 'MODIFY': return 'bg-yellow-600';
      case 'NO-GO': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Training Risk Assessment</h1>
      <p className="text-charcoal-600 mb-8">Assess heat risk for your training session</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-charcoal-200">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-6">Training Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Sport</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select sport</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Soccer">Soccer</option>
                <option value="Track and Field">Track and Field</option>
                <option value="Tennis">Tennis</option>
                <option value="Cross Country">Cross Country</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                  min="15"
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Intensity</label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {user?.role !== 'ATHLETE' && (
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Number of Athletes</label>
                <input
                  type="number"
                  value={formData.numberOfAthletes}
                  onChange={(e) => setFormData({ ...formData, numberOfAthletes: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            )}
            {user?.role === 'ATHLETE' && (
              <input type="hidden" value={1} />
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.hydrationAvailable}
                  onChange={(e) => setFormData({ ...formData, hydrationAvailable: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded"
                />
                <span className="text-charcoal-700">Hydration available</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.shadeAvailable}
                  onChange={(e) => setFormData({ ...formData, shadeAvailable: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded"
                />
                <span className="text-charcoal-700">Shade/rest available</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 disabled:bg-charcoal-400 transition-colors"
          >
            {loading ? 'Assessing...' : 'Assess Risk'}
          </button>
        </form>

        <div className="space-y-6">
          {weather && (
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Current Weather</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="text-orange-500" size={20} />
                  <span className="text-charcoal-600">Temperature: {weather.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="text-green-500" size={20} />
                  <span className="text-charcoal-600">Humidity: {weather.humidity}%</span>
                </div>
                <div className="col-span-2 text-charcoal-600">
                  Condition: {weather.condition}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white p-6 rounded-xl border border-charcoal-200 border-2">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Risk Assessment Result</h2>

              <div className="mb-4">
                <span className={`px-4 py-2 rounded-full font-semibold text-lg ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLevel} RISK
                </span>
              </div>

              <div className={`p-4 rounded-lg text-white text-center mb-4 ${getRecommendationColor(result.recommendation)}`}>
                <p className="text-2xl font-bold">{result.recommendation}</p>
              </div>

              {result.factors && result.factors.length > 0 && (
                <div>
                  <h3 className="font-medium text-charcoal-900 mb-2">Risk Factors:</h3>
                  <ul className="list-disc list-inside text-charcoal-600 space-y-1">
                    {result.factors.map((factor: string, index: number) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-amber-800">
                    This assessment is for decision support only. Always consider individual athlete conditions and follow your institution's safety protocols.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
