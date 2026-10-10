import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import api from '../lib/api';

const Incidents: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents');
        setIncidents(response.data.incidents || []);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      } finally {
        setLoadingIncidents(false);
      }
    };

    fetchIncidents();
  }, [user?.id, user?.role]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    sport: '',
    numberAffected: 1,
    symptoms: '',
    temperature: 30,
    humidity: 60,
    trainingDuration: 60,
    trainingIntensity: 'Medium',
    actionTaken: '',
    medicalAssistance: false,
    outcome: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const incidentData = {
        ...formData,
        symptoms: formData.symptoms.split(',').map(s => s.trim())
      };

      await api.post('/incidents', incidentData);
      setSubmitted(true);

      // Reload incidents list
      const response = await api.get('/incidents');
      setIncidents(response.data.incidents || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to record incident');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Incident Recording</h1>
        <p className="text-charcoal-600 mb-8">Record heat-related incidents</p>

        <div className="bg-white p-8 rounded-xl border border-charcoal-200 text-center">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h2 className="text-2xl font-semibold text-charcoal-900 mb-2">Incident Recorded</h2>
          <p className="text-charcoal-600 mb-6">The incident has been recorded and will be reviewed by the administration.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setShowForm(false);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                time: '',
                sport: '',
                numberAffected: 1,
                symptoms: '',
                temperature: 30,
                humidity: 60,
                trainingDuration: 60,
                trainingIntensity: 'Medium',
                actionTaken: '',
                medicalAssistance: false,
                outcome: '',
                notes: ''
              });
            }}
            className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
          >
            Record Another Incident
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Incidents</h1>
          <p className="text-charcoal-600">View and record heat-related incidents</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Record Incident
          </button>
        )}
      </div>

      {/* Incidents List */}
      {!showForm && !submitted && (
        <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden mb-6">
          {loadingIncidents ? (
            <div className="p-12 text-center">
              <div className="animate-pulse">Loading incidents...</div>
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="mx-auto text-charcoal-300 mb-4" size={48} />
              <p className="text-charcoal-500">No incidents recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-charcoal-50 border-b border-charcoal-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Sport</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Symptoms</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Outcome</th>
                    {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Reported By</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-200">
                  {incidents.map((incident) => (
                    <tr key={incident._id} className="hover:bg-charcoal-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-charcoal-600">
                        {new Date(incident.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-900 font-medium">
                        {incident.sport}
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-600">
                        {Array.isArray(incident.symptoms) ? incident.symptoms.join(', ') : incident.symptoms}
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-600">
                        {incident.outcome || 'N/A'}
                      </td>
                      {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                        <td className="px-6 py-4 text-sm text-charcoal-600">
                          {incident.reportedBy?.name || 'Unknown'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Incident Form */}
      {(showForm || submitted) && (
        <div className="bg-white p-6 rounded-xl border border-charcoal-200">
          {showForm && (
            <button
              onClick={() => setShowForm(false)}
              className="mb-4 text-charcoal-600 hover:text-charcoal-900 text-sm"
            >
              ← Back to list
            </button>
          )}
      <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
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
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Number Affected</label>
              <input
                type="number"
                value={formData.numberAffected}
                onChange={(e) => setFormData({ ...formData, numberAffected: parseInt(e.target.value) })}
                required
                min="1"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Symptoms (comma-separated)</label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                required
                placeholder="Dizziness, Headache, Nausea"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Temperature (°C)</label>
              <input
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                required
                step="0.1"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Humidity (%)</label>
              <input
                type="number"
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: parseInt(e.target.value) })}
                required
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Training Duration (minutes)</label>
              <input
                type="number"
                value={formData.trainingDuration}
                onChange={(e) => setFormData({ ...formData, trainingDuration: parseInt(e.target.value) })}
                required
                min="1"
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Training Intensity</label>
              <select
                value={formData.trainingIntensity}
                onChange={(e) => setFormData({ ...formData, trainingIntensity: e.target.value })}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Action Taken</label>
            <textarea
              value={formData.actionTaken}
              onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Describe the actions taken..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.medicalAssistance}
                onChange={(e) => setFormData({ ...formData, medicalAssistance: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded"
              />
              <span className="text-charcoal-700">Medical assistance was provided</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Outcome</label>
              <input
                type="text"
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., Athlete recovered, Athlete hospitalized"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Any additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 disabled:bg-charcoal-400 transition-colors"
          >
            {loading ? 'Recording...' : 'Record Incident'}
          </button>
        </form>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-sm text-amber-800">
              This incident record will be reviewed by the administration and used to improve future training planning and safety protocols.
            </p>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
