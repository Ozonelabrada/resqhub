import React, { useEffect, useRef } from 'react';
import { Activity, LogOut, HelpCircle, FileText, Heart, Rss, User, Bell, Settings, Search } from 'lucide-react';
import { 
  Button, 
  Spinner, 
  Modal, 
  Card, 
  Container, 
  Grid,
  Toast,
  Menu
} from '../../../ui';
import { useStatistics } from '../../../../hooks/useStatistics';
import { useTrendingReports } from '../../../../hooks/useTrendingReports';
import { useCategories } from '../../../../hooks/useCategories';
import { ReportModal } from '../../../modals';
import { CreateReportModal } from '../../../modals/ReportModal/CreateReportModal';
import {
  HeroSection,
  SearchSection,
  StatsSection,
  SuccessStoriesSection,
  TrendingSection,
  CallToActionSection,
  MobileBottomBar
} from './components';
import {
  useScreenSize,
  useMobileBottomBar,
  useHubAuth,
  useHubActions,
  useHubData
} from './hooks';

const HubHomePage: React.FC = () => {
  const accountMenuRef = useRef<any>(null);
  const toastRef = useRef<any>(null);
  const guestMenuRef = useRef<any>(null);

  // Custom hooks
  const { isBelowDesktop } = useScreenSize();
  const { showBottomBar } = useMobileBottomBar(isBelowDesktop);
  const { isAuthenticated, userData, logout } = useHubAuth();
  const {
    showReportModal,
    setShowReportModal,
    reportType,
    showLogoutConfirm,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
    handleSearch,
    handleReportAction,
    confirmLogout,
    cancelLogout,
    accountMenuItems,
    guestMenuItems
  } = useHubActions(isAuthenticated, logout);

  const { statistics: stats, loading: statsLoading, error: statsError } = useStatistics();
  const {
    trendingReports,
    loading: trendingLoading,
    error: trendingError,
    calculateAndRefresh
  } = useTrendingReports();
  const { categories: fetchedCategories, loading: categoriesLoading } = useCategories();

  const { recentSuccesses } = useHubData(statsError, trendingError, toastRef);

  // Auto-refresh trending data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      calculateAndRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [calculateAndRefresh]);

  // Show loading spinner while fetching data
  if (statsLoading || trendingLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-slate-600 font-bold">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toast ref={toastRef} />

      {/* Modal Components */}
      <CreateReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        initialType={reportType}
      />

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        onHide={cancelLogout}
        title="Confirm Logout"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={cancelLogout}>Cancel</Button>
            <Button variant="danger" onClick={confirmLogout}>Logout</Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-slate-600 font-medium">Are you sure you want to log out of your account?</p>
        </div>
      </Modal>

      {/* Account Menu */}
      <Menu
        model={accountMenuItems}
        popup
        ref={accountMenuRef}
        className="mt-2"
      />

      {/* Guest Menu */}
      <Menu
        model={guestMenuItems}
        popup
        ref={guestMenuRef}
        className="mt-2"
      />

      {/* Page Sections */}
      <HeroSection
        isAuthenticated={isAuthenticated}
        userData={userData}
        isBelowDesktop={isBelowDesktop}
        onShowAccountMenu={(e) => accountMenuRef.current?.toggle(e)}
        onShowGuestMenu={(e) => guestMenuRef.current?.toggle(e)}
        onReportAction={handleReportAction}
      />

      <StatsSection
        stats={stats}
        isBelowDesktop={isBelowDesktop}
      />

      <SuccessStoriesSection
        isBelowDesktop={isBelowDesktop}
        recentSuccesses={recentSuccesses}
      />

      <TrendingSection
        trendingReports={trendingReports.map(report => ({
          ...report,
          categoryId: String(report.categoryId)
        }))}
        trendingLoading={trendingLoading}
        isBelowDesktop={isBelowDesktop}
      />

      <CallToActionSection
        isBelowDesktop={isBelowDesktop}
      />

      <MobileBottomBar
        isBelowDesktop={isBelowDesktop}
        showBottomBar={showBottomBar}
        onReportAction={handleReportAction}
      />

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        onHide={() => setShowReportModal(false)}
        reportType={reportType}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
    </div>
  );
};

export default HubHomePage;

