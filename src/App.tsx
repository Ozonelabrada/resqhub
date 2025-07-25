import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import HubHomePage from './components/pages/public/HubHomePage/HubHomePage';
import SearchItemsPage from './components/pages/public/SearchItemPage/SearchItemsPage';
// Note: ReportItemPage needs to be created in the components structure
// import ReportItemPage from './components/pages/public/ReportItemPage/ReportItemPage';

// Admin Pages
import AdminLoginPage from './components/pages/shared/LoginPage/LoginPage';
import DashboardPage from './components/pages/admin/DashboardPage/DashboardPage';

// Shared Pages
import NotFoundPage from './components/pages/shared/NotFoundPage/NotFoundPage';
import UnderMaintenancePage from './components/pages/shared/UnderMaintenancePage/UnderMaintenancePage';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 🌐 PUBLIC ROUTES - No authentication required */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HubHomePage />} />
          <Route path="search" element={<SearchItemsPage />} />
          {/* <Route path="report" element={<ReportItemPage />} /> */}
          {/* <Route path="item/:id" element={<ItemDetailsPage />} /> */}
          {/* <Route path="how-it-works" element={<HowItWorksPage />} /> */}
          {/* <Route path="privacy" element={<PrivacyPage />} /> */}
          {/* <Route path="terms" element={<TermsPage />} /> */}
          {/* <Route path="contact" element={<ContactPage />} /> */}
        </Route>
        
        {/* 🔐 ADMIN ROUTES - Authentication required */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {/* <Route path="items" element={<ManageItemsPage />} /> */}
          {/* <Route path="analytics" element={<AnalyticsPage />} /> */}
          {/* <Route path="users" element={<ManageUsersPage />} /> */}
        </Route>
        
        {/* 🛠️ MAINTENANCE MODE */}
        <Route path="/maintenance" element={<UnderMaintenancePage />} />
        
        {/* 🚫 404 NOT FOUND */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;