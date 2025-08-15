import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import HubHomePage from './components/pages/public/HubHomePage/HubHomePage';
import SearchItemsPage from './components/pages/public/SearchItemPage/SearchItemsPage';
import SignUpPage from './components/pages/public/SignUpPage/SignUpPage';
import PersonalHubPage from './components/pages/public/PersonalHubPage/PersonalHubPage';

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
import ReportPage from './components/pages/ReportsPage/ReportPage';
import ProfilePage from './components/pages/ProfilePage/ProfilePage';
import LoginPage from './components/shared/LoginPage/LoginPage';
import DashboardPage from './components/pages/admin/DashboardPage/DashboardPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* 🌐 PUBLIC ROUTES - No authentication required */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HubHomePage />} />
        <Route path="search" element={<SearchItemsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/lost" element={<ReportPage />} />
        <Route path="/found" element={<ReportPage />} />
        <Route path="/hub" element={<PersonalHubPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* OAuth2 Routes - Handle frontend callback */}
        <Route path="/signin-google" element={<AuthCallbackPage />} />
        <Route path="/auth/signin-google" element={<AuthCallbackPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/register" element={<OAuth2RegisterPage />} />
      </Route>

      {/* 🔐 ADMIN LOGIN - Standalone without layout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
      {/* 🔐 ADMIN ROUTES - Authentication required with layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      {/* 🚧 UTILITY ROUTES */}
      <Route path="/maintenance" element={<UnderMaintenancePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

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