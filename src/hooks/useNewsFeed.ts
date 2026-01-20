import { useState, useEffect, useCallback } from 'react';
import { NewsFeedItem } from '@/types/personalHub';
import { ReportsService } from '../services/reportsService';
import { useAuth } from '../context/AuthContext';

interface UseNewsFeedReturn {
  items: NewsFeedItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export const useNewsFeed = (options?: { 
  reportType?: string; 
  search?: string;
  status?: number;
}): UseNewsFeedReturn => {
  const [items, setItems] = useState<NewsFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoading: authLoading } = useAuth();

  const fetchNewsFeed = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const pageSize = 10;
      const reports = await ReportsService.getReports({
        reportType: options?.reportType,
        search: options?.search,
        page: page,
        pageSize: pageSize,
        status: options?.status !== undefined ? options.status : 'active' // Default to active string
      });

      const mappedItems: NewsFeedItem[] = reports.map(report => {
        const type = (report.reportType?.toLowerCase() as any) || 'lost';
        const contactName = report.user?.fullName || 'Anonymous';
        const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com';

        // Helper to format image URLs
        const formatImageUrl = (url: string) => {
          if (!url) return '';
          if (url.startsWith('http')) return url;
          const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          const cleanUrl = url.startsWith('/') ? url : `/${url}`;
          return `${cleanBase}${cleanUrl}`;
        };

        const itemImages = (report.images || [])
          .slice(0, 5)
          .map(img => formatImageUrl(img.imageUrl))
          .filter(Boolean);

        // Determine effective status string
        let effectiveStatus = type;
        if (String(report.status).toLowerCase() === 'reunited') {
          effectiveStatus = 'reunited';
        }

        return {
          id: String(report.id),
          title: report.title || `${report.reportType} Item`,
          category: report.categoryName || 'Discussion',
          location: report.location || 'Location not specified',
          currentLocation: '',
          date: report.dateCreated || new Date().toISOString(),
          time: '',
          status: effectiveStatus,
          views: 0,
          type: type,
          description: report.description || '',
          circumstances: '',
          identifyingFeatures: '',
          condition: 'good',
          handoverPreference: 'meet',
          contactInfo: {
            name: contactName,
            phone: report.contactInfo || '',
            email: '',
            preferredContact: 'phone'
          },
          reward: {
            amount: parseFloat(String(report.rewardDetails || '0').replace(/[^0-9.]/g, '') || '0'),
            description: report.rewardDetails || ''
          },
          images: itemImages,
          storageLocation: '',
          createdAt: report.dateCreated || new Date().toISOString(),
          updatedAt: report.dateCreated || new Date().toISOString(),
          expiresAt: report.expiresAt || '',
          reportTypeDescription: report.reportType || 'Report',
          verificationStatus: 'pending',
          potentialMatches: 0,
          user: {
            id: report.userId || 'unknown',
            fullName: report.user?.fullName || contactName,
            username: report.user?.username || String(contactName).toLowerCase().replace(/\s/g, ''),
            profilePicture: report.user?.profilePictureUrl || '',
            isVerified: false
          },
          reactionsCount: report.reactionsCount || 0,
          isReacted: report.isReacted || false,
          commentsCount: report.commentsCount || 0,
          communityName: report.communityName || '',
          timeAgo: getTimeAgo(report.dateCreated || new Date().toISOString())
        };
      });

      if (isLoadMore) {
        setItems(prev => [...prev, ...mappedItems]);
      } else {
        setItems(mappedItems);
      }

      setHasMore(mappedItems.length === pageSize);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching newsfeed:', error);
      setError('Failed to load news feed');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, options?.reportType, options?.search]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchNewsFeed(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, fetchNewsFeed]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    fetchNewsFeed(1, false);
  }, [fetchNewsFeed]);

  // Refetch when options change
  useEffect(() => {
    if (!authLoading) {
      fetchNewsFeed(1, false);
    }
  }, [authLoading, options?.reportType, options?.search]);

  return {
    items,
    loading: loading || authLoading,
    error,
    hasMore,
    loadMore,
    refetch
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