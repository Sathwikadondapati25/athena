import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';
import { RouteGuard } from './components/RouteGuard';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './layouts/AdminLayout';
import CoachLayout from './layouts/CoachLayout';
import AthleteLayout from './layouts/AthleteLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import Dashboard from './pages/Dashboard';
import CoachDashboard from './pages/CoachDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CoachAthletes from './pages/CoachAthletes';
import RiskAssessment from './pages/RiskAssessment';
import Symptoms from './pages/Symptoms';
import Incidents from './pages/Incidents';
import Analytics from './pages/Analytics';
import Training from './pages/Training';
import Weather from './pages/Weather';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminAssignments from './pages/AdminAssignments';
import AdminRiskRules from './pages/AdminRiskRules';
import AthleteDetail from './pages/AthleteDetail';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  // Don't show loading state - let the individual pages handle their own loading
  // This prevents the blinking issue

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/accept-invite/:token" element={<AcceptInvite />} />

      {/* Admin routes with nested layout */}
      <Route
        path="/admin/*"
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="training-sessions" element={<Training />} />
        <Route path="risk-assessments" element={<RiskAssessment />} />
        <Route path="risk-rules" element={<AdminRiskRules />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="reports" element={<div className="p-6">Reports Page</div>} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Coach routes with nested layout */}
      <Route
        path="/coach/*"
        element={
          <RoleProtectedRoute allowedRoles={['COACH']}>
            <CoachLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<CoachDashboard />} />
        <Route path="athletes" element={<CoachAthletes />} />
        <Route path="my-athletes" element={<CoachAthletes />} />
        <Route path="athletes/:id" element={<AthleteDetail />} />
        <Route path="training-sessions" element={<Training />} />
        <Route path="training-risk" element={<RiskAssessment />} />
        <Route path="weather" element={<Weather />} />
        <Route path="symptoms" element={<Symptoms />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="team-analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Athlete routes with nested layout */}
      <Route
        path="/dashboard/*"
        element={
          <RoleProtectedRoute allowedRoles={['ATHLETE']}>
            <AthleteLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="training-sessions" element={<Training />} />
        <Route path="training-risk" element={<RiskAssessment />} />
        <Route path="weather" element={<Weather />} />
        <Route path="symptoms" element={<Symptoms />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Legacy routes - redirect to new structure */}
      <Route path="/risk-assessment" element={<Navigate to="/dashboard/training-risk" replace />} />
      <Route path="/symptoms" element={<Navigate to="/dashboard/symptoms" replace />} />
      <Route path="/incidents" element={<Navigate to="/dashboard/incidents" replace />} />
      <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="/training" element={<Navigate to="/dashboard/training-sessions" replace />} />
      <Route path="/weather" element={<Navigate to="/dashboard/weather" replace />} />
      <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
      <Route path="/athletes/:id" element={<Navigate to="/coach/athletes/:id" replace />} />
      <Route path="/coach/:id/profile" element={<Navigate to="/coach/profile" replace />} />

      {/* Role-based redirect after login */}
      <Route
        path="/auth-redirect"
        element={
          <ProtectedRoute>
            {user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> :
             user?.role === 'COACH' ? <Navigate to="/coach" replace /> :
             <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <RouteGuard>
            <AppRoutes />
          </RouteGuard>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
