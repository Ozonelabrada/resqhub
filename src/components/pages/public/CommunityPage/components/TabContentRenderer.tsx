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
  onApprove: (userId: string) => Promise<boolean>;
  onReject: (userId: string) => Promise<boolean>;
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

  // Check if user is admin/moderator and community is not approved
  const isAdminWithPendingCommunity = (isAdmin || isModerator) && community?.status && ['pending', 'suspended', 'denied', 'disabled'].includes(community.status.toLowerCase());

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
          communityStatus={community?.status}
        />
      );

    case 'updates':
      const isNewsAccessible = (isFullMember || isPendingMember || isAdmin) && (community?.status && !['pending', 'suspended', 'denied', 'disabled'].includes(community.status.toLowerCase()));
      return isNewsAccessible ? (
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
      ) : isAdminWithPendingCommunity ? (
        <RestrictedContent
          title="News Locked"
          description="This community is awaiting approval. News will be available once the community is approved."
        />
      ) : (
        <RestrictedContent
          title="News Locked"
          description="Join the community to view news."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'events':
      const isEventsAccessible = (isFullMember || isPendingMember || isAdmin) && (community?.status && !['pending', 'suspended', 'denied', 'disabled'].includes(community.status.toLowerCase()));
      return isEventsAccessible ? (
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
      ) : isAdminWithPendingCommunity ? (
        <RestrictedContent
          title="Events Locked"
          description="This community is awaiting approval. Events will be available once the community is approved."
        />
      ) : (
        <RestrictedContent
          title="Events Locked"
          description="Join the community to view events."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'trade':
      return (isFullMember || isPendingMember || isPrivileged) ? (
        <CommunityTrade />
      ) : (
        <RestrictedContent
          title="Marketplace Locked"
          description="Join the community to access the marketplace."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'resources':
      const isResourcesAccessible = (isFullMember || isPendingMember || isAdmin) && (community?.status && !['pending', 'suspended', 'denied', 'disabled'].includes(community.status.toLowerCase()));
      return isResourcesAccessible ? (
        <CommunityResources
          isAdmin={isPrivileged}
          onOpenAddResourceModal={() => {}}
          communityId={String(community?.id)}
        />
      ) : isAdminWithPendingCommunity ? (
        <RestrictedContent
          title="Resources Locked"
          description="This community is awaiting approval. Resources will be available once the community is approved."
        />
      ) : (
        <RestrictedContent
          title="Resources Locked"
          description="Join the community to access resources."
          onJoinClick={handleRestrictedJoin}
        />
      );

    case 'members':
      const isMembersAccessible = (isFullMember || isPendingMember || isPrivileged) && (community?.status && !['pending', 'suspended', 'denied', 'disabled'].includes(community.status.toLowerCase()));
      return isMembersAccessible ? (
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
      ) : isAdminWithPendingCommunity ? (
        <RestrictedContent
          title="Members List Locked"
          description="This community is awaiting approval. Members list will be available once the community is approved."
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
