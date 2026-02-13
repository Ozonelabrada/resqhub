import React from 'react';
import { CommunityFeed } from './CommunityFeed';
import { CommunityMembers } from './CommunityMembers';
import { CommunityAbout } from './CommunityAbout';
import { CommunityTrade } from './CommunityTrade';
import { CommunityEvents } from './CommunityEvents';
import { CommunityNews } from './CommunityNews';
import { CommunityResources } from './CommunityResources';
import { CreateNewsModal } from '@/components/modals/News/CreateNewsModal';
import { CreateEventModal } from '@/components/modals/Event/CreateEventModal';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';
import type { NewsFormData } from '@/components/modals/News/CreateNewsModal';
import type { EventFormData } from '@/components/modals/Event/CreateEventModal';
import RestrictedContent from './RestrictedContent';

interface TabContentRendererProps {
  activeTab: CommunityTabType;
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
  isEventModalOpen: boolean;
  onNewsModalClose: () => void;
  onEventModalClose: () => void;
  onNewsSuccess: (data: NewsFormData) => void;
  onEventSuccess: (data: EventFormData) => void;
  onRefresh: () => Promise<void>;
  onNewsModalOpen: () => void;
  onEventModalOpen: () => void;
  onApprove: (requestId: number, userId: string) => Promise<boolean>;
  onReject: (requestId: number, userId: string) => Promise<boolean>;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
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
  isEventModalOpen,
  onNewsModalClose,
  onEventModalClose,
  onNewsSuccess,
  onEventSuccess,
  onRefresh,
  onNewsModalOpen,
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
          <CommunityNews
            isAdmin={isPrivileged}
            onOpenNewsModal={onNewsModalOpen}
            communityId={community?.id}
          />

          <CreateNewsModal
            isOpen={isNewsModalOpen}
            onClose={onNewsModalClose}
            onSubmit={onNewsSuccess}
            communityId={String(community?.id)}
          />
        </>
      ) : (
        <RestrictedContent
          title="News Locked"
          description="Join the community to view news."
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
