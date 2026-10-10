import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/accept-invite'];

const getRoleHome = (role: string) => {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'COACH': return '/coach';
    case 'ATHLETE': return '/dashboard';
    default: return '/dashboard';
  }
};

// Check if a path is exactly a public route or a dynamic public route
const isPublicRoute = (pathname: string) => {
  // Exact match for static routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  // Match dynamic routes like /reset-password/:token
  if (pathname.startsWith('/reset-password/') || pathname.startsWith('/accept-invite/')) {
    return true;
  }
  return false;
};

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicRoute = isPublicRoute(location.pathname);

    // Redirect authenticated users from public routes to their role home
    if (publicRoute && isAuthenticated && user) {
      const roleHome = getRoleHome(user.role);
      navigate(roleHome, { replace: true });
    }

    // Prevent back navigation to login page when authenticated
    const handlePopState = (event: PopStateEvent) => {
      if (isAuthenticated && isPublicRoute(location.pathname)) {
        event.preventDefault();
        const roleHome = getRoleHome(user?.role || 'ATHLETE');
        window.history.pushState(null, '', roleHome);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Prevent bfcache from showing protected pages after logout
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !isAuthenticated) {
        // Force a hard redirect to clear any cached state
        window.location.href = '/login';
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    // Re-validate session on window focus
    const handleFocus = () => {
      if (!isAuthenticated && !isPublicRoute(location.pathname)) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};
