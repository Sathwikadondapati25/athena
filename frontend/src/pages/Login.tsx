import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle browser back/forward navigation (bfcache) without clearing on initial mount
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setEmail('');
        setPassword('');
        setError('');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Read values directly from refs/DOM elements for autofill & password manager compatibility
    const form = e.currentTarget;
    const formEmail = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const formPassword = (form.elements.namedItem('password') as HTMLInputElement)?.value;

    const currentEmail = emailInputRef.current?.value || formEmail || email;
    const currentPassword = passwordInputRef.current?.value || formPassword || password;

    if (!currentEmail || !currentPassword) {
      setError('Please provide email and password');
      return;
    }

    try {
      // Trim and lowercase email, do NOT trim password
      const normalizedEmail = currentEmail.trim().toLowerCase();
      const normalizedPassword = currentPassword;
      const user = await login(normalizedEmail, normalizedPassword);

      // Redirect based on user role
      let redirectPath = '/dashboard';
      if (user.role === 'ADMIN') {
        redirectPath = '/admin';
      } else if (user.role === 'COACH') {
        redirectPath = '/coach';
      }

      // Use navigate with replace to prevent back navigation
      navigate(redirectPath, { replace: true });

      // Clear login form data from localStorage
      localStorage.removeItem('loginEmail');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setPassword(''); // Clear password on failed login
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
            Heat-Risk Awareness for Outdoor Student-Athletes
          </h1>
          <p className="text-charcoal-300 text-lg leading-relaxed">
            Make safer training decisions with objective weather and heat-risk information designed for colleges and athletic departments.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-charcoal-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>Evidence-based risk assessments</span>
          </div>
          <div className="flex items-center gap-3 text-charcoal-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>Real-time weather integration</span>
          </div>
          <div className="flex items-center gap-3 text-charcoal-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>Incident tracking and analytics</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Welcome back</h2>
            <p className="text-charcoal-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="username"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setShowPassword(false)}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-charcoal-300 focus:ring-amber-500" 
                />
                <span className="text-sm text-charcoal-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-all flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-charcoal-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
