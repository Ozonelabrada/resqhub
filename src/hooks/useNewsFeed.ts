import { useState, useEffect, useCallback } from 'react';
import type { NewsFeedItem } from '../components/personalHub/NewsFeed';
import { ItemsService } from '../services';

interface UseNewsFeedReturn {
  items: NewsFeedItem[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export const useNewsFeed = (): UseNewsFeedReturn => {
  const [items, setItems] = useState<NewsFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNewsFeed = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      // Fetch all reports (lost items) for the newsfeed
      const response = await ItemsService.getReportsSearch(page, {
        reportType: 1, // 1 for lost items
        pageSize: 10
      });

      let newItems: NewsFeedItem[] = [];

      if (response && response.data) {
        // Handle different response structures
        const reportsData = response.data.data || response.data || [];

        newItems = reportsData.map((report: any) => ({
          id: report.id || report.reportId,
          title: report.title || report.itemName || 'Untitled Report',
          category: report.category || report.itemCategory || 'Other',
          location: report.incidentLocation || report.location || 'Unknown Location',
          currentLocation: report.currentLocation || '',
          date: report.incidentDate !== '0001-01-01T00:00:00' ? report.incidentDate : report.createdAt || new Date().toISOString(),
          time: report.incidentTime || '',
          status: report.statusDescription?.toLowerCase() || 'active',
          views: report.viewsCount || report.views || 0,
          type: 'lost' as const,
          description: report.description || '',
          circumstances: report.circumstances || '',
          identifyingFeatures: report.identifyingFeatures || '',
          condition: getConditionLabel(report.condition || 2),
          handoverPreference: getHandoverLabel(report.handoverPreference || 1),
          contactInfo: {
            name: report.contactName || 'Unknown',
            phone: report.contactPhone || '',
            email: report.contactEmail || '',
            preferredContact: getContactMethodLabel(report.preferredContactMethod || 1)
          },
          reward: {
            amount: report.rewardAmount || 0,
            description: report.rewardDescription || ''
          },
          images: report.imageUrls || [],
          storageLocation: report.storageLocation || '',
          createdAt: report.createdAt || new Date().toISOString(),
          updatedAt: report.dateModified || report.updatedAt || new Date().toISOString(),
          expiresAt: report.expiresAt,
          reportTypeDescription: report.reportTypeDescription,
          verificationStatus: report.verificationStatusDescription,
          potentialMatches: report.potentialMatchesCount || 0,
          user: {
            id: report.userId || report.user?.id || '',
            fullName: report.user?.fullName || report.contactName || 'Anonymous',
            username: report.user?.username || '',
            profilePicture: report.user?.profilePicture
          },
          timeAgo: getTimeAgo(report.createdAt || new Date().toISOString())
        }));
      }

      if (isLoadMore) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      // Check if there are more items
      setHasMore(newItems.length === 10); // Assuming pageSize is 10
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching newsfeed:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchNewsFeed(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, fetchNewsFeed]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchNewsFeed(1, false);
  }, [fetchNewsFeed]);

  // Initial load
  useEffect(() => {
    fetchNewsFeed(1, false);
  }, []);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    refresh
  };
};

// Helper functions
const getConditionLabel = (condition: number): string => {
  const conditionMap: { [key: number]: string } = {
    1: 'excellent',
    2: 'good',
    3: 'fair',
    4: 'damaged'
  };
  return conditionMap[condition] || 'good';
};

const getHandoverLabel = (handover: number): string => {
  const handoverMap: { [key: number]: string } = {
    1: 'meet',
    2: 'pickup',
    3: 'mail'
  };
  return handoverMap[handover] || 'meet';
};

const getContactMethodLabel = (method: number): string => {
  const methodMap: { [key: number]: string } = {
    1: 'phone',
    2: 'email',
    3: 'both'
  };
  return methodMap[method] || 'phone';
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};