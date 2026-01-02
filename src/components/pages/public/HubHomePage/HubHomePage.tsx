import React, { useEffect, useRef } from 'react';
import { Menu } from 'primereact/menu';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useStatistics } from '../../../../hooks/useStatistics';
import { useTrendingReports } from '../../../../hooks/useTrendingReports';
import { useCategories } from '../../../../hooks/useCategories';
import { ReportModal } from '../../../modals';
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
  const accountMenuRef = useRef<Menu>(null);
  const toast = useRef<Toast>(null);
  const guestMenuRef = useRef<Menu>(null);

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

  const { recentSuccesses } = useHubData(statsError, trendingError, toast);

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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          <p className="mt-3 text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#495560ff' }}>
      <Toast ref={toast} />

      {/* Logout Confirmation Dialog */}
      <Dialog
        header="Confirm Logout"
        visible={showLogoutConfirm}
        onHide={cancelLogout}
        style={{ width: '350px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={cancelLogout} />
            <Button label="Logout" icon="pi pi-sign-out" className="p-button-danger" onClick={confirmLogout} />
          </div>
        }
        modal
      >
        <div>Are you sure you want to log out?</div>
      </Dialog>

      {/* Account Menu */}
      <Menu
        model={accountMenuItems}
        popup
        ref={accountMenuRef}
        className="mt-2"
        style={{ minWidth: '220px' }}
      />

      {/* Guest Menu */}
      <Menu
        model={guestMenuItems}
        popup
        ref={guestMenuRef}
        className="mt-2"
        style={{ minWidth: '160px' }}
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

      <SearchSection
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={fetchedCategories}
        categoriesLoading={categoriesLoading}
        isBelowDesktop={isBelowDesktop}
        stats={stats}
        onSearchTermChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onSearch={handleSearch}
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