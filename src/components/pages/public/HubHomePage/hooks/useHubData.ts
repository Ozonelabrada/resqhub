import { useEffect } from 'react';

export const useHubData = (statsError: any, trendingError: any, toast: any) => {
  // Mock data for success stories
  const recentSuccesses = [
    {
      id: 1,
      title: 'iPhone 13 Pro',
      location: 'Central Park',
      timeAgo: '2 hours ago',
      type: 'lost' as const,
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      title: 'Blue Backpack',
      location: 'Metro Station',
      timeAgo: '5 hours ago',
      type: 'found' as const,
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      title: 'Car Keys',
      location: 'Shopping Mall',
      timeAgo: '1 day ago',
      type: 'lost' as const,
      image: '/api/placeholder/100/100'
    },
    {
      id: 4,
      title: 'Gold Watch',
      location: 'Beach Resort',
      timeAgo: '2 days ago',
      type: 'found' as const,
      image: '/api/placeholder/100/100'
    }
  ];

  // Show error toasts
  useEffect(() => {
    if (statsError) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load platform statistics. Using default values.',
        life: 5000
      });
    }
  }, [statsError, toast]);

  useEffect(() => {
    if (trendingError) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Failed to load trending reports. Using default data.',
        life: 5000
      });
    }
  }, [trendingError, toast]);

  return {
    recentSuccesses
  };
};