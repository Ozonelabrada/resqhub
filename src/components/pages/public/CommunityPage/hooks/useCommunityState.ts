import { useState } from 'react';

export const useCommunityState = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCommunityReportModalOpen, setIsCommunityReportModalOpen] = useState(false);
  const [communityReportType, setCommunityReportType] = useState<'News'>('News');
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
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
    isEventModalOpen,
    setIsEventModalOpen,
    isModerationOpen,
    setIsModerationOpen,
    isChatOpen,
    setIsChatOpen,
    isAddResourceModalOpen,
    setIsAddResourceModalOpen,
  };
};
