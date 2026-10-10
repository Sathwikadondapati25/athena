import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ATHLETE' | 'COACH' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'ATHLETE' | 'COACH' | null) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error: any) {
          // Only clear token if it's actually invalid (401), not on network errors
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Email already normalized in Login component, but ensure again here
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;
    const response = await api.post('/auth/login', { email: normalizedEmail, password: normalizedPassword });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser; // Return user for role-based redirect
  };

  const register = async (name: string, email: string, password: string, role: 'ATHLETE' | 'COACH' | null) => {
    // Public registration can create ATHLETE or COACH accounts
    // Admin accounts can only be created via seed or by another admin
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;
    const response = await api.post('/auth/register', { name: name.trim(), email: normalizedEmail, password: normalizedPassword, role });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Clear any cached form data (if any)
    localStorage.removeItem('loginEmail');
    // Navigate to login page using window.location for full redirect
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
