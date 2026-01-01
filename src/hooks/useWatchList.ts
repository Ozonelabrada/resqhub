// hooks/useWatchList.ts
import { useState, useCallback } from 'react';
import type { WatchListItem } from '../types/personalHub';

export const useWatchList = () => {
  const [items, setItems] = useState<WatchListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const getSampleWatchList = (page: number): WatchListItem[] => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `watch-${page}-${i + 1}`,
      title: `Watch Item ${page}-${i + 1}`,
      type: Math.random() > 0.5 ? 'lost' : 'found',
      location: 'Sample Location',
      date: new Date().toISOString(),
      similarity: Math.floor(Math.random() * 30) + 70
    }));
  };

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newItems = getSampleWatchList(nextPage);

      setItems(prev => [...prev, ...newItems]);
      setCurrentPage(nextPage);
      setLoading(false);

      // Simulate reaching the end after 4 pages
      if (nextPage >= 4) {
        setHasMore(false);
      }
    }, 1000);
  }, [currentPage, hasMore, loading]);

  return {
    items,
    loading,
    hasMore,
    loadMore
  };
};