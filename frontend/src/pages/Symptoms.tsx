import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../lib/api';

const Symptoms: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [severity, setSeverity] = useState('Mild');
  const [notes, setNotes] = useState('');

  const symptomOptions = [
    'Dizziness',
    'Headache',
    'Excessive fatigue',
    'Muscle cramps',
    'Nausea/vomiting',
    'Weakness',
    'Confusion',
    'Fainting',
    'Other'
  ];

  const toggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (symptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    if (symptoms.includes('Other') && !otherSymptoms) {
      setError('Please describe other symptoms');
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        symptoms: symptoms.filter(s => s !== 'Other'),
        otherSymptoms: symptoms.includes('Other') ? otherSymptoms : '',
        severity,
        notes
      };

      await api.post('/symptoms', reportData);
      setSubmitted(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to report symptoms');
    } finally {
      setLoading(false);
    }
  };

  const isSerious = severity === 'Severe' || symptoms.includes('Fainting') || symptoms.includes('Confusion');

  if (submitted) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Symptom Report</h1>
        <p className="text-charcoal-600 mb-8">Report your symptoms</p>

        <div className="bg-white p-8 rounded-xl border border-charcoal-200 text-center">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h2 className="text-2xl font-semibold text-charcoal-900 mb-2">Report Submitted</h2>
          <p className="text-charcoal-600 mb-6">Your symptom report has been recorded. Your coach will be notified.</p>
          {isSerious && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-left mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-800">
                  <strong>Important:</strong> If you are experiencing serious symptoms, please stop activity and seek immediate medical assistance according to your institution's emergency procedure.
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setSymptoms([]);
              setOtherSymptoms('');
              setSeverity('Mild');
              setNotes('');
            }}
            className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
          >
            Report Another Symptom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Symptom Reporting</h1>
      <p className="text-charcoal-600 mb-8">Report any heat-related symptoms you're experiencing</p>

      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-800">
            <strong>Medical Emergency:</strong> If you are experiencing severe symptoms such as confusion, fainting, or extreme distress, stop activity immediately and seek medical assistance according to your institution's emergency procedure.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-charcoal-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-3">
              Select symptoms you're experiencing:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {symptomOptions.map((symptom) => (
                <label key={symptom} className="flex items-center gap-3 p-3 border border-charcoal-200 rounded-lg hover:bg-charcoal-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="w-5 h-5 text-amber-600 rounded"
                  />
                  <span className="text-charcoal-700">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {symptoms.includes('Other') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Please describe other symptoms:
              </label>
              <textarea
                value={otherSymptoms}
                onChange={(e) => setOtherSymptoms(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Describe your symptoms..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Severity:
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                required
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Additional notes (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>

        <p className="text-sm text-charcoal-500 mt-4 text-center">
          This report will be shared with your coach for monitoring and follow-up.
        </p>
    </div>
  );
};

export default Symptoms;
