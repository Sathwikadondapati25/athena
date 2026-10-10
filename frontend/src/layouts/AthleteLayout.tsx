import React from 'react';
import { Shield, Calendar, AlertTriangle, Thermometer, BarChart3, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const AthleteLayout: React.FC = () => {
  const athleteNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Shield },
    { path: '/dashboard/training-sessions', label: 'My Training Sessions', icon: Calendar },
    { path: '/dashboard/training-risk', label: 'Training Risk', icon: AlertTriangle },
    { path: '/dashboard/weather', label: 'Weather', icon: Thermometer },
    { path: '/dashboard/symptoms', label: 'Report Symptoms', icon: AlertTriangle },
    { path: '/dashboard/incidents', label: 'My Incidents', icon: AlertTriangle },
    { path: '/dashboard/analytics', label: 'My Analytics', icon: BarChart3 },
    { path: '/dashboard/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <DashboardLayout
      navItems={athleteNavItems}
      roleLabel="ATHLETE"
      roleBadgeColor="bg-green-100 text-green-700"
    />
  );
};

export default AthleteLayout;
