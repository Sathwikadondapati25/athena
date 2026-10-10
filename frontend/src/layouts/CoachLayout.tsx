import React from 'react';
import { Shield, Users, Calendar, AlertTriangle, Thermometer, BarChart3, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const CoachLayout: React.FC = () => {
  const coachNavItems = [
    { path: '/coach', label: 'Coach Dashboard', icon: Shield },
    { path: '/coach/athletes', label: 'My Athletes', icon: Users },
    { path: '/coach/training-sessions', label: 'Training Sessions', icon: Calendar },
    { path: '/coach/training-risk', label: 'Training Risk', icon: AlertTriangle },
    { path: '/coach/weather', label: 'Weather', icon: Thermometer },
    { path: '/coach/symptoms', label: 'Symptoms', icon: AlertTriangle },
    { path: '/coach/incidents', label: 'Incidents', icon: AlertTriangle },
    { path: '/coach/team-analytics', label: 'Team Analytics', icon: BarChart3 },
    { path: '/coach/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <DashboardLayout
      navItems={coachNavItems}
      roleLabel="COACH"
      roleBadgeColor="bg-blue-100 text-blue-700"
    />
  );
};

export default CoachLayout;
