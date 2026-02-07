import type { NewsFormData } from '@/components/modals/News/CreateNewsModal';
import type { AnnouncementFormData } from '@/components/modals/Announcement/CreateAnnouncementModal';
import type { EventFormData } from '@/components/modals/Event/CreateEventModal';

export const useCommunityHandlers = (refresh: () => void) => {
  const handleNewsSuccess = (data: NewsFormData) => {
    console.log('News created:', data);
    refresh();
  };

  const handleAnnouncementSuccess = (data: AnnouncementFormData) => {
    console.log('Announcement created:', data);
    refresh();
  };

  const handleEventSuccess = (data: EventFormData) => {
    console.log('Event created:', data);
    refresh();
  };

  const handleCommunityReportSuccess = () => {
    console.log('Community report created');
    refresh();
  };

  const handleOpenCommunityReportModal = (
    type: 'News' | 'Announcement',
    setCommunityReportType: (type: 'News' | 'Announcement') => void,
    setIsCommunityReportModalOpen: (open: boolean) => void
  ) => {
    setCommunityReportType(type);
    setIsCommunityReportModalOpen(true);
  };

  return {
    handleNewsSuccess,
    handleAnnouncementSuccess,
    handleEventSuccess,
    handleCommunityReportSuccess,
    handleOpenCommunityReportModal,
  };
};
