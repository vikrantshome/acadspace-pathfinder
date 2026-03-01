import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    const isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');
    if (!isAdmin) {
      // Redirect non-admins trying to access admin pages
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
