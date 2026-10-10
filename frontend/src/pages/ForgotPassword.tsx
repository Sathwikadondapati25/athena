import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../lib/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      setMessage({ 
        type: 'success', 
        text: 'If an account exists for this email, a password reset link has been sent.' 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send reset link' 
      });
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
            Forgot Your Password?
          </h1>
          <p className="text-charcoal-300 text-lg leading-relaxed">
            No worries! We'll help you reset your password so you can get back to training safely.
          </p>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
            <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Reset Password</h2>
            <p className="text-charcoal-600">Enter your email to receive a reset link</p>
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

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal-900 text-white py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <p className="text-green-800 mb-4">
                If an account exists for this email, a password reset link has been sent.
              </p>
              <p className="text-sm text-green-600">
                Please check your email and follow the instructions to reset your password.
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

export default ForgotPassword;
