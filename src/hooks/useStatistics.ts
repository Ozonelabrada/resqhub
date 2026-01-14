import { useState, useEffect } from 'react';
import { StatisticsService } from '../services/statisticsService';
import { useAuth } from '../context/AuthContext';
import type { StatisticsData } from '../types';

interface UseStatisticsReturn {
  statistics: StatisticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStatistics = (): UseStatisticsReturn => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoading: authLoading } = useAuth();

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await StatisticsService.getStatistics();
      setStatistics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      
      // Use fallback data
      setStatistics(StatisticsService.getFallbackStatistics());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch statistics after authentication has been initialized
    if (!authLoading) {
      fetchStatistics();
    }
  }, [authLoading]);

  const refetch = () => {
    fetchStatistics();
  };

  return {
    statistics,
    loading: loading || authLoading,
    error,
    refetch
  };
};