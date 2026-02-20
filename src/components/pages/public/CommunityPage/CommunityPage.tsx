import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button, Card, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  CommunitySettingsModal,
  CreateReportModal,
  CommunityReportModal,
} from '@/components/modals';
import { cn } from '@/lib/utils';
import { useCommunityDetail } from '@/hooks/useCommunities';
import NewsFeedSidebar from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';
import { useCommunityState } from './hooks/useCommunityState';
import { useCommunityAccess } from './hooks/useCommunityAccess';
import { useCommunityHandlers } from './hooks/useCommunityHandlers';
import CommunityHeader from './components/CommunityHeader';
import TabContentRenderer from './components/TabContentRenderer';
import SidebarStats from './components/SidebarStats';
import FloatingActions from './components/FloatingActions';
import PendingApprovalBanner from './components/PendingApprovalBanner';
import { t } from 'i18next';

const CommunityPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, openLoginModal } = useAuth();

  const activeTab = (searchParams.get('tab') as CommunityTabType) || 'feed';
  const {
    community,
    posts,
    members,
    joinRequests,
    loading,
    error,
    join,
    approveRequest,
    rejectRequest,
    refresh,
  } = useCommunityDetail(id);

  const communityState = useCommunityState();
  const communityAccess = useCommunityAccess(community);
  const handlers = useCommunityHandlers(refresh, community?.id);

  const handleOpenReportModal = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!communityAccess.isFullMember && !communityAccess.isAdmin) {
      return;
    }
    communityState.setIsReportModalOpen(true);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) return openLoginModal();
    await join();
  };

  const handleTabChange = (tab: CommunityTabType) => setSearchParams({ tab });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-rose-500 shadow-xl shadow-rose-100/50">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">
          {t('newsfeed.community_not_found')}
        </h2>
        <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          {error || t('newsfeed.community_not_found_desc')}
        </p>
        <Button
          onClick={() => navigate('/communities')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl px-12 h-16 shadow-xl shadow-teal-100 uppercase tracking-widest text-sm"
        >
          {t('newsfeed.explore_other_communities')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-[calc(100vh-60px)] flex flex-col bg-slate-50 lg:overflow-hidden lg:-mt-10 overflow-x-hidden">
      {/* COMMUNITY HEADER */}
      <CommunityHeader
        community={community}
        isAdmin={communityAccess.isAdmin}
        isMember={communityAccess.isMember}
        memberCount={community.membersCount || 0}
        activeTab={activeTab as CommunityTabType}
        onTabChange={(tab) => handleTabChange(tab)}
        onSettingsClick={() => communityState.setIsSettingsOpen(true)}
        onModerationClick={() => communityState.setIsModerationOpen(true)}
      />

      {/* MAIN LAYOUT */}
      <div className="w-full px-3 md:px-4 lg:px-8 py-3 lg:pt-32 flex-1 lg:h-full lg:overflow-hidden min-h-0 overflow-x-hidden">
        <main className="w-full h-full grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6 lg:overflow-hidden">
          {/* LEFT SIDEBAR - HIDDEN ON MOBILE */}
          <div className="hidden lg:block order-1 lg:col-span-2 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden hover:custom-scrollbar transition-all pt-2 pb-6 min-w-0">
            <NewsFeedSidebar
              className="w-full h-fit"
              isAuthenticated={isAuthenticated}
              user={user}
              openLoginModal={openLoginModal}
              navigate={navigate}
              currentView="communities"
              communityNav={{
                activeTab: activeTab,
                onTabChange: handleTabChange,
                communityName: community.name,
                memberCount: community.membersCount || 0,
                isMember: communityAccess.isMember,
                memberIsApproved: communityAccess.memberIsApproved,
                isAdmin: communityAccess.isAdmin,
                isModerator: communityAccess.isModerator,
              }}
            />
          </div>

          {/* CENTER CONTENT */}
          <div
            className={cn(
              'w-full pb-20 lg:pb-6 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden hover:custom-scrollbar transition-all pt-4 md:pt-3 px-1 scroll-smooth min-w-0 lg:order-2 overflow-x-hidden',
              activeTab === 'feed' ? 'lg:col-span-5' : 'lg:col-span-8'
            )}
          >
            <PendingApprovalBanner show={communityAccess.isPendingMember} />

            <div className="space-y-6">
              <TabContentRenderer
                activeTab={activeTab}
                isFullMember={communityAccess.isFullMember}
                isPendingMember={communityAccess.isPendingMember}
                isPrivileged={communityAccess.isPrivileged}
                isAdmin={communityAccess.isAdmin}
                isModerator={communityAccess.isModerator}
                community={community}
                id={id}
                posts={posts}
                safeMembers={members}
                safeJoinRequests={joinRequests}
                isMember={communityAccess.isMember}
                onJoinClick={handleJoin}
                isNewsModalOpen={communityState.isNewsModalOpen}
                isEventModalOpen={communityState.isEventModalOpen}
                onNewsModalClose={() => communityState.setIsNewsModalOpen(false)}
                onEventModalClose={() => communityState.setIsEventModalOpen(false)}
                onNewsSuccess={async (data) => {
                  // attempt to save via handler which returns nothing, so assume success
                  try {
                    await handlers.handleNewsSuccess(data);
                    // close only on success
                    communityState.setIsNewsModalOpen(false);
                  } catch (err) {
                    console.error('News save error:', err);
                    // rethrow to surface error to modal if desired
                    throw err;
                  }
                }}
                onEventSuccess={async (data) => {
                  // Wait for the backend save to finish (handlers returns the API result)
                  const result = await handlers.handleEventSuccess(data);

                  // Throw to allow the modal caller to surface the error and keep modal open
                  if (!result || result.success === false) {
                    throw new Error(result?.message || 'Failed to create event');
                  }

                  // Let the modal close itself after successful submission (modal's onClose will be invoked by caller)
                  return result;
                }}
                onRefresh={refresh}
                onNewsModalOpen={() => communityState.setIsNewsModalOpen(true)}
                onEventModalOpen={() => communityState.setIsEventModalOpen(true)}
                onApprove={approveRequest}
                onReject={rejectRequest}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          {activeTab === 'feed' && (
            <aside className="hidden lg:flex lg:col-span-3 lg:order-3 flex-col space-y-4 pt-2 pb-6 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden hover:custom-scrollbar transition-all min-w-0">
              <SidebarStats
                community={community}
                safeMembers={members}
                onUpdatesClick={() => handleTabChange('updates')}
                onMembersClick={() => handleTabChange('members')}
              />
            </aside>
          )}
        </main>
      </div>

      {/* FLOATING ACTIONS */}
      <FloatingActions
        communityId={id!}
        communityName={community.name}
        isMember={communityAccess.isMember}
        isAdmin={communityAccess.isAdmin}
        onCreatePost={handleOpenReportModal}
        activeTab={activeTab}
      />

      {/* MODALS */}
      <CommunitySettingsModal
        isOpen={communityState.isSettingsOpen}
        onClose={() => communityState.setIsSettingsOpen(false)}
        community={community as any}
      />

      <CreateReportModal
        isOpen={communityState.isReportModalOpen}
        onClose={() => communityState.setIsReportModalOpen(false)}
        onSuccess={refresh}
        communityId={id}
        initialType={activeTab === 'needs' ? 'Resource' : 'News'}
      />

      <CommunityReportModal
        isOpen={communityState.isCommunityReportModalOpen}
        onClose={() => communityState.setIsCommunityReportModalOpen(false)}
        onSuccess={handlers.handleCommunityReportSuccess}
        communityId={id || ''}
        reportType={communityState.communityReportType}
        isAdmin={communityAccess.isAdmin}
        isModerator={communityAccess.isModerator}
      />
    </div>
  );
};

export default CommunityPage;
