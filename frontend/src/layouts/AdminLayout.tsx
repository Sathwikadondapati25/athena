import React from 'react';
import { Shield, Users, Calendar, AlertTriangle, Activity, BarChart3, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const AdminLayout: React.FC = () => {
  const adminNavItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: Shield },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/assignments', label: 'Assignments', icon: Users },
    { path: '/admin/training-sessions', label: 'Training Sessions', icon: Calendar },
    { path: '/admin/risk-assessments', label: 'Risk Assessments', icon: AlertTriangle },
    { path: '/admin/risk-rules', label: 'Risk Rules', icon: AlertTriangle },
    { path: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
    { path: '/admin/reports', label: 'Reports', icon: Activity },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <DashboardLayout
      navItems={adminNavItems}
      roleLabel="ADMIN"
      roleBadgeColor="bg-purple-100 text-purple-700"
    />
  );
};

export default AdminLayout;
