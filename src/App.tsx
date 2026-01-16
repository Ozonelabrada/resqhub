import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// UI Components
import { Toast, Spinner } from './components/ui';
import type { ToastRef } from './components/ui/Toast/Toast';
import { Toaster } from 'react-hot-toast';

// Public Pages (Lazy Loaded)
const PersonalHubPage = lazy(() => import('./components/pages/public/PersonalHubPage/PersonalHubPage'));
const HubHomePage = lazy(() => import('./components/pages/public/HubHomePage/HubHomePage'));
const NewsFeedPage = lazy(() => import('./components/pages/public/NewsFeedPage/NewsFeedPage'));
const CommunityAboutPage = lazy(() => import('./components/pages/public/CommunityAboutPage/CommunityAboutPage'));
const CommunitiesPage = lazy(() => import('./components/pages/public/CommunitiesPage/CommunitiesPage'));
const CommunityPage = lazy(() => import('./components/pages/public/CommunityPage/CommunityPage'));
const MessagesPage = lazy(() => import('./components/pages/public/MessagesPage/MessagesPage'));
const ItemDetailPage = lazy(() => import('./components/pages/public/ItemDetailPage/ItemDetailPage'));
const CommunityManagementPage = lazy(() => import('./components/pages/admin/CommunityManagementPage'));
const AdminDashboard = lazy(() => import('./components/pages/admin/AdminDashboard'));
const CommunityDetailsPage = lazy(() => import('./components/pages/admin/CommunityDetailsPage'));
const ReportsPage = lazy(() => import('./components/pages/admin/ReportsPage'));
const SubscriptionsPage = lazy(() => import('./components/pages/admin/SubscriptionsPage'));
const AppConfigPage = lazy(() => import('./components/pages/admin/AppConfigPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const SettingsPage = lazy(() => import('./components/pages/public/SettingPage/SettingsPage'));
const WatchlistPage = lazy(() => import('./components/pages/public/WatchlistPage/WatchlistPage'));
const ActivityPage = lazy(() => import('./components/pages/public/ActivityPage/ActivityPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/privacy-policy'));
const TermsOfServicePage = lazy(() => import('./pages/terms-of-service'));
const ContactUsPage = lazy(() => import('./pages/contact-us'));

// Shared Pages
import NotFoundPage from './components/shared/NotFoundPage/NotFoundPage';
import UnderMaintenancePage from './components/shared/UnderMaintenancePage/UnderMaintenancePage';

// Layouts
import PublicLayout from './layouts/PublicLayout';

// Auth Components
import AuthGuard from './components/common/AuthGuard';
import AdminGuard from './components/common/AdminGuard';

import { useFeatureFlags } from './hooks';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <Spinner size="lg" />
  </div>
);

const AppRouter = () => {
  const { isFeatureEnabled } = useFeatureFlags();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 🌐 MAIN LAYOUT ROUTES */}
        <Route path="/" element={<PublicLayout />}>
          {/* Public Home */}
          <Route index element={<HubHomePage />} />
          
          {/* News Feed / Hub */}
          <Route path="hub" element={<NewsFeedPage />} />
          <Route path="reports/:id" element={<NewsFeedPage />} />
          <Route path="about" element={<CommunityAboutPage />} />
          <Route path="newsfeed" element={<Navigate to="/hub" replace />} />
          <Route path="newsfeed/create" element={isFeatureEnabled('reports') ? <Navigate to="/hub?action=create" replace /> : <Navigate to="/hub" replace />} />
          <Route path="feed" element={<Navigate to="/hub" replace />} />
          
          {/* Communities */}
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="community/:id" element={<CommunityPage />} />
          
          {/* Legal and Support */}
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-of-service" element={<TermsOfServicePage />} />
          <Route path="contact-us" element={<ContactUsPage />} />
          
          {/* Items / Details */}
          <Route path="item/:id" element={isFeatureEnabled('reports') ? <ItemDetailPage /> : <Navigate to="/hub" replace />} />
          <Route path="success-stories/:id" element={isFeatureEnabled('reports') ? <ItemDetailPage /> : <Navigate to="/hub" replace />} />
          
          {/* Protected Routes */}
          <Route path="profile" element={<AuthGuard requireAuth={true}><PersonalHubPage /></AuthGuard>} />
          <Route path="watchlist" element={<Navigate to="/profile?tab=watchlist" replace />} />
          <Route path="activity" element={<Navigate to="/profile?tab=activity" replace />} />
          <Route path="settings" element={<AuthGuard requireAuth={true}><SettingsPage /></AuthGuard>} />
          <Route path="messages" element={
            isFeatureEnabled('messages') ? (
              <AuthGuard requireAuth={true}><MessagesPage /></AuthGuard>
            ) : (
              <Navigate to="/hub" replace />
            )
          } />
        </Route>


        {/* Admin Routes */}
        <Route path="/admin" element={
          isFeatureEnabled('admin_panel') ? (
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          ) : (
            <Navigate to="/" replace />
          )
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="communities" element={<CommunityManagementPage />} />
          <Route path="communities/:id" element={<CommunityDetailsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="app-config" element={<AppConfigPage />} />
        </Route>

        {/* Utility Routes */}
        <Route path="/maintenance" element={<UnderMaintenancePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isServerDown, setIsServerDown] = useState(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const toast = useRef<ToastRef>(null);

  // Expose toast to window for global access if needed
  useEffect(() => {
    (window as any).showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
      toast.current?.show({ severity, summary, detail, life: 3000 });
    };
  }, []);

  useEffect(() => {
    const handleServerStatus = (e: any) => {
      setIsServerDown(e.detail.isDown);
    };

    window.addEventListener('server-status-change', handleServerStatus);
    
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
      window.removeEventListener('server-status-change', handleServerStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const bannerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: '14px',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999
  };

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      <Toast ref={toast} />
      
      {/* Server Status Banner */}
      {isServerDown && isOnline && (
        <div style={{ ...bannerStyle, background: '#ef4444', color: 'white' }}>
          ⚠️ The server is currently unreachable. Some actions may be disabled.
        </div>
      )}

      {/* Online/Offline Banner */}
      {!isOnline && (
        <div style={{ ...bannerStyle, background: '#fbbf24', color: '#92400e' }}>
          📡 You're currently offline. Some features may not work properly.
        </div>
      )}
      
      {showOnlineBanner && !isServerDown && (
        <div style={{ ...bannerStyle, backgroundColor: '#10b981', color: 'white' }}>
          ✅ You're back online!
        </div>
      )} 
      
      <div style={{ paddingTop: !isOnline || showOnlineBanner || isServerDown ? '40px' : '0' }}>
        <AppRouter />
      </div>
    </div>
  );
};

export default App;