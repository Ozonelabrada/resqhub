import React from 'react';
import { useScreenSize } from '@/hooks/useScreenSize';
import CommunityHeaderWeb from './CommunityHeader.web';
import CommunityHeaderMobile from './CommunityHeader.mobile';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';

interface CommunityHeaderProps {
  community: any;
  isAdmin: boolean;
  isMember: boolean;
  memberCount?: number;
  activeTab?: CommunityTabType;
  onTabChange?: (tab: CommunityTabType) => void;
  onSettingsClick: () => void;
  onModerationClick: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = (props) => {
  const { isMobile } = useScreenSize();

  if (isMobile) {
    return <CommunityHeaderMobile {...props} />;
  }

  return <CommunityHeaderWeb {...props} />;
};

export default CommunityHeader;
