import { useState, useEffect } from 'react';
import { TrendingReportsService, type TrendingReportItem } from '../services/trendingReportsService';
import { useAuth } from '../context/AuthContext';

interface UseTrendingReportsReturn {
  trendingReports: TrendingReportItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  calculateAndRefresh: () => Promise<void>; // Silent update method
}

export const useTrendingReports = (): UseTrendingReportsReturn => {
  // Initialize with empty array to prevent map error
  const [trendingReports, setTrendingReports] = useState<TrendingReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoading: authLoading } = useAuth();

  const fetchTrendingReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TrendingReportsService.getTrendingReports();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // If API returns empty array, use fallback data for demo purposes
          console.log('API returned empty array, using fallback data for demo');
          setTrendingReports(TrendingReportsService.getFallbackTrendingReports());
        } else {
          setTrendingReports(data);
        }
      } else {
        console.warn('API returned non-array data:', data);
        setTrendingReports(TrendingReportsService.getFallbackTrendingReports());
      }
    } catch (err) {
      console.error('Failed to fetch trending reports:', err);
      setError('Failed to load trending reports');
      // Use fallback data
      setTrendingReports(TrendingReportsService.getFallbackTrendingReports());
    } finally {
      setLoading(false);
    }
  };

  const calculateAndRefresh = async () => {
    try {
      // Silently calculate trending reports in background
      await TrendingReportsService.calculateTrendingReports();
      
      // Wait a moment for calculation to complete, then refresh data
      setTimeout(async () => {
        await fetchTrendingReports();
      }, 1000); // 1 second delay to ensure calculation is complete
      
    } catch (err) {
      console.error('Failed to calculate and refresh trending reports:', err);
      // On error, just refetch existing data
      await fetchTrendingReports();
    }
  };

  useEffect(() => {
    // Only fetch trending reports after authentication has been initialized
    if (!authLoading) {
      fetchTrendingReports();
    }
  }, [authLoading]);

  return {
    trendingReports,
    loading: loading || authLoading,
    error,
    refetch: fetchTrendingReports,
    calculateAndRefresh
  };
};