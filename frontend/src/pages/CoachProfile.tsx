import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Activity, ArrowLeft, Users, Phone, MapPin } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const CoachProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedAthletes, setAssignedAthletes] = useState<any[]>([]);

  useEffect(() => {
    fetchCoachData();
  }, [id]);

  const fetchCoachData = async () => {
    try {
      const userResponse = await api.get(`/users/${id}`);
      const coachData = userResponse.data.user;

      // Authorization check: Athletes can only view their assigned coach
      if (currentUser?.role === 'ATHLETE') {
        if (!currentUser.profile?.assignedCoach || currentUser.profile.assignedCoach !== id) {
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      // Verify the user is actually a coach
      if (coachData.role !== 'COACH') {
        navigate('/dashboard', { replace: true });
        return;
      }

      setCoach(coachData);

      // Fetch assigned athletes
      const athletesResponse = await api.get(`/users/coach/${id}/athletes`);
      setAssignedAthletes(athletesResponse.data.athletes || []);
    } catch (error) {
      console.error('Failed to fetch coach data:', error);
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-500">Loading coach profile...</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-500">Coach not found</div>
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
          <h2 className="text-2xl font-bold text-charcoal-900">Coach Profile</h2>
          <p className="text-charcoal-600">View coach information and assigned athletes</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-charcoal-600">
              {coach.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <div>
              <h3 className="text-xl font-semibold text-charcoal-900">{coach.name}</h3>
              <p className="text-charcoal-500">{coach.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                COACH
              </span>
            </div>
            
            {coach.profile && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {coach.profile.sport && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Sport</p>
                    <p className="text-sm font-medium text-charcoal-900">{coach.profile.sport}</p>
                  </div>
                )}
                {coach.profile.department && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Department</p>
                    <p className="text-sm font-medium text-charcoal-900">{coach.profile.department}</p>
                  </div>
                )}
                {coach.profile.designation && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Designation</p>
                    <p className="text-sm font-medium text-charcoal-900">{coach.profile.designation}</p>
                  </div>
                )}
                {coach.profile.experience && (
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Experience</p>
                    <p className="text-sm font-medium text-charcoal-900">{coach.profile.experience}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information (Read-only for athletes) */}
      {currentUser?.role === 'ADMIN' && coach.profile && (
        <div className="bg-white rounded-xl border border-charcoal-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {coach.profile.phone && (
              <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg">
                <Phone className="text-charcoal-400" size={20} />
                <div>
                  <p className="text-xs text-charcoal-500">Phone</p>
                  <p className="text-sm font-medium text-charcoal-900">{coach.profile.phone}</p>
                </div>
              </div>
            )}
            {coach.profile.college && (
              <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg">
                <MapPin className="text-charcoal-400" size={20} />
                <div>
                  <p className="text-xs text-charcoal-500">College</p>
                  <p className="text-sm font-medium text-charcoal-900">{coach.profile.college}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assigned Athletes */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900">Assigned Athletes</h3>
          <span className="text-sm text-charcoal-500">{assignedAthletes.length} athletes</span>
        </div>
        {assignedAthletes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-charcoal-300 mb-4" size={48} />
            <p className="text-charcoal-500">No athletes assigned to this coach</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedAthletes.map((athlete) => (
              <div key={athlete._id} className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors">
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
                </div>
                {currentUser?.role === 'ADMIN' && (
                  <Link
                    to={`/athletes/${athlete._id}`}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    View →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachProfile;
