import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen bg-charcoal-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-charcoal-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">{title || 'Dashboard'}</h1>
              {subtitle && <p className="text-sm text-charcoal-500 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-charcoal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-4 border-l border-charcoal-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-charcoal-900">{getGreeting()}, {user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-charcoal-500">{user?.role}</p>
                </div>
                <div className="w-10 h-10 bg-charcoal-200 rounded-full flex items-center justify-center">
                  <span className="text-charcoal-600 font-semibold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
