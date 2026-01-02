import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Public Pages
import HubHomePage from './components/pages/public/HubHomePage/HubHomePage';
import SearchItemsPage from './components/pages/public/SearchItemPage/SearchItemsPage';
import SignUpPage from './components/pages/public/SignUpPage/SignUpPage';
import PersonalHubPage from './components/pages/public/PersonalHubPage/PersonalHubPage';
import NewsFeedPage from './components/pages/public/PersonalHubPage/NewsFeedPage/NewsFeedPage';

// Admin Pages
import AdminLoginPage from './components/shared/LoginPage/LoginPage';

// Shared Pages
import NotFoundPage from './components/shared/NotFoundPage/NotFoundPage';
import UnderMaintenancePage from './components/shared/UnderMaintenancePage/UnderMaintenancePage';
import AuthCallbackPage from './components/pages/Auth/AuthCallbackPage';
import OAuth2RegisterPage from './components/pages/Auth/OAuth2RegisterPage';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './components/shared/LoginPage/LoginPage';
import DashboardPage from './components/pages/admin/DashboardPage/DashboardPage';

// Auth Components
import AuthGuard from './components/common/AuthGuard';

import { AuthService } from './services/authService';

const AppRouter = () => {
  return (
    <Routes>
      {/* 🌐 PUBLIC ROUTES - No authentication required */}
      <Route path="/" element={
        <AuthGuard requireAuth={false}>
          <PublicLayout />
        </AuthGuard>
      }>
        <Route index element={<HubHomePage />} />
        <Route path="search" element={<SearchItemsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signin" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />

        {/* OAuth2 Routes - Handle frontend callback */}
        <Route path="signin-google" element={<AuthCallbackPage />} />
        <Route path="auth/signin-google" element={<AuthCallbackPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="auth/register" element={<OAuth2RegisterPage />} />
      </Route>

      {/* 🔐 PROTECTED USER ROUTES - Authentication required */}
      <Route path="/" element={
        <AuthGuard requireAuth={true}>
          <PublicLayout />
        </AuthGuard>
      }>
        <Route path="hub" element={<PersonalHubPage />} />
        <Route path="feed" element={<NewsFeedPage />} />
        <Route path="profile" element={<PersonalHubPage />} />
      </Route>

      {/* 🔐 ADMIN LOGIN - Standalone without layout */}
      <Route path="/admin/login" element={
        <AuthGuard requireAuth={false}>
          <AdminLoginPage />
        </AuthGuard>
      } />

      {/* 🔐 ADMIN ROUTES - Authentication + Admin role required */}
      <Route path="/admin" element={
        <AuthGuard requireAuth={true} requireAdmin={true}>
          <AdminLayout />
        </AuthGuard>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      {/* 🚧 UTILITY ROUTES */}
      <Route path="/maintenance" element={
        <AuthGuard requireAuth={false}>
          <UnderMaintenancePage />
        </AuthGuard>
      } />
      <Route path="*" element={
        <AuthGuard requireAuth={false}>
          <NotFoundPage />
        </AuthGuard>
      } />
    </Routes>
  );
};

const App = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineBanner(true);
      setTimeout(() => setShowOnlineBanner(false), 3000); // Show for 3 seconds
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      if (authManager.isAuthenticated()) {
        try {
          await AuthService.getCurrentUser();
        } catch (error: any) {
          if (error?.response?.status === 401) {
            authManager.logout();
            navigate('/signin', { replace: true });
          }
        }
      }
    };
    checkToken();
  }, [navigate]);

  return (
    <div className="App">
      {/* Online/Offline Banner */}
      {!isOnline && (
        <div 
          style={{
            backgroundColor: '#fbbf24',
            color: '#92400e',
            textAlign: 'center',
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: '14px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999
          }}
        >
          📡 You're currently offline. Some features may not work properly.
        </div>
      )}
      
      {showOnlineBanner && (
        <div 
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            textAlign: 'center',
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: '14px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999
          }}
        >
          ✅ You're back online!
        </div>
      )} 
      
      <div style={{ paddingTop: !isOnline || showOnlineBanner ? '40px' : '0' }}>
        <AppRouter />
      </div>
    </div>
  );
};

export default App;