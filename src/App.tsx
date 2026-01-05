import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Public Pages (Lazy Loaded)
const HubHomePage = lazy(() => import('./components/pages/public/HubHomePage/HubHomePage'));
const SearchItemsPage = lazy(() => import('./components/pages/public/SearchItemPage/SearchItemsPage'));
const SignUpPage = lazy(() => import('./components/pages/public/SignUpPage/SignUpPage'));
const PersonalHubPage = lazy(() => import('./components/pages/public/PersonalHubPage/PersonalHubPage'));
const ProfilePage = lazy(() => import('./components/pages/public/PersonalHubPage/ProfilePage'));
const NewsFeedPage = lazy(() => import('./components/pages/public/PersonalHubPage/NewsFeedPage/NewsFeedPage'));

// Shared Pages
import NotFoundPage from './components/shared/NotFoundPage/NotFoundPage';
import UnderMaintenancePage from './components/shared/UnderMaintenancePage/UnderMaintenancePage';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import LoginPage from './components/shared/LoginPage/LoginPage';

// Auth Components
import AuthGuard from './components/common/AuthGuard';

import { AuthService } from './services/authService';
import { authManager } from './utils/sessionManager';
import { useAuth } from './context/AuthContext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingFallback = () => (
  <div className="flex align-items-center justify-content-center min-h-screen">
    <ProgressSpinner />
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
        </Route>

        {/* 🔐 PROTECTED USER ROUTES - Authentication required */}
        <Route path="/" element={
          <AuthGuard requireAuth={true}>
            <PublicLayout />
          </AuthGuard>
        }>
          <Route path="hub" element={<PersonalHubPage />} />
          <Route path="feed" element={<NewsFeedPage />} />
          <Route path="profile" element={<ProfilePage />} />
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
    </Suspense>
  );
};

const App = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const toast = useRef<Toast>(null);

  // Expose toast to window for global access if needed
  useEffect(() => {
    (window as any).showToast = (severity: string, summary: string, detail: string) => {
      toast.current?.show({ severity, summary, detail, life: 3000 });
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineBanner(true);
      setTimeout(() => setShowOnlineBanner(false), 3000);
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
      <Toast ref={toast} />
      
      {/* Online/Offline Banner */}
      {!isOnline && (
        <div 
          style={{
            background: '#fbbf24',
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