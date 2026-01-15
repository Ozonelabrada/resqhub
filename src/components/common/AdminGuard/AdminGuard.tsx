import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  redirectTo = '/'
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">
            Access Denied
          </h1>
          <p className="text-slate-600 mb-6">
            You don't have administrator privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;