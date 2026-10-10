import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Thermometer,
  Calendar,
  Cloud,
  HeartPulse,
  AlertTriangle,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Shield,
  User,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const isOnAdminRoute = location.pathname.startsWith('/admin');

  const isActive = (path: string) => location.pathname === path;

  const overviewItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const coachOverviewItems = [
    { path: '/coach', icon: LayoutDashboard, label: 'Coach Dashboard' },
  ];

  const adminOverviewItems = [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
  ];

  const trainingItems = [
    { path: '/risk-assessment', icon: Thermometer, label: 'Training Risk' },
    { path: '/training', icon: Calendar, label: 'Training Sessions' },
    { path: '/weather', icon: Cloud, label: 'Weather' },
  ];

  const athleteTrainingItems = [
    { path: '/risk-assessment', icon: Thermometer, label: 'Training Risk' },
    { path: '/training', icon: Calendar, label: 'My Training Sessions' },
    { path: '/weather', icon: Cloud, label: 'Weather' },
  ];

  const coachTrainingItems = [
    { path: '/risk-assessment', icon: Thermometer, label: 'Training Risk' },
    { path: '/training', icon: Calendar, label: 'Training Sessions' },
    { path: '/weather', icon: Cloud, label: 'Weather' },
  ];

  const safetyItems = [
    { path: '/symptoms', icon: HeartPulse, label: 'Symptoms' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  ];

  const athleteSafetyItems = [
    { path: '/symptoms', icon: HeartPulse, label: 'Report Symptoms' },
    { path: '/incidents', icon: AlertTriangle, label: 'My Incidents' },
  ];

  const coachSafetyItems = [
    { path: '/symptoms', icon: HeartPulse, label: 'Symptoms' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  ];

  const insightsItems = [
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const athleteInsightsItems = [
    { path: '/analytics', icon: BarChart3, label: 'My Analytics' },
  ];

  const coachInsightsItems = [
    { path: '/analytics', icon: BarChart3, label: 'Team Analytics' },
  ];

  const accountItems = [
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const adminItems = [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/rules', icon: Settings, label: 'Risk Rules' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  const adminManagementItems = [
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/assignments', icon: UserPlus, label: 'Assignments' },
    { path: '/training', icon: Calendar, label: 'Training Sessions' },
    { path: '/risk-assessment', icon: Shield, label: 'Risk Assessments' },
    { path: '/admin/rules', icon: Settings, label: 'Risk Rules' },
  ];

  const adminSafetyItems = [
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  const renderMenuSection = (title: string, items: any[]) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider px-4 mb-2">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-amber-500/10 text-amber-600 font-medium'
                  : 'text-charcoal-600 hover:bg-charcoal-100'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-charcoal-200 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-charcoal-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-charcoal-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="text-amber-500" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal-900">ATHENA</h1>
            <p className="text-xs text-charcoal-500">Heat-Risk Awareness</p>
          </div>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="px-6 py-3 bg-charcoal-50 border-b border-charcoal-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            user?.role === 'ADMIN' ? 'bg-amber-500' :
            user?.role === 'COACH' ? 'bg-green-500' :
            'bg-blue-500'
          }`} />
          <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {isAdmin ? (
          <>
            {renderMenuSection('Overview', adminOverviewItems)}
            <div className="my-4 border-t border-charcoal-200" />
            {renderMenuSection('Management', adminManagementItems)}
            {renderMenuSection('Safety', adminSafetyItems)}
            {renderMenuSection('Insights', insightsItems)}
          </>
        ) : user?.role === 'COACH' ? (
          <>
            {renderMenuSection('Overview', coachOverviewItems)}
            <div className="my-4 border-t border-charcoal-200" />
            {renderMenuSection('Training', coachTrainingItems)}
            {renderMenuSection('Athlete Safety', coachSafetyItems)}
            {renderMenuSection('Insights', coachInsightsItems)}
          </>
        ) : (
          <>
            {renderMenuSection('Overview', overviewItems)}
            <div className="my-4 border-t border-charcoal-200" />
            {renderMenuSection('Training', athleteTrainingItems)}
            {renderMenuSection('Safety', athleteSafetyItems)}
            {renderMenuSection('Insights', athleteInsightsItems)}
          </>
        )}
        {renderMenuSection('Account', accountItems)}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-charcoal-200 bg-charcoal-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-charcoal-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="text-charcoal-600" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-charcoal-500 truncate">{user?.email}</p>
          </div>
          <ChevronDown className="text-charcoal-400" size={16} />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-charcoal-600 hover:bg-charcoal-200 rounded-lg w-full transition-all text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
