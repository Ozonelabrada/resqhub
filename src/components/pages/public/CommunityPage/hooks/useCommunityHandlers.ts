import type { NewsFormData } from '@/components/modals/News/CreateNewsModal';
import type { EventFormData } from '@/components/modals/Event/CreateEventModal';
import { CommunityService } from '@/services/communityService';
import { useAuth } from '@/context/AuthContext';

export const useCommunityHandlers = (refresh: () => void, communityId?: string | number) => {
  const { user } = useAuth();

  const handleNewsSuccess = async (data: NewsFormData) => {
    console.log('News created:', data);
    try {
      // make a copy and strip any accidental HTML tags just in case
      const payload = {
        communityId: communityId || '',
        newsArticles: data.newsArticles.map((article) => ({
          ...article,
          author: article.author || user?.fullName || user?.username || 'Unknown',
          content: article.content.replace(/<[^>]*>/g, ''),
          summary: article.content.replace(/<[^>]*>/g, ''),
        })),

        sendNotifications: data.sendNotifications,
        notificationMessage: data.notificationMessage,
      };
      const result = await CommunityService.createCommunityNews(payload);
      if (result.success) {
        refresh();
      } else {
        console.error('Failed to create news:', result.message);
      }
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const handleEventSuccess = async (data: EventFormData) => {
    console.log('Event created:', data);
    try {
      const payload = {
        communityId: communityId || '',
        events: data.events.map((event) => ({
          ...event,
        })),
        sendNotifications: data.sendNotifications,
        notificationMessage: data.notificationMessage,
      };

      const result = await CommunityService.createCommunityEvents(payload);

      if (result.success) {
        // Refresh local data after successful creation
        await refresh();
      } else {
        console.error('Failed to create event:', result.message);
      }

      // Return the service result so callers can react accordingly
      return result;
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, message: (error as any)?.message || 'Failed to create event' };
    }
  };

  const handleCommunityReportSuccess = () => {
    console.log('Community report created');
    refresh();
  };

  const handleOpenCommunityReportModal = (
    type: 'News',
    setCommunityReportType: (type: 'News') => void,
    setIsCommunityReportModalOpen: (open: boolean) => void
  ) => {
    setCommunityReportType(type);
    setIsCommunityReportModalOpen(true);
  };

  return {
    handleNewsSuccess,
    handleEventSuccess,
    handleCommunityReportSuccess,
    handleOpenCommunityReportModal,
  };
};
