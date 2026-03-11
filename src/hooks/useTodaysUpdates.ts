import { useState, useEffect } from 'react';
import { CommunityService } from '@/services/communityService';
import { useAuth } from '@/context/AuthContext';

export interface TodaysUpdate {
  id: number;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  communityId?: number;
  communityName?: string;
  category?: string;
  type: 'event' | 'announcement' | 'news';
}

export interface UseTodaysUpdatesReturn {
  updates: TodaysUpdate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTodaysUpdates = (): UseTodaysUpdatesReturn => {
  const { isAuthenticated } = useAuth();
  const [updates, setUpdates] = useState<TodaysUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    // Only fetch from API if authenticated
    if (!isAuthenticated) {
      setUpdates([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await CommunityService.getTodaysUpdates();
      setUpdates(
        response.events.map((event) => ({
          ...event,
          type: event.type || 'event'
        }))
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch updates';
      setError(errorMessage);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [isAuthenticated]);

  return {
    updates,
    loading,
    error,
    refetch: fetchUpdates
  };
};
