import { useState, useEffect, useCallback } from 'react';
import type { NewsFeedItem } from '../components/pages/public/PersonalHubPage/personalHub/NewsFeed';
import { ItemsService } from '../services';
import { mockNewsFeedItems } from '../mocks';

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return mock data instead of API call
      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newItems = mockNewsFeedItems.slice(startIndex, endIndex);

      if (isLoadMore) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      // Check if there are more items
      setHasMore(endIndex < mockNewsFeedItems.length);
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