import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Spinner, 
  Toast,
  Menu
} from '../../../ui';
import { useStatistics } from '../../../../hooks/useStatistics';
import { useTrendingReports } from '../../../../hooks/useTrendingReports';
import { ReportModal } from '../../../modals';
import {
  HeroSection,
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
import { useAuth } from '../../../../context/AuthContext';

const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const accountMenuRef = useRef<any>(null);
  const toastRef = useRef<any>(null);

  // Custom hooks
  const { isBelowDesktop } = useScreenSize();
  const { showBottomBar } = useMobileBottomBar(isBelowDesktop);
  const { isAuthenticated, userData, logout } = useHubAuth();
  const { openLoginModal } = useAuth();
  const {
    showReportModal,
    setShowReportModal,
    reportType,
    handleReportAction,
    handleGetStartedAction,
    handleSearchAction,
    accountMenuItems
  } = useHubActions(isAuthenticated, logout);

  const { statistics: stats, loading: statsLoading, error: statsError } = useStatistics();
  const {
    trendingReports,
    loading: trendingLoading,
    error: trendingError,
    calculateAndRefresh
  } = useTrendingReports();

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
          <p className="mt-4 text-slate-600 font-bold">{t('home.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toast ref={toastRef} />

      {/* Account Menu */}
      <Menu
        model={accountMenuItems}
        popup
        ref={accountMenuRef}
        className="mt-2"
      />

      {/* Page Sections */}
      <HeroSection
        isAuthenticated={isAuthenticated}
        userData={userData}
        isBelowDesktop={isBelowDesktop}
        onShowAccountMenu={(e) => accountMenuRef.current?.toggle(e)}
        onShowGuestMenu={() => openLoginModal()}
        onReportAction={handleReportAction}
        onGetStartedAction={handleGetStartedAction}
        onSearchAction={handleSearchAction}
      />

      <StatsSection
        stats={stats}
      />

      <SuccessStoriesSection
        recentSuccesses={recentSuccesses}
      />

      <TrendingSection
        trendingReports={trendingReports.map(report => ({
          ...report,
          categoryId: String(report.categoryId)
        }))}
        trendingLoading={trendingLoading}
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

