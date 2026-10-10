import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Search, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface Athlete {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: any;
}

const CoachAthletes: React.FC = () => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await api.get(`/users/coach/${user?.id}/athletes`);
        setAthletes(response.data.athletes || []);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Not authorized to view athletes');
        } else {
          setError(err.response?.data?.message || 'Failed to load athletes');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAthletes();
    }
  }, [user?.id]);

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      ATHLETE: 'bg-green-100 text-green-700 border-green-200',
      COACH: 'bg-blue-100 text-blue-700 border-blue-200',
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return styles[role as keyof typeof styles] || styles.ATHLETE;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal-900">My Athletes</h1>
          <p className="text-charcoal-600">View and manage your assigned athletes</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-charcoal-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-charcoal-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal-900">My Athletes</h1>
          <p className="text-charcoal-600">View and manage your assigned athletes</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Error loading athletes</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">My Athletes</h1>
          <p className="text-charcoal-600">View and manage your assigned athletes</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-charcoal-500">{athletes.length} athletes assigned</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
          <input
            type="text"
            placeholder="Search athletes by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Athletes List */}
      {filteredAthletes.length === 0 ? (
        <div className="bg-white rounded-xl border border-charcoal-200 p-12 text-center">
          <Users className="mx-auto text-charcoal-300 mb-4" size={48} />
          {searchTerm ? (
            <>
              <p className="text-charcoal-500">No athletes match your search</p>
              <p className="text-sm text-charcoal-400 mt-2">Try a different search term</p>
            </>
          ) : (
            <>
              <p className="text-charcoal-500">No athletes assigned to you yet</p>
              <p className="text-sm text-charcoal-400 mt-2">Contact an administrator to get athlete assignments</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
          <div className="divide-y divide-charcoal-200">
            {filteredAthletes.map((athlete) => (
              <Link
                key={athlete._id}
                to={`/coach/athletes/${athlete._id}`}
                className="flex items-center gap-4 p-4 hover:bg-charcoal-50 transition-colors"
              >
                <div className="w-12 h-12 bg-charcoal-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-charcoal-600 font-semibold">
                    {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-900">{athlete.name}</p>
                  <p className="text-sm text-charcoal-500 truncate">{athlete.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(athlete.role)}`}>
                    {athlete.role}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachAthletes;
