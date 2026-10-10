import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new password reset.' });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', { token, password });
      setMessage({ 
        type: 'success', 
        text: 'Your password has been reset successfully. Please sign in with your new password.' 
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl border border-charcoal-200 p-8 text-center">
          <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Invalid Reset Link</h2>
          <p className="text-charcoal-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link 
            to="/forgot-password" 
            className="inline-block bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
          >
            Request a New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Shield className="text-charcoal-900" size={28} />
            </div>
            <span className="text-3xl font-bold text-white">ATHENA</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Reset Your Password
          </h1>
          <p className="text-charcoal-300 text-lg leading-relaxed">
            Create a new secure password for your ATHENA account.
          </p>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-900 rounded-lg flex items-center justify-center">
              <Shield className="text-amber-500" size={24} />
            </div>
            <span className="text-2xl font-bold text-charcoal-900">ATHENA</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-2">New Password</h2>
            <p className="text-charcoal-600">Enter your new password below</p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {!message || message.type !== 'success' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <p className="text-green-800 mb-4">
                Your password has been reset successfully.
              </p>
              <p className="text-sm text-green-600">
                Redirecting to login page...
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
