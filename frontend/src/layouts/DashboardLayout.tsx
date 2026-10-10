import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  navItems: Array<{
    path: string;
    label: string;
    icon: any;
  }>;
  roleLabel: string;
  roleBadgeColor: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ navItems, roleLabel, roleBadgeColor }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-charcoal-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-charcoal-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="text-charcoal-900" size={24} />
            </div>
            <span className="text-xl font-bold">ATHENA</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/coach' || item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-charcoal-900'
                    : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-charcoal-800">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-charcoal-700 rounded-full flex items-center justify-center">
              <span className="text-amber-500 font-semibold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-charcoal-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-charcoal-300 hover:bg-charcoal-800 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-charcoal-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
