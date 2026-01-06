import { useState, useEffect, useCallback } from 'react';
import type { NewsFeedItem } from '../components/pages/public/PersonalHubPage/personalHub/NewsFeed';
import { ReportsService } from '../services/reportsService';
import { useAuth } from '../context/AuthContext';
import { mockNewsFeedItems } from '../mocks/newsFeedData';

interface UseNewsFeedReturn {
  items: NewsFeedItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export const useNewsFeed = (): UseNewsFeedReturn => {
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const pageSize = 6; // Show 6 items per page for better visualization
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = mockNewsFeedItems.slice(startIndex, endIndex);

      if (isLoadMore) {
        setItems(prev => [...prev, ...paginatedItems]);
      } else {
        setItems(paginatedItems);
      }

      // Check if there are more items
      setHasMore(endIndex < mockNewsFeedItems.length);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching newsfeed:', error);
      setError('Failed to load news feed');
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

  const refetch = useCallback(() => {
    setCurrentPage(1);
    fetchNewsFeed(1, false);
  }, [fetchNewsFeed]);

  // Initial load
  useEffect(() => {
    // Only fetch news feed after authentication has been initialized
    if (!authLoading) {
      fetchNewsFeed(1, false);
    }
  }, [authLoading]);

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