import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      // For now, we'll just check if token exists
      // In a real implementation, you'd have a backend endpoint to validate
      if (token && token.length > 20) {
        setValidToken(true);
        // Extract email from token or show a generic message
        setEmail('user@example.com'); // This would come from backend
        setRole('ATHLETE'); // This would come from backend
      } else {
        setValidToken(false);
      }
    } catch (error) {
      setValidToken(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/auth/accept-invite', {
        token,
        name: formData.name,
        password: formData.password
      });

      setSuccess(true);
      
      // Auto-login after accepting invite
      if (response.data.token && response.data.user) {
        await login(formData.email, formData.password);
      }

      // Redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to accept invite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">
        <div className="text-charcoal-600">Validating invite...</div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Invalid Invite</h2>
            <p className="text-charcoal-600 mb-6">
              This invite link is invalid or has expired. Please contact your administrator for a new invite.
            </p>
            <Link
              to="/login"
              className="inline-block bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Account Created!</h2>
            <p className="text-charcoal-600 mb-6">
              Your account has been created successfully. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-amber-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">ATHENA</h1>
          <p className="text-charcoal-600">Complete your account setup</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-charcoal-600 hover:text-charcoal-900 text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
