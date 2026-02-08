import { useState } from 'react';

export const useCommunityState = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCommunityReportModalOpen, setIsCommunityReportModalOpen] = useState(false);
  const [communityReportType, setCommunityReportType] = useState<'News' | 'Announcement'>('News');
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [activeUpdatesSubTab, setActiveUpdatesSubTab] = useState<'news' | 'announcements'>('news');
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    isCommunityReportModalOpen,
    setIsCommunityReportModalOpen,
    communityReportType,
    setCommunityReportType,
    isNewsModalOpen,
    setIsNewsModalOpen,
    isAnnouncementModalOpen,
    setIsAnnouncementModalOpen,
    isEventModalOpen,
    setIsEventModalOpen,
    activeUpdatesSubTab,
    setActiveUpdatesSubTab,
    isModerationOpen,
    setIsModerationOpen,
    isChatOpen,
    setIsChatOpen,
    isAddResourceModalOpen,
    setIsAddResourceModalOpen,
  };
};
