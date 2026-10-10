import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  Shield, 
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  User
} from 'lucide-react';
import api from '../lib/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedCoach, setAssignedCoach] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherResponse = await api.get('/weather?city=New%20York');
        setWeather(weatherResponse.data.weather);

        // Fetch assigned coach if athlete
        if (user?.role === 'ATHLETE' && user?.id) {
          const userResponse = await api.get(`/users/${user.id}`);
          setAssignedCoach(userResponse.data.user.assignedCoach);
        }
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.role]);

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
    if (!weather) return { level: 'LOW', recommendation: 'GO' };
    
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

  // ==================== ATHLETE DASHBOARD ====================
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal-900">Welcome back, {user?.name?.split(' ')[0]}</h2>
        <p className="text-charcoal-600">Here's your training overview for today</p>
      </div>

      {/* Current Risk Card */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-charcoal-900">Current Training Risk</h3>
            <p className="text-sm text-charcoal-500">Based on current environmental conditions</p>
          </div>
          <div className={`px-4 py-2 rounded-full border font-semibold text-sm ${getRiskColor(risk.level)}`}>
            {risk.level} RISK
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {weather && (
            <>
              <div className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Thermometer className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-charcoal-500">Temperature</p>
                  <p className="text-2xl font-bold text-charcoal-900">{weather.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Droplets className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-charcoal-500">Humidity</p>
                  <p className="text-2xl font-bold text-charcoal-900">{weather.humidity}%</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`p-6 rounded-lg text-white text-center ${getRecommendationColor(risk.recommendation)}`}>
          <p className="text-3xl font-bold mb-2">{risk.recommendation}</p>
          <p className="text-white/80 text-sm">
            {risk.recommendation === 'GO' && 'Conditions are suitable for normal training'}
            {risk.recommendation === 'MODIFY' && 'Training modifications recommended'}
            {risk.recommendation === 'NO-GO' && 'Training should be postponed or moved indoors'}
          </p>
        </div>
      </div>

      {/* Today's Session */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900">Today's Training Session</h3>
          <span className="text-sm text-charcoal-500">6:00 PM - 7:30 PM</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Calendar className="text-charcoal-400" size={20} />
          <div>
            <p className="font-medium text-charcoal-900">Football Training</p>
            <p className="text-sm text-charcoal-500">Outdoor Field A</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 text-charcoal-600">
            <Clock size={16} />
            <span>90 min</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-600">
            <Activity size={16} />
            <span>High Intensity</span>
          </div>
        </div>
      </div>

      {/* Assigned Coach Section - Athletes Only */}
      {user?.role === 'ATHLETE' && (
        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Your Coach</h3>
          {assignedCoach ? (
            <Link
              to={`/coach/${assignedCoach._id}/profile`}
              className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-charcoal-600 font-semibold">
                  {assignedCoach.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal-900">{assignedCoach.name}</p>
                <p className="text-sm text-charcoal-500">{assignedCoach.email}</p>
              </div>
              <ArrowRight className="text-blue-600" size={20} />
            </Link>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-600" size={20} />
                <p className="text-amber-800">No coach assigned yet</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          to="/risk-assessment"
          className="bg-white rounded-xl border border-charcoal-200 p-6 hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <Shield className="text-charcoal-600 group-hover:text-amber-500 transition-colors" size={24} />
            <ArrowRight className="text-charcoal-400 group-hover:text-amber-500 transition-colors" size={20} />
          </div>
          <h4 className="font-semibold text-charcoal-900 mb-1">Check Training Risk</h4>
          <p className="text-sm text-charcoal-500">Assess risk for your session</p>
        </Link>
        
        <Link 
          to="/symptoms"
          className="bg-white rounded-xl border border-charcoal-200 p-6 hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="text-charcoal-600 group-hover:text-amber-500 transition-colors" size={24} />
            <ArrowRight className="text-charcoal-400 group-hover:text-amber-500 transition-colors" size={20} />
          </div>
          <h4 className="font-semibold text-charcoal-900 mb-1">Report Symptoms</h4>
          <p className="text-sm text-charcoal-500">Quick symptom reporting</p>
        </Link>
      </div>

      {/* Recent Alerts */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-charcoal-900 mb-1">Heat Advisory Active</h4>
            <p className="text-sm text-charcoal-600">
              High temperatures expected today. Stay hydrated and take regular breaks during training.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
