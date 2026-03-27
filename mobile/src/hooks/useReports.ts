import { useState, useEffect } from 'react';
import { API_URL } from '@/constants';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  images?: string[];
  createdAt: string;
  userName: string;
}

interface UseReportsOptions {
  type?: 'lost' | 'found';
  limit?: number;
  offset?: number;
}

interface UseReportsResult {
  reports: Report[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch reports from the API
 * @param options - Filter and pagination options
 * @returns Object with reports data, loading state, and error
 */
export const useReports = (options: UseReportsOptions = {}): UseReportsResult => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query string from options
        const params = new URLSearchParams();
        if (options.type) params.append('type', options.type);
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        const queryString = params.toString();
        const url = `${API_URL}/reports${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch reports');

        const data = await response.json();
        setReports(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [options.type, options.limit, options.offset]);

  return { reports, loading, error };
};
