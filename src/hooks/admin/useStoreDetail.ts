import { useState, useCallback } from 'react';
import api from '@/api/client';
import { toast } from 'react-hot-toast';

export const useStoreDetail = (communityId: string | undefined) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(
    async (storeId: number) => {
      if (!communityId) return;

      setLoading(true);
      try {
        const response = await api.get(
          `/communities/${communityId}/stores/${storeId}`
        );

        if (response.data?.succeeded) {
          setDetail(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching store detail:', error);
        toast.error('Failed to load store details');
      } finally {
        setLoading(false);
      }
    },
    [communityId]
  );

  return { detail, loading, fetch, setDetail };
};
