import { useState, useCallback } from 'react';
import api from '@/api/client';
import { toast } from 'react-hot-toast';

interface StoreStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export const useStoreList = (communityId: string | undefined) => {
  const [stores, setStores] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<StoreStatusCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchByStatus = useCallback(
    async (status: string) => {
      if (!communityId) return;

      setLoading(true);
      try {
        const response = await api.get(`/communities/${communityId}/stores`, {
          params: { status, page: 1, pageSize: 100 },
        });

        if (response.data?.succeeded) {
          setStores(response.data.data.items || []);
          if (response.data.data.statusCounts) {
            setStatusCounts(response.data.data.statusCounts);
          }
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      } finally {
        setLoading(false);
      }
    },
    [communityId]
  );

  const fetchCounts = useCallback(async () => {
    if (!communityId) return;

    try {
      const response = await api.get(`/communities/${communityId}/stores`, {
        params: { page: 1, pageSize: 1 },
      });

      if (response.data?.succeeded && response.data.data.statusCounts) {
        setStatusCounts(response.data.data.statusCounts);
      }
    } catch (error) {
      console.error('Error fetching store counts:', error);
    }
  }, [communityId]);

  return { stores, statusCounts, loading, fetchByStatus, fetchCounts };
};
