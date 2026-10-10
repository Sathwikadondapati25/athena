import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';
import api from '../lib/api';

const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [athletesLoading, setAthletesLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, weatherResponse] = await Promise.all([
          api.get('/stats/coach'),
          api.get('/weather?city=New%20York')
        ]);
        setStats(statsResponse.data.stats);
        setWeather(weatherResponse.data.weather);
        setWeatherError(false);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Not authorized');
        } else {
          setError(err.response?.data?.message || 'Failed to load dashboard data');
          setWeatherError(true);
        }
      } finally {
        setLoading(false);
        setWeatherLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await api.get(`/users/coach/${user?.id}/athletes`);
        setAthletes(response.data.athletes || []);
      } catch (err: any) {
        console.error('Failed to fetch athletes:', err);
      } finally {
        setAthletesLoading(false);
      }
    };

    if (user?.id) {
      fetchAthletes();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/training-sessions');
        setSessions(response.data.sessions || []);
      } catch (err: any) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      case 'MODERATE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'VERY HIGH': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'GO': return 'bg-green-600 hover:bg-green-700';
      case 'MODIFY': return 'bg-amber-500 hover:bg-amber-600';
      case 'NO-GO': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-charcoal-600 hover:bg-charcoal-700';
    }
  };

  const calculateSimpleRisk = () => {
    if (!weather || weatherLoading) return { level: 'CALCULATING', recommendation: 'CALCULATING' };

    if (weatherError) return { level: 'UNAVAILABLE', recommendation: 'UNAVAILABLE' };

    const temp = weather.temperature;
    const humidity = weather.humidity;

    if (temp >= 38 || humidity >= 80) {
      return { level: 'HIGH', recommendation: 'MODIFY' };
    } else if (temp >= 35 || humidity >= 70) {
      return { level: 'MODERATE', recommendation: 'MODIFY' };
    }
    return { level: 'LOW', recommendation: 'GO' };
  };

  const risk = calculateSimpleRisk();

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-charcoal-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-5 h-5 bg-charcoal-200 rounded animate-pulse"></div>
        <div className="w-16 h-5 bg-charcoal-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-8 bg-charcoal-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-charcoal-200 rounded animate-pulse w-3/4"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-charcoal-900">Coach Dashboard</h2>
          <p className="text-charcoal-600">Training overview and athlete safety monitoring</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-charcoal-900">Coach Dashboard</h2>
          <p className="text-charcoal-600">Training overview and athlete safety monitoring</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal-900">Coach Dashboard</h2>
        <p className="text-charcoal-600">Training overview and athlete safety monitoring</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-charcoal-400" size={20} />
            <span className="text-xs font-medium text-charcoal-600 bg-charcoal-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.assignedAthletes || 0}</p>
          <p className="text-sm text-charcoal-500">Assigned Athletes</p>
        </div>

        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="text-charcoal-400" size={20} />
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.trainingSessions || 0}</p>
          <p className="text-sm text-charcoal-500">Training Sessions</p>
        </div>

        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="text-charcoal-400" size={20} />
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.symptomReports || 0}</p>
          <p className="text-sm text-charcoal-500">Symptom Reports</p>
        </div>

        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Shield className="text-charcoal-400" size={20} />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.level)}`}>
              {risk.level === 'CALCULATING' ? 'CALCULATING...' : risk.level}
            </span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">
            {risk.recommendation === 'CALCULATING' ? '...' : risk.recommendation}
          </p>
          <p className="text-sm text-charcoal-500">Current Risk</p>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Environmental Conditions</h3>
          {weatherLoading ? (
            <div className="text-center py-8 text-charcoal-400">Loading weather data...</div>
          ) : weatherError ? (
            <div className="text-center py-8 text-charcoal-400">Weather data unavailable</div>
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Thermometer className="text-orange-500" size={24} />
                  <span className="text-charcoal-600">Temperature</span>
                </div>
                <span className="text-2xl font-bold text-charcoal-900">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="text-blue-500" size={24} />
                  <span className="text-charcoal-600">Humidity</span>
                </div>
                <span className="text-2xl font-bold text-charcoal-900">{weather.humidity}%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="text-charcoal-500" size={24} />
                  <span className="text-charcoal-600">Conditions</span>
                </div>
                <span className="text-lg font-semibold text-charcoal-900">{weather.condition}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal-400">Weather data unavailable</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Training Decision</h3>
          <div className="space-y-4">
            {risk.level === 'CALCULATING' ? (
              <div className="p-6 rounded-lg text-center bg-charcoal-100">
                <p className="text-2xl font-bold text-charcoal-600 mb-2">Calculating...</p>
                <p className="text-sm text-charcoal-500">Please wait while we calculate the training risk</p>
              </div>
            ) : risk.level === 'UNAVAILABLE' ? (
              <div className="p-6 rounded-lg text-center bg-amber-100">
                <p className="text-2xl font-bold text-amber-700 mb-2">Risk unavailable</p>
                <p className="text-sm text-amber-600">Check conditions manually before training</p>
              </div>
            ) : (
              <>
                <div className={`p-6 rounded-lg text-center ${getRecommendationColor(risk.recommendation)}`}>
                  <p className="text-4xl font-bold text-white mb-2">{risk.recommendation}</p>
                  <p className="text-white/80 text-sm">
                    {risk.recommendation === 'GO' && 'Normal training can proceed'}
                    {risk.recommendation === 'MODIFY' && 'Modify training intensity and duration'}
                    {risk.recommendation === 'NO-GO' && 'Postpone or move training indoors'}
                  </p>
                </div>
                <div className="p-4 bg-charcoal-50 rounded-lg">
                  <p className="text-sm text-charcoal-600 mb-2">Recommended Actions:</p>
                  <ul className="space-y-1 text-sm text-charcoal-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Ensure water availability
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Plan rest breaks every 15-20 minutes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Monitor athletes for symptoms
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Athletes */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900">Assigned Athletes</h3>
          <Link to="/coach/athletes" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        {athletesLoading ? (
          <div className="text-center py-8 text-charcoal-400">Loading athletes...</div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-charcoal-300 mb-4" size={48} />
            <p className="text-charcoal-500">No athletes assigned to you yet</p>
            <p className="text-sm text-charcoal-400 mt-2">Contact an administrator to get athlete assignments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {athletes.slice(0, 5).map((athlete) => (
              <Link
                key={athlete._id}
                to={`/coach/athletes/${athlete._id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-charcoal-50 transition-colors"
              >
                <div className="w-10 h-10 bg-charcoal-200 rounded-full flex items-center justify-center">
                  <span className="text-charcoal-600 font-semibold text-sm">
                    {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">{athlete.name}</p>
                  <p className="text-sm text-charcoal-500">{athlete.email}</p>
                </div>
                <ArrowRight className="text-charcoal-400" size={16} />
              </Link>
            ))}
            {athletes.length > 5 && (
              <Link
                to="/coach/athletes"
                className="block text-center text-sm text-amber-600 hover:text-amber-700 py-2"
              >
                View all {athletes.length} athletes →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Today's Sessions */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900">Today's Training Sessions</h3>
          <Link to="/coach/training-sessions" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        {sessionsLoading ? (
          <div className="text-center py-8 text-charcoal-400">Loading training sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-charcoal-300 mb-4" size={48} />
            <p className="text-charcoal-500">No training sessions scheduled</p>
            <p className="text-sm text-charcoal-400 mt-2">Create a new training session to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session._id} className="flex items-center gap-4 p-3 rounded-lg bg-charcoal-50">
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">{session.sport}</p>
                  <p className="text-sm text-charcoal-500">
                    {new Date(session.date).toLocaleDateString()} at {session.startTime}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(session.riskLevel)}`}>
                  {session.riskLevel || 'PENDING'}
                </span>
              </div>
            ))}
            {sessions.length > 5 && (
              <Link
                to="/coach/training-sessions"
                className="block text-center text-sm text-amber-600 hover:text-amber-700 py-2"
              >
                View all {sessions.length} sessions →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-charcoal-400">
          <Clock className="mx-auto mb-2" size={32} />
          <p>Activity tracking coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
