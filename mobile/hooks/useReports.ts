import { useEffect, useState } from 'react';
import { API_URL, ENDPOINTS } from '@/constants';

interface UseReportsOptions {
  type?: 'lost' | 'found';
  category?: string;
  search?: string;
}

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  userEmail: string;
  userName: string;
  createdAt: string;
  status: 'active' | 'resolved' | 'closed';
}

export const useReports = (options: UseReportsOptions = {}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.type) params.append('type', options.type);
        if (options.category) params.append('category', options.category);
        if (options.search) params.append('search', options.search);

        const url = `${API_URL}${ENDPOINTS.SEARCH}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Fetch reports error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [options.type, options.category, options.search]);

  return { reports, loading, error };
};
