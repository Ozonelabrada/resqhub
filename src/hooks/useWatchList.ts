// hooks/useWatchList.ts
import { useState, useCallback } from 'react';
import type { WatchListItem } from '../types/personalHub';

export const useWatchList = () => {
  const getSampleWatchList = (page: number): WatchListItem[] => {
    const titles = [
      'iPhone 13 Pro Max - Silver', 
      'Blue Mountain Bike', 
      'Black Leather Wallet', 
      'Golden Retriever Puppy', 
      'Car Keys (Toyota)', 
      'MacBook Pro 16 inch'
    ];
    const locations = [
      'Central Park, NY',
      'Maple Street, Brooklyn',
      'Grand Central Station',
      'Metropolitan Museum',
      'Broadway, New York',
      'Queens Boulevard'
    ];

    return Array.from({ length: 6 }, (_, i) => ({
      id: `watch-${page}-${i + 1}`,
      title: titles[i % titles.length],
      type: Math.random() > 0.5 ? 'lost' : 'found',
      location: locations[i % locations.length],
      date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
      similarity: Math.floor(Math.random() * 30) + 70
    }));
  };

  const [items, setItems] = useState<WatchListItem[]>(() => getSampleWatchList(1));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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