import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle admin requirements
  if (requireAdmin && (!user || user.role?.toLowerCase() !== 'admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Handle redirect for authenticated users trying to access login/signup pages
  const authPages = ['/login', '/signin', '/signup', '/admin/login'];
  if (!requireAuth && isAuthenticated && authPages.includes(location.pathname)) {
    const from = location.state?.from?.pathname || (user?.role?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/hub');
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;