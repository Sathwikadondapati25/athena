import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Calendar, Lock, Bell, Save, Camera, Activity } from 'lucide-react';
import api from '../lib/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Personal Information
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    college: '',
  });

  // Role-specific fields
  const [roleData, setRoleData] = useState({
    sport: '',
    yearOfStudy: '',
    department: '',
    trainingLevel: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    designation: '',
    experience: '',
    accessLevel: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    trainingReminders: true,
    incidentUpdates: true,
    systemNotifications: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const userData = response.data.user;
        setFormData(prev => ({ 
          ...prev, 
          name: userData.name || '', 
          email: userData.email || '',
          phone: userData.profile?.phone || '',
          dateOfBirth: userData.profile?.dateOfBirth?.split('T')[0] || '',
          gender: userData.profile?.gender || '',
          college: userData.profile?.college || '',
        }));
        setRoleData({
          sport: userData.profile?.sport || '',
          yearOfStudy: userData.profile?.yearOfStudy || '',
          department: userData.profile?.department || '',
          trainingLevel: userData.profile?.trainingLevel || '',
          emergencyContactName: userData.profile?.emergencyContactName || '',
          emergencyContactPhone: userData.profile?.emergencyContactPhone || '',
          designation: userData.profile?.designation || '',
          experience: userData.profile?.experience || '',
          accessLevel: userData.profile?.accessLevel || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.put('/users/profile', {
        ...formData,
        ...roleData,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderRoleSpecificFields = () => {
    if (user?.role === 'ATHLETE') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Sport</label>
            <input
              type="text"
              value={roleData.sport}
              onChange={(e) => setRoleData({ ...roleData, sport: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Football, Basketball"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Year of Study</label>
            <select
              value={roleData.yearOfStudy}
              onChange={(e) => setRoleData({ ...roleData, yearOfStudy: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Department</label>
            <input
              type="text"
              value={roleData.department}
              onChange={(e) => setRoleData({ ...roleData, department: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Engineering, Arts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Training Level</label>
            <select
              value={roleData.trainingLevel}
              onChange={(e) => setRoleData({ ...roleData, trainingLevel: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Emergency Contact Name</label>
              <input
                type="text"
                value={roleData.emergencyContactName}
                onChange={(e) => setRoleData({ ...roleData, emergencyContactName: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Emergency Contact Phone</label>
              <input
                type="tel"
                value={roleData.emergencyContactPhone}
                onChange={(e) => setRoleData({ ...roleData, emergencyContactPhone: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Contact phone"
              />
            </div>
          </div>
        </div>
      );
    }

    if (user?.role === 'COACH') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Sport/Team</label>
            <input
              type="text"
              value={roleData.sport}
              onChange={(e) => setRoleData({ ...roleData, sport: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Football - Varsity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Department</label>
            <input
              type="text"
              value={roleData.department}
              onChange={(e) => setRoleData({ ...roleData, department: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Athletics Department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Designation</label>
            <input
              type="text"
              value={roleData.designation}
              onChange={(e) => setRoleData({ ...roleData, designation: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Head Coach"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Coaching Experience</label>
            <select
              value={roleData.experience}
              onChange={(e) => setRoleData({ ...roleData, experience: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select experience</option>
              <option value="0-2">0-2 years</option>
              <option value="2-5">2-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
        </div>
      );
    }

    if (user?.role === 'ADMIN') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Department</label>
            <input
              type="text"
              value={roleData.department}
              onChange={(e) => setRoleData({ ...roleData, department: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Administration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Designation</label>
            <input
              type="text"
              value={roleData.designation}
              onChange={(e) => setRoleData({ ...roleData, designation: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Athletic Director"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Administrative Access Level</label>
            <select
              value={roleData.accessLevel}
              onChange={(e) => setRoleData({ ...roleData, accessLevel: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select level</option>
              <option value="full">Full Access</option>
              <option value="limited">Limited Access</option>
              <option value="view">View Only</option>
            </select>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-charcoal-200 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-charcoal-600">
                {getInitials(user?.name || 'User')}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white hover:bg-amber-600 transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-charcoal-900">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                user?.role === 'COACH' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {user?.role}
              </span>
              <span className="text-charcoal-500 text-sm">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-charcoal-600" size={24} />
          <h3 className="text-lg font-semibold text-charcoal-900">Personal Information</h3>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg bg-charcoal-50 text-charcoal-500"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">College / Institution</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Your institution name"
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          <div className="pt-4 border-t border-charcoal-200">
            <h4 className="text-sm font-semibold text-charcoal-700 mb-4">
              {user?.role === 'ATHLETE' && 'Athlete Information'}
              {user?.role === 'COACH' && 'Coach Information'}
              {user?.role === 'ADMIN' && 'Administrative Information'}
            </h4>
            {renderRoleSpecificFields()}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-charcoal-600" size={24} />
          <h3 className="text-lg font-semibold text-charcoal-900">Account Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-charcoal-500 mb-1">User ID</p>
            <p className="text-charcoal-900 font-medium">{user?.id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500 mb-1">Role</p>
            <p className="text-charcoal-900 font-medium">{user?.role}</p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500 mb-1">Account Created</p>
            <p className="text-charcoal-900 font-medium">January 2026</p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500 mb-1">Account Status</p>
            <span className="inline-flex items-center gap-2 text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-charcoal-600" size={24} />
          <h3 className="text-lg font-semibold text-charcoal-900">Security</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Lock size={18} />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-charcoal-600" size={24} />
          <h3 className="text-lg font-semibold text-charcoal-900">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'weatherAlerts', label: 'Weather/Risk Alerts', icon: Activity },
            { key: 'trainingReminders', label: 'Training Reminders', icon: Calendar },
            { key: 'incidentUpdates', label: 'Incident Updates', icon: Shield },
            { key: 'systemNotifications', label: 'System Notifications', icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="text-charcoal-600" size={20} />
                <span className="text-charcoal-900 font-medium">{label}</span>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications] ? 'bg-amber-500' : 'bg-charcoal-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[key as keyof typeof notifications] ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Profile;
