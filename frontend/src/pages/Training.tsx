import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, Thermometer, Clock } from 'lucide-react';
import api from '../lib/api';

const Training: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    sport: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: 60,
    intensity: 'Medium',
    numberOfAthletes: 10,
    hydrationAvailable: true,
    shadeAvailable: true,
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/training-sessions');
        setSessions(response.data.sessions);
      } catch (error) {
        console.error('Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/training-sessions', formData);
      setSessions([...sessions, response.data.session]);
      setShowForm(false);
      setFormData({
        sport: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        duration: 60,
        intensity: 'Medium',
        numberOfAthletes: 10,
        hydrationAvailable: true,
        shadeAvailable: true,
      });
    } catch (error) {
      console.error('Failed to create session');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'VERY HIGH': return 'bg-red-900 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'GO': return 'bg-green-600';
      case 'MODIFY': return 'bg-yellow-600';
      case 'NO-GO': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (user?.role === 'ATHLETE') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Training Sessions</h1>
        <p className="text-charcoal-600 mb-8">View your training schedule</p>

        <div className="bg-white p-8 rounded-xl border border-charcoal-200 text-center">
          <Calendar className="mx-auto text-charcoal-400 mb-4" size={48} />
          <p className="text-charcoal-600">Training sessions are managed by coaches.</p>
          <p className="text-charcoal-500 mt-2">Contact your coach for schedule information.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Training Sessions</h1>
      <p className="text-charcoal-600 mb-8">Manage training sessions and schedules</p>

      {(user?.role === 'COACH' || user?.role === 'ADMIN') && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'Create Session'}
        </button>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-charcoal-200 mb-6">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Create Training Session</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Sport</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select sport</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Soccer">Soccer</option>
                <option value="Track and Field">Track and Field</option>
                <option value="Tennis">Tennis</option>
                <option value="Cross Country">Cross Country</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
                min="15"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Intensity</label>
              <select
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Number of Athletes</label>
              <input
                type="number"
                value={formData.numberOfAthletes}
                onChange={(e) => setFormData({ ...formData, numberOfAthletes: parseInt(e.target.value) })}
                required
                min="1"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hydrationAvailable}
                  onChange={(e) => setFormData({ ...formData, hydrationAvailable: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded"
                />
                <span className="text-charcoal-700">Hydration available</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.shadeAvailable}
                  onChange={(e) => setFormData({ ...formData, shadeAvailable: e.target.checked })}
                  className="w-5 h-5 text-amber-600 rounded"
                />
                <span className="text-charcoal-700">Shade available</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-charcoal-500">
            <Calendar className="mx-auto mb-4" size={48} />
            <p>No training sessions scheduled yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-charcoal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Sport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Intensity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Decision</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-charcoal-200">
              {sessions.map((session) => (
                <tr key={session._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">{session.sport}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{new Date(session.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{session.startTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{session.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{session.intensity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(session.riskLevel)}`}>
                      {session.riskLevel || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getDecisionColor(session.decision)}`}>
                      {session.decision || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Training;
