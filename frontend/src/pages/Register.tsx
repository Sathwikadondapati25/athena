import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'ATHLETE' | 'COACH' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select Athlete or Coach');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password;
      await register(name.trim(), normalizedEmail, normalizedPassword, role);
      if (role === 'COACH') {
        navigate('/coach', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '';
      if (errorMessage.includes('already exists') || errorMessage.includes('User already')) {
        setError('This email is already registered. Please sign in or use another email.');
      } else {
        setError('Unable to create your account right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            Join ATHENA
          </h1>
          <p className="text-charcoal-300 text-lg leading-relaxed mb-6">
            Create your account to access heat-risk awareness tools and make safer training decisions.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-charcoal-400">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>View real-time weather and risk assessments</span>
            </div>
            <div className="flex items-center gap-3 text-charcoal-400">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>Report symptoms quickly and easily</span>
            </div>
            <div className="flex items-center gap-3 text-charcoal-400">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>Access training schedules and safety information</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
            <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Create your account</h2>
            <p className="text-charcoal-600">Join ATHENA to protect student-athletes</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
             {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-charcoal-700 mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ATHLETE')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'ATHLETE'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                  }`}
                >
                  <div className="font-semibold">Athlete</div>
                  <div className="text-xs mt-1">View training and report symptoms</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('COACH')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'COACH'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                  }`}
                >
                  <div className="font-semibold">Coach</div>
                  <div className="text-xs mt-1">Manage athletes and training sessions</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="new-password"
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
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
              disabled={loading || !role}
              className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-charcoal-600">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
