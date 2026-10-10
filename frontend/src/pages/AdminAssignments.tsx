import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, Search, Shield, RefreshCw, UserCheck, UserX } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ATHLETE' | 'COACH' | 'ADMIN';
  assignedCoach?: any;
  assignedAthletes?: any[];
  createdAt: string;
}

const AdminAssignments: React.FC = () => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNASSIGNED' | 'ASSIGNED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/assignments');
        setCoaches(response.data.coaches);
        setAthletes(response.data.athletes);
      } catch (error: any) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load assignments' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COACH': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ATHLETE': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    }
  };

  const getAssignmentBadge = (user: User) => {
    if (user.role === 'COACH') {
      const count = user.assignedAthletes?.length || 0;
      return `${count} athlete${count !== 1 ? 's' : ''}`;
    }
    if (user.role === 'ATHLETE') {
      return user.assignedCoach ? `${user.assignedCoach.name}` : 'Unassigned';
    }
    return '';
  };

  const getAssignmentBadgeColor = (user: User) => {
    if (user.role === 'COACH') return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    if (user.role === 'ATHLETE') {
      return user.assignedCoach ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200';
    }
    return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
  };

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        athlete.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'UNASSIGNED') return !athlete.assignedCoach && matchesSearch;
    if (filter === 'ASSIGNED') return athlete.assignedCoach && matchesSearch;
    return matchesSearch;
  });

  const handleAssign = async () => {
    if (!selectedCoachId || selectedAthleteIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select a coach and at least one athlete' });
      return;
    }

    setAssigning(true);
    try {
      await api.post('/assignments/assign', {
        coachId: selectedCoachId,
        athleteIds: selectedAthleteIds
      });

      setMessage({ type: 'success', text: `Assigned ${selectedAthleteIds.length} athletes to coach` });

      // Refresh data
      const response = await api.get('/assignments');
      setCoaches(response.data.coaches);
      setAthletes(response.data.athletes);

      setSelectedCoachId('');
      setSelectedAthleteIds([]);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Assignment failed' });
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (athleteId: string) => {
    try {
      await api.post('/assignments/unassign', { athleteId });

      const response = await api.get('/assignments');
      setCoaches(response.data.coaches);
      setAthletes(response.data.athletes);

      setMessage({ type: 'success', text: 'Athlete unassigned successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unassignment failed' });
    }
  };

  const stats = {
    totalCoaches: coaches.filter(c => c.role === 'COACH').length,
    totalAthletes: athletes.filter(a => a.role === 'ATHLETE').length,
    assignedAthletes: athletes.filter(a => a.role === 'ATHLETE' && a.assignedCoach).length,
    unassignedAthletes: athletes.filter(a => a.role === 'ATHLETE' && !a.assignedCoach).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal-900">Coach Assignments</h1>
          <p className="text-charcoal-600">Manage coach-athlete assignments</p>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Coach Assignments</h1>
          <p className="text-charcoal-600">Manage coach-athlete assignments</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-charcoal-100 text-charcoal-700 px-4 py-3 rounded-lg font-medium hover:bg-charcoal-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Shield className="text-blue-500" size={20} />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">COACH</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.totalCoaches}</p>
          <p className="text-sm text-charcoal-500">Total Coaches</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-green-500" size={20} />
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">ATHLETE</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.totalAthletes}</p>
          <p className="text-sm text-charcoal-500">Total Athletes</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <UserCheck className="text-blue-500" size={20} />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">ASSIGNED</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.assignedAthletes}</p>
          <p className="text-sm text-charcoal-500">Assigned Athletes</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <UserX className="text-amber-500" size={20} />
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">UNASSIGNED</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.unassignedAthletes}</p>
          <p className="text-sm text-charcoal-500">Unassigned Athletes</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Assignment Controls */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Assign Athletes to Coach</h3>
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Select Coach</label>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="w-full px-4 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Choose a coach...</option>
              {coaches.filter(c => c.role === 'COACH').map(coach => (
                <option key={coach._id} value={coach._id}>
                  {coach.name} ({coach.email}) - {coach.assignedAthletes?.length || 0} athletes
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Athletes to Assign</label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-charcoal-500">{selectedAthleteIds.length} selected</span>
              {selectedAthleteIds.length > 0 && (
                <button
                  onClick={() => setSelectedAthleteIds([])}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className="border border-charcoal-200 rounded-lg max-h-48 overflow-y-auto">
              {filteredAthletes.filter(a => a.role === 'ATHLETE').map(athlete => (
                <label key={athlete._id} className="flex items-center gap-3 p-3 hover:bg-charcoal-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAthleteIds.includes(athlete._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAthleteIds([...selectedAthleteIds, athlete._id]);
                      } else {
                        setSelectedAthleteIds(selectedAthleteIds.filter(id => id !== athlete._id));
                      }
                    }}
                    className="w-4 h-4 text-amber-500 rounded border-charcoal-300 focus:ring-amber-500"
                  />
                  <span className="text-sm text-charcoal-700">{athlete.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(athlete.role)}`}>
                    {athlete.role}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getAssignmentBadgeColor(athlete)}`}>
                    {getAssignmentBadge(athlete)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleAssign}
          disabled={assigning || !selectedCoachId || selectedAthleteIds.length === 0}
          className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {assigning ? 'Assigning...' : 'Assign Athletes'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={18} />
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'UNASSIGNED', 'ASSIGNED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white border border-charcoal-300 text-charcoal-700 hover:bg-charcoal-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Athletes List */}
      <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
        <div className="p-6 border-b border-charcoal-200">
          <h3 className="text-lg font-semibold text-charcoal-900">
            Athletes ({filteredAthletes.length})
          </h3>
        </div>
        <div className="divide-y divide-charcoal-200">
          {filteredAthletes.map(athlete => (
            <div key={athlete._id} className="flex items-center justify-between p-4 hover:bg-charcoal-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-charcoal-200 rounded-full flex items-center justify-center">
                  <span className="text-charcoal-600 font-semibold text-sm">
                    {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">{athlete.name}</p>
                  <p className="text-sm text-charcoal-500">{athlete.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getRoleBadgeColor(athlete.role)}`}>
                  {athlete.role}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getAssignmentBadgeColor(athlete)}`}>
                  {getAssignmentBadge(athlete)}
                </span>
              </div>
              {athlete.assignedCoach && (
                <button
                  onClick={() => handleUnassign(athlete._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Unassign
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignments;
