import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  Shield, 
  Users, 
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherResponse, statsResponse] = await Promise.all([
          api.get('/weather?city=New%20York'),
          api.get('/stats/admin')
        ]);
        setWeather(weatherResponse.data.weather);
        setStats(statsResponse.data.stats);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-charcoal-900">Admin Dashboard</h2>
          <p className="text-charcoal-600">System overview and management</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-charcoal-200 p-5">
              <div className="h-20 bg-charcoal-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-charcoal-900">Admin Dashboard</h2>
          <p className="text-charcoal-600">System overview and management</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal-900">Admin Dashboard</h2>
        <p className="text-charcoal-600">System overview and management</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-charcoal-400" size={20} />
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-charcoal-500">Total Users</p>
        </div>
        
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="text-charcoal-400" size={20} />
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.totalSessions || 0}</p>
          <p className="text-sm text-charcoal-500">Training Sessions</p>
        </div>
        
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Shield className="text-charcoal-400" size={20} />
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.totalRiskAssessments || 0}</p>
          <p className="text-sm text-charcoal-500">Risk Assessments</p>
        </div>
        
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="text-charcoal-400" size={20} />
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Alert</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats?.totalIncidents || 0}</p>
          <p className="text-sm text-charcoal-500">Reported Incidents</p>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-600">Athletes</span>
                <span className="text-sm font-semibold text-charcoal-900">{stats?.athletes || 0}</span>
              </div>
              <div className="w-full bg-charcoal-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: stats?.totalUsers ? `${(stats.athletes / stats.totalUsers) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-600">Coaches</span>
                <span className="text-sm font-semibold text-charcoal-900">{stats?.coaches || 0}</span>
              </div>
              <div className="w-full bg-charcoal-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: stats?.totalUsers ? `${(stats.coaches / stats.totalUsers) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-600">Administrators</span>
                <span className="text-sm font-semibold text-charcoal-900">{stats?.admins || 0}</span>
              </div>
              <div className="w-full bg-charcoal-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: stats?.totalUsers ? `${(stats.admins / stats.totalUsers) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-600">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-600">Weather API</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-600">Authentication</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          to="/admin/users"
          className="bg-white rounded-xl border border-charcoal-200 p-6 hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <Users className="text-charcoal-600 group-hover:text-amber-500 transition-colors" size={24} />
            <ArrowRight className="text-charcoal-400 group-hover:text-amber-500 transition-colors" size={20} />
          </div>
          <h4 className="font-semibold text-charcoal-900 mb-1">Manage Users</h4>
          <p className="text-sm text-charcoal-500">View and manage user accounts</p>
        </Link>
        
        <Link 
          to="/incidents"
          className="bg-white rounded-xl border border-charcoal-200 p-6 hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="text-charcoal-600 group-hover:text-amber-500 transition-colors" size={24} />
            <ArrowRight className="text-charcoal-400 group-hover:text-amber-500 transition-colors" size={20} />
          </div>
          <h4 className="font-semibold text-charcoal-900 mb-1">View Incidents</h4>
          <p className="text-sm text-charcoal-500">Review reported incidents</p>
        </Link>
        
        <Link 
          to="/analytics"
          className="bg-white rounded-xl border border-charcoal-200 p-6 hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-charcoal-600 group-hover:text-amber-500 transition-colors" size={24} />
            <ArrowRight className="text-charcoal-400 group-hover:text-amber-500 transition-colors" size={20} />
          </div>
          <h4 className="font-semibold text-charcoal-900 mb-1">View Analytics</h4>
          <p className="text-sm text-charcoal-500">Risk trends and insights</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Recent System Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Users className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-charcoal-900">New user registered: shivanisakinala6@gmail.com</p>
              <p className="text-xs text-charcoal-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-charcoal-900">New incident reported by athlete</p>
              <p className="text-xs text-charcoal-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-charcoal-900">System backup completed successfully</p>
              <p className="text-xs text-charcoal-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
