import React from 'react';
import { CommunityFeed } from './CommunityFeed';
import { CommunityMembers } from './CommunityMembers';
import { CommunityAbout } from './CommunityAbout';
import { CommunityTrade } from './CommunityTrade';
import { CommunityEvents } from './CommunityEvents';
import { CommunityAnnouncements } from './CommunityAnnouncements';
import { CommunityNews } from './CommunityNews';
import { CommunityResources } from './CommunityResources';
import { CreateNewsModal } from '@/components/modals/News/CreateNewsModal';
import { CreateAnnouncementModal } from '@/components/modals/Announcement/CreateAnnouncementModal';
import { CreateEventModal } from '@/components/modals/Event/CreateEventModal';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';
import type { NewsFormData } from '@/components/modals/News/CreateNewsModal';
import type { AnnouncementFormData } from '@/components/modals/Announcement/CreateAnnouncementModal';
import type { EventFormData } from '@/components/modals/Event/CreateEventModal';
import RestrictedContent from './RestrictedContent';

interface TabContentRendererProps {
  activeTab: CommunityTabType;
  activeUpdatesSubTab: 'news' | 'announcements';
  onUpdatesSubTabChange: (tab: 'news' | 'announcements') => void;
  isFullMember: boolean;
  isPendingMember: boolean;
  isPrivileged: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  community: any;
  id?: string;
  posts?: any[];
  safeMembers: any[];
  safeJoinRequests: any[];
  isMember: boolean;
  onJoinClick: () => void;
  isNewsModalOpen: boolean;
  isAnnouncementModalOpen: boolean;
  isEventModalOpen: boolean;
  onNewsModalClose: () => void;
  onAnnouncementModalClose: () => void;
  onEventModalClose: () => void;
  onNewsSuccess: (data: NewsFormData) => void;
  onAnnouncementSuccess: (data: AnnouncementFormData) => void;
  onEventSuccess: (data: EventFormData) => void;
  onRefresh: () => Promise<void>;
  onNewsModalOpen: () => void;
  onAnnouncementModalOpen: () => void;
  onEventModalOpen: () => void;
  onApprove: (requestId: number, userId: string) => Promise<boolean>;
  onReject: (requestId: number, userId: string) => Promise<boolean>;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
  activeUpdatesSubTab,
  onUpdatesSubTabChange,
  isFullMember,
  isPendingMember,
  isPrivileged,
  isAdmin,
  isModerator,
  community,
  id,
  posts,
  safeMembers,
  safeJoinRequests,
  isMember,
  onJoinClick,
  isNewsModalOpen,
  isAnnouncementModalOpen,
  isEventModalOpen,
  onNewsModalClose,
  onAnnouncementModalClose,
  onEventModalClose,
  onNewsSuccess,
  onAnnouncementSuccess,
  onEventSuccess,
  onRefresh,
  onNewsModalOpen,
  onAnnouncementModalOpen,
  onEventModalOpen,
  onApprove,
  onReject,
}) => {
  const handleRestrictedJoin = () => {
    onJoinClick();
  };

  switch (activeTab) {
    case 'feed':
      return (
        <CommunityFeed
          communityId={id!}
          posts={posts || []}
          isMember={isMember}
          isAdmin={isAdmin}
          isModerator={isModerator}
          onRefresh={onRefresh}
        />
      );

    case 'updates':
      return isFullMember || isAdmin ? (
        <>
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => onUpdatesSubTabChange('news')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                activeUpdatesSubTab === 'news'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-slate-500 border-transparent hover:text-teal-600'
              }`}
            >
              News
            </button>
            <button
              onClick={() => onUpdatesSubTabChange('announcements')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                activeUpdatesSubTab === 'announcements'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-slate-500 border-transparent hover:text-teal-600'
              }`}
            >
              Announcements
            </button>
          </div>

          <div className="space-y-6">
            {activeUpdatesSubTab === 'news' && (
              <CommunityNews
                isAdmin={isPrivileged}
                onOpenNewsModal={onNewsModalOpen}
                communityId={community?.id}
              />
            )}
            {activeUpdatesSubTab === 'announcements' && (
              <CommunityAnnouncements
                isAdmin={isPrivileged}
                onOpenAnnouncementModal={onAnnouncementModalOpen}
                communityId={community?.id}
              />
            )}
          </div>

          <CreateNewsModal
            isOpen={isNewsModalOpen}
            onClose={onNewsModalClose}
            onSubmit={onNewsSuccess}
            communityId={String(community?.id)}
          />

          <CreateAnnouncementModal
            isOpen={isAnnouncementModalOpen}
            onClose={onAnnouncementModalClose}
            onSubmit={onAnnouncementSuccess}
            communityId={String(community?.id)}
          />
        </>
      ) : (
        <RestrictedContent
          title="Announcements Locked"
          description="Join the community to view announcements."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'events':
      return isFullMember || isAdmin ? (
        <>
          <CommunityEvents
            isAdmin={isPrivileged}
            onOpenEventModal={onEventModalOpen}
            communityId={community?.id}
          />

          <CreateEventModal
            isOpen={isEventModalOpen}
            onClose={onEventModalClose}
            onSubmit={onEventSuccess}
            communityId={String(community?.id)}
          />
        </>
      ) : (
        <RestrictedContent
          title="Events Locked"
          description="Join the community to view events."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'trade':
      return isFullMember || isPrivileged ? (
        <CommunityTrade />
      ) : (
        <RestrictedContent
          title={isPendingMember ? 'Limited Access During Review' : 'Marketplace Locked'}
          description={
            isPendingMember
              ? 'Trading features are available after your membership is approved.'
              : 'Join the community to access the marketplace.'
          }
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'resources':
      return isFullMember || isAdmin ? (
        <CommunityResources
          isAdmin={isPrivileged}
          onOpenAddResourceModal={() => {}}
          communityId={String(community?.id)}
        />
      ) : (
        <RestrictedContent
          title={isPendingMember ? 'Limited Access During Review' : 'Resources Locked'}
          description={
            isPendingMember
              ? 'Resource features are available after your membership is approved.'
              : 'Join the community to access resources.'
          }
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'members':
      return isFullMember || isPrivileged ? (
        <CommunityMembers
          members={safeMembers}
          joinRequests={safeJoinRequests}
          isAdmin={isAdmin}
          isModerator={isModerator}
          communityId={id}
          onApprove={onApprove}
          onReject={onReject}
          onRefresh={onRefresh}
        />
      ) : (
        <RestrictedContent
          title="Members List Locked"
          description="Join the community to view members."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'about':
      return <CommunityAbout community={community} />;

    default:
      return null;
  }
};

export default TabContentRenderer;
