import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Activity, AlertTriangle, Thermometer, Droplets, TrendingUp, ArrowLeft, Edit } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AthleteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [athlete, setAthlete] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentSymptoms, setRecentSymptoms] = useState<any[]>([]);
  const [recentRiskAssessments, setRecentRiskAssessments] = useState<any[]>([]);

  useEffect(() => {
    fetchAthleteData();
  }, [id]);

  const fetchAthleteData = async () => {
    try {
      const userResponse = await api.get(`/users/${id}`);
      setAthlete(userResponse.data.user);

      // Fetch recent symptoms and risk assessments
      const [symptomsResponse, riskResponse] = await Promise.all([
        api.get('/symptoms'),
        api.get('/risk-assessments')
      ]);

      setRecentSymptoms(symptomsResponse.data.symptoms?.filter((s: any) => s.userId === id) || []);
      setRecentRiskAssessments(riskResponse.data.assessments?.filter((r: any) => r.userId === id) || []);
    } catch (error) {
      console.error('Failed to fetch athlete data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      case 'MODERATE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'VERY HIGH': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-500">Loading athlete profile...</div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-500">Athlete not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-charcoal-600" size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900">Athlete Profile</h2>
          <p className="text-charcoal-600">View athlete information and training data</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-charcoal-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-charcoal-600">
              {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-charcoal-900">{athlete.name}</h3>
                <p className="text-charcoal-500">{athlete.email}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  ATHLETE
                </span>
              </div>
              {currentUser?.role === 'ADMIN' && (
                <button className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors">
                  <Edit className="text-charcoal-600" size={20} />
                </button>
              )}
            </div>
            
            {athlete.profile && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {athlete.profile.sport && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Sport</p>
                    <p className="text-sm font-medium text-charcoal-900">{athlete.profile.sport}</p>
                  </div>
                )}
                {athlete.profile.yearOfStudy && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Year</p>
                    <p className="text-sm font-medium text-charcoal-900">{athlete.profile.yearOfStudy}</p>
                  </div>
                )}
                {athlete.profile.department && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Department</p>
                    <p className="text-sm font-medium text-charcoal-900">{athlete.profile.department}</p>
                  </div>
                )}
                {athlete.profile.trainingLevel && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Training Level</p>
                    <p className="text-sm font-medium text-charcoal-900">{athlete.profile.trainingLevel}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coach Assignment */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Coach Assignment</h3>
        {athlete.assignedCoach ? (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-charcoal-600 font-semibold text-sm">
                  {athlete.assignedCoach.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-medium text-charcoal-900">{athlete.assignedCoach.name}</p>
                <p className="text-sm text-charcoal-500">{athlete.assignedCoach.email}</p>
              </div>
            </div>
            {currentUser?.role === 'ADMIN' && (
              <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                Change Coach
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={20} />
              <p className="text-amber-800">This athlete is not assigned to any coach</p>
            </div>
            {currentUser?.role === 'ADMIN' && (
              <button className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium">
                Assign Coach
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Symptoms */}
        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Recent Symptom Reports</h3>
          {recentSymptoms.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              No symptom reports
            </div>
          ) : (
            <div className="space-y-3">
              {recentSymptoms.slice(0, 5).map((symptom) => (
                <div key={symptom._id} className="flex items-start gap-3 p-3 bg-charcoal-50 rounded-lg">
                  <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-900">{symptom.symptoms?.join(', ') || 'Symptoms reported'}</p>
                    <p className="text-xs text-charcoal-500">{new Date(symptom.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Risk Assessments */}
        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Recent Risk Assessments</h3>
          {recentRiskAssessments.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              No risk assessments
            </div>
          ) : (
            <div className="space-y-3">
              {recentRiskAssessments.slice(0, 5).map((assessment) => (
                <div key={assessment._id} className="flex items-start gap-3 p-3 bg-charcoal-50 rounded-lg">
                  <Activity className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-charcoal-900">Risk Assessment</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRiskColor(assessment.riskLevel)}`}>
                        {assessment.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500">{new Date(assessment.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to={`/risk-assessment?userId=${id}`}
            className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
          >
            <Activity className="text-charcoal-600" size={20} />
            <span className="text-sm font-medium text-charcoal-900">Risk Assessment</span>
          </Link>
          <Link
            to={`/symptoms?userId=${id}`}
            className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
          >
            <AlertTriangle className="text-charcoal-600" size={20} />
            <span className="text-sm font-medium text-charcoal-900">Report Symptoms</span>
          </Link>
          <Link
            to={`/training?userId=${id}`}
            className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
          >
            <Calendar className="text-charcoal-600" size={20} />
            <span className="text-sm font-medium text-charcoal-900">Training Log</span>
          </Link>
          <Link
            to={`/analytics?userId=${id}`}
            className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
          >
            <TrendingUp className="text-charcoal-600" size={20} />
            <span className="text-sm font-medium text-charcoal-900">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AthleteDetail;
