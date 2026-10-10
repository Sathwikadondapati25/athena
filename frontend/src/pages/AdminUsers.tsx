import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, Shield, UserCheck, UserX, Edit, Eye, Mail, Plus, AlertTriangle, Clock, ChevronDown, RefreshCw, MoreVertical } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ATHLETE' | 'COACH' | 'ADMIN';
  profile?: any;
  createdAt: string;
  lastLogin?: string | Date;
  isActive?: boolean;
  assignedCoach?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedAthletes?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  inviteToken?: string;
  inviteTokenExpire?: Date;
  inviteRole?: string;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ADMIN' | 'COACH' | 'ATHLETE' | 'PENDING'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ATHLETE' | 'COACH' | 'ADMIN' | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newRole, setNewRole] = useState<'ATHLETE' | 'COACH' | 'ADMIN' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: string } | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState<User[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filterTab, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', {
        params: {
          role: filterTab === 'PENDING' ? undefined : filterTab === 'ALL' ? undefined : filterTab,
          search: searchTerm || undefined,
          pendingOnly: filterTab === 'PENDING' ? 'true' : 'false'
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/users');
      const coaches = response.data.users.filter((u: User) => u.role === 'COACH');
      setAvailableCoaches(coaches);
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ATHLETE: 'bg-green-100 text-green-700 border-green-200',
      COACH: 'bg-blue-100 text-blue-700 border-blue-200',
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return styles[role as keyof typeof styles] || styles.ATHLETE;
  };

  const getStatusBadge = (user: User) => {
    if (user.inviteToken) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
    if (user.isActive === false) {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      ATHLETE: 'text-green-600',
      COACH: 'text-blue-600',
      ADMIN: 'text-purple-600',
    };
    return colors[role as keyof typeof colors] || 'text-gray-600';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterTab === 'PENDING') {
      return matchesSearch && user.inviteToken && new Date(user.inviteTokenExpire || 0) > new Date();
    }
    
    const matchesRole = filterTab === 'ALL' || user.role === filterTab;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    coaches: users.filter(u => u.role === 'COACH').length,
    athletes: users.filter(u => u.role === 'ATHLETE').length,
    unassignedAthletes: users.filter(u => u.role === 'ATHLETE' && !u.assignedCoach).length,
    coachesWithNoAthletes: users.filter(u => u.role === 'COACH' && (!u.assignedAthletes || u.assignedAthletes.length === 0)).length,
    pendingInvites: users.filter(u => u.inviteToken && new Date(u.inviteTokenExpire || 0) > new Date()).length,
  };

  const handleRoleChange = async () => {
    if (!pendingRoleChange) return;
    
    try {
      await api.put(`/users/${pendingRoleChange.userId}/role`, { role: pendingRoleChange.newRole });
      await fetchUsers();
      setShowConfirmDialog(false);
      setPendingRoleChange(null);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change role');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage(null);

    if (!inviteRole) {
      setInviteMessage({ type: 'error', text: 'Please select a role' });
      setInviteLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/invite', { email: inviteEmail, role: inviteRole });

      setInviteMessage({
        type: 'success',
        text: response.data.message + (response.data.inviteUrl ? `\n\nInvite link: ${response.data.inviteUrl}` : '')
      });
      setInviteEmail('');
      setInviteRole(null);

      await fetchUsers();
    } catch (error: any) {
      setInviteMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send invite'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAssignCoach = async () => {
    if (!selectedUser || !selectedCoachId) return;

    try {
      await api.put(`/users/${selectedUser._id}/assign-coach`, { coachId: selectedCoachId });
      await fetchUsers();
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedCoachId('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign coach');
    }
  };

  const handleUnassignCoach = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this athlete from their coach?')) return;

    try {
      await api.put(`/users/${userId}/unassign-coach`);
      await fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unassign coach');
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      const response = await api.post(`/auth/resend-invite/${userId}`);
      alert(response.data.message);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resend invite');
    }
  };

  const handleRevokeInvite = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;

    try {
      await api.delete(`/auth/invite/${userId}`);
      await fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to revoke invite');
    }
  };

  const isLastAdmin = selectedUser?.role === 'ADMIN' && stats.admins === 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900">User Management</h2>
          <p className="text-charcoal-600">Manage user accounts, roles, and assignments</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchUsers}
            className="bg-charcoal-100 text-charcoal-700 px-4 py-3 rounded-lg font-medium hover:bg-charcoal-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors flex items-center gap-2"
          >
            <Mail size={20} />
            Invite User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-charcoal-400" size={20} />
            <span className="text-xs font-medium text-charcoal-600 bg-charcoal-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.total}</p>
          <p className="text-sm text-charcoal-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Shield className="text-purple-500" size={20} />
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">ADMIN</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.admins}</p>
          <p className="text-sm text-charcoal-500">Administrators</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <UserCheck className="text-blue-500" size={20} />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">COACH</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.coaches}</p>
          <p className="text-sm text-charcoal-500">Coaches</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-green-500" size={20} />
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">ATHLETE</span>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{stats.athletes}</p>
          <p className="text-sm text-charcoal-500">Athletes</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-amber-600" size={20} />
            <span className="text-sm font-medium text-amber-700">Unassigned Athletes</span>
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{stats.unassignedAthletes}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={20} />
            <span className="text-sm font-medium text-orange-700">Coaches with No Athletes</span>
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{stats.coachesWithNoAthletes}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-yellow-600" size={20} />
            <span className="text-sm font-medium text-yellow-700">Pending Invites</span>
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{stats.pendingInvites}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-charcoal-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'ADMIN', 'COACH', 'ATHLETE', 'PENDING'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterTab === tab
                    ? 'bg-charcoal-900 text-white'
                    : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-charcoal-50 border-b border-charcoal-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Assigned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-charcoal-200 rounded-full flex items-center justify-center">
                        <span className="text-charcoal-600 font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900">{user.name}</p>
                        <p className="text-sm text-charcoal-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.inviteToken ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user)}`}>
                        Pending
                      </span>
                    ) : user.isActive === false ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user)}`}>
                        Inactive
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user)}`}>
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'ATHLETE' ? (
                      user.assignedCoach ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-charcoal-700">
                            {user.assignedCoach.name}
                          </span>
                          <button
                            onClick={() => handleUnassignCoach(user._id)}
                            className="text-red-600 hover:text-red-800 text-sm underline"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-600 text-sm">Unassigned</span>
                      )
                    ) : user.role === 'COACH' ? (
                      <span className="text-sm text-charcoal-700">
                        {user.assignedAthletes?.length || 0} athletes
                      </span>
                    ) : (
                      <span className="text-charcoal-400 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.inviteToken && (
                        <>
                          <button
                            onClick={() => handleResendInvite(user._id)}
                            className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
                            title="Resend Invite"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(user._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Revoke Invite"
                          >
                            <UserX size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                      {user.role === 'ATHLETE' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAssignModal(true);
                            fetchCoaches();
                          }}
                          className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
                          title="Assign Coach"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      {!user.inviteToken && (
                        <button
                          onClick={() => {
                            if (confirm(user.isActive ? 'Deactivate this user?' : 'Activate this user?')) {
                              api.put(`/users/${user._id}/deactivate`, { isActive: !user.isActive })
                                .then(() => fetchUsers())
                                .catch(err => alert(err.response?.data?.message || 'Failed to update status'));
                            }
                          }}
                          className={`p-2 ${user.isActive ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'} rounded-lg transition-colors`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
                        title="Change Role"
                      >
                        <Edit size={18} />
                      </button>
                      {!user.inviteToken && (
                        <button
                          onClick={() => {
                            if (!confirm(user.isActive ? 'Deactivate this user?' : 'Activate this user?')) return;
                            api.put(`/users/${user._id}/deactivate`, { isActive: !user.isActive })
                              .then(() => fetchUsers())
                              .catch(err => alert(err.response?.data?.message || 'Failed to update status'));
                          }}
                          className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                      )}
                      <button className="p-2 text-charcoal-400 hover:text-charcoal-600 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-charcoal-300 mb-4" size={48} />
            <p className="text-charcoal-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && !showEditModal && !showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-charcoal-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-charcoal-900">User Profile</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-charcoal-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-charcoal-600">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-charcoal-900">{selectedUser.name}</h4>
                  <p className="text-charcoal-500">{selectedUser.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-charcoal-50 rounded-lg">
                  <p className="text-sm text-charcoal-500 mb-1">User ID</p>
                  <p className="text-charcoal-900 font-medium">{selectedUser._id}</p>
                </div>
                <div className="p-4 bg-charcoal-50 rounded-lg">
                  <p className="text-sm text-charcoal-500 mb-1">Account Created</p>
                  <p className="text-charcoal-900 font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedUser.role === 'ATHLETE' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Assigned Coach</p>
                  {selectedUser.assignedCoach ? (
                    <p className="text-charcoal-900 font-medium">{selectedUser.assignedCoach.name}</p>
                  ) : (
                    <p className="text-charcoal-500">Unassigned</p>
                  )}
                </div>
              )}

              {selectedUser.role === 'COACH' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Assigned Athletes</p>
                  <p className="text-charcoal-900 font-medium">
                    {selectedUser.assignedAthletes?.length || 0} athletes
                  </p>
                </div>
              )}

              {selectedUser.profile && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-charcoal-900">Additional Information</h5>
                  {selectedUser.profile.phone && (
                    <div className="flex justify-between p-3 bg-charcoal-50 rounded-lg">
                      <span className="text-charcoal-600">Phone</span>
                      <span className="text-charcoal-900">{selectedUser.profile.phone}</span>
                    </div>
                  )}
                  {selectedUser.profile.college && (
                    <div className="flex justify-between p-3 bg-charcoal-50 rounded-lg">
                      <span className="text-charcoal-600">College</span>
                      <span className="text-charcoal-900">{selectedUser.profile.college}</span>
                    </div>
                  )}
                  {selectedUser.profile.department && (
                    <div className="flex justify-between p-3 bg-charcoal-50 rounded-lg">
                      <span className="text-charcoal-600">Department</span>
                      <span className="text-charcoal-900">{selectedUser.profile.department}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-charcoal-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-3 border border-charcoal-300 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Close
              </button>
              {selectedUser.role === 'ATHLETE' && (
                <button
                  onClick={() => {
                    setShowAssignModal(true);
                    fetchCoaches();
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Assign Coach
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Coach Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-charcoal-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-charcoal-900">Assign Coach</h3>
              <button
                onClick={() => { setShowAssignModal(false); setSelectedUser(null); setSelectedCoachId(''); }}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Athlete
                </label>
                <div className="p-3 bg-charcoal-50 rounded-lg">
                  <p className="font-medium text-charcoal-900">{selectedUser.name}</p>
                  <p className="text-sm text-charcoal-500">{selectedUser.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Select Coach
                </label>
                <select
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a coach</option>
                  {availableCoaches.map((coach) => (
                    <option key={coach._id} value={coach._id}>
                      {coach.name} ({coach.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-charcoal-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowAssignModal(false); setSelectedUser(null); setSelectedCoachId(''); }}
                className="px-6 py-3 border border-charcoal-300 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCoach}
                disabled={!selectedCoachId}
                className="px-6 py-3 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-charcoal-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-charcoal-900">Change Role</h3>
              <button
                onClick={() => { setShowEditModal(false); setSelectedUser(null); setNewRole(selectedUser.role); }}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Current Role
                </label>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  New Role
                </label>
                <select
                  value={newRole || ''}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a role</option>
                  <option value="ATHLETE">ATHLETE</option>
                  <option value="COACH">COACH</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {isLastAdmin && newRole !== 'ADMIN' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-800">
                      <strong>Warning:</strong> You cannot remove the last administrator. Create another admin first.
                    </p>
                  </div>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Changing user roles affects their access to system features. Only assign ADMIN role to authorized personnel.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-charcoal-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowEditModal(false); setSelectedUser(null); setNewRole(null); }}
                className="px-6 py-3 border border-charcoal-300 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPendingRoleChange({ userId: selectedUser._id, newRole });
                  setShowConfirmDialog(true);
                }}
                disabled={isLastAdmin && newRole !== 'ADMIN'}
                className="px-6 py-3 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50"
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && pendingRoleChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-600" size={24} />
              <h3 className="text-xl font-bold text-charcoal-900">Confirm Role Change</h3>
            </div>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to change <strong>{selectedUser?.name}</strong> from <strong>{selectedUser?.role}</strong> to <strong>{pendingRoleChange.newRole}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingRoleChange(null);
                }}
                className="px-6 py-3 border border-charcoal-300 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-6 py-3 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-charcoal-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-charcoal-900">Invite New User</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole || ''}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a role</option>
                  <option value="ATHLETE">ATHLETE</option>
                  <option value="COACH">COACH</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {inviteMessage && (
                <div className={`p-4 rounded-lg ${
                  inviteMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {inviteMessage.text}
                </div>
              )}
            </form>
            <div className="p-6 border-t border-charcoal-200 flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-6 py-3 border border-charcoal-300 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviteLoading || !inviteRole}
                className="px-6 py-3 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
