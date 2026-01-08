import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// UI Components
import { Toast, Spinner } from './components/ui';
import type { ToastRef } from './components/ui/Toast/Toast';

// Public Pages (Lazy Loaded)
const PersonalHubPage = lazy(() => import('./components/pages/public/PersonalHubPage/PersonalHubPage'));
const HubHomePage = lazy(() => import('./components/pages/public/HubHomePage/HubHomePage'));
const NewsFeedPage = lazy(() => import('./components/pages/public/NewsFeedPage/NewsFeedPage'));
const CommunitiesPage = lazy(() => import('./components/pages/public/CommunitiesPage/CommunitiesPage'));
const CommunityPage = lazy(() => import('./components/pages/public/CommunityPage/CommunityPage'));
const MessagesPage = lazy(() => import('./components/pages/public/MessagesPage/MessagesPage'));
const ItemDetailPage = lazy(() => import('./components/pages/public/ItemDetailPage/ItemDetailPage'));
const CommunityManagementPage = lazy(() => import('./components/pages/admin/CommunityManagementPage'));

// Shared Pages
import NotFoundPage from './components/shared/NotFoundPage/NotFoundPage';
import UnderMaintenancePage from './components/shared/UnderMaintenancePage/UnderMaintenancePage';

// Layouts
import PublicLayout from './layouts/PublicLayout';

// Auth Components
import AuthGuard from './components/common/AuthGuard';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <Spinner size="lg" />
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 🌐 MAIN LAYOUT ROUTES */}
        <Route path="/" element={<PublicLayout />}>
          {/* Public Home */}
          <Route index element={<HubHomePage />} />
          
          {/* News Feed / Hub */}
          <Route path="hub" element={<NewsFeedPage />} />
          <Route path="newsfeed" element={<Navigate to="/hub" replace />} />
          <Route path="newsfeed/create" element={<Navigate to="/hub?action=create" replace />} />
          <Route path="feed" element={<Navigate to="/hub" replace />} />
          
          {/* Communities */}
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="community/:id" element={<CommunityPage />} />
          
          {/* Items / Details */}
          <Route path="item/:id" element={<ItemDetailPage />} />
          <Route path="success-stories/:id" element={<ItemDetailPage />} />
          
          {/* Protected Routes */}
          <Route path="profile" element={<AuthGuard requireAuth={true}><PersonalHubPage /></AuthGuard>} />
          <Route path="messages" element={<AuthGuard requireAuth={true}><MessagesPage /></AuthGuard>} />
        </Route>


        {/* Admin Routes */}
        <Route path="/admin" element={
          <AuthGuard requireAuth={true}>
            <PublicLayout />
          </AuthGuard>
        }>
          <Route path="communities" element={<CommunityManagementPage />} />
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
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const toast = useRef<ToastRef>(null);

  // Expose toast to window for global access if needed
  useEffect(() => {
    (window as any).showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
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