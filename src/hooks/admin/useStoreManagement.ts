import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/api/client';

interface Store {
  storeId: number;
  storeName: string;
  status: string;
  [key: string]: any;
}

interface StoreDetail extends Store {
  owner?: any;
  [key: string]: any;
}

interface StoreStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

interface UseStoreManagementReturn {
  stores: Store[];
  storeDetail: StoreDetail | null;
  storeStatusCounts: StoreStatusCounts;
  storesLoading: boolean;
  storeDetailLoading: boolean;
  storeActionLoading: boolean;
  fetchStoresByStatus: (communityId: string | number, status: string) => Promise<void>;
  fetchStoreDetail: (communityId: string | number, storeId: number) => Promise<void>;
  handleStoreAction: (
    communityId: string | number,
    storeId: number,
    action: 'approve' | 'reject' | 'suspend' | 'reopen',
    reason?: string
  ) => Promise<boolean>;
}

/**
 * Custom hook to manage all store-related state and API operations
 * Handles fetching stores, details, and processing store actions
 */
export const useStoreManagement = (): UseStoreManagementReturn => {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const [storeStatusCounts, setStoreStatusCounts] = useState<StoreStatusCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeDetailLoading, setStoreDetailLoading] = useState(false);
  const [storeActionLoading, setStoreActionLoading] = useState(false);

  const fetchStoresByStatus = useCallback(
    async (communityId: string | number, status: string): Promise<void> => {
      setStoresLoading(true);
      try {
        const response = await api.get(`/communities/${communityId}/stores`, {
          params: { status, page: 1, pageSize: 100 },
        });
        if (response.data?.succeeded) {
          setStores(response.data.data.items || []);
          if (response.data.data.statusCounts) {
            setStoreStatusCounts(response.data.data.statusCounts);
          }
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      } finally {
        setStoresLoading(false);
      }
    },
    []
  );

  const fetchStoreDetail = useCallback(
    async (communityId: string | number, storeId: number): Promise<void> => {
      setStoreDetailLoading(true);
      try {
        const response = await api.get(`/communities/${communityId}/stores/${storeId}`);
        if (response.data?.succeeded) {
          setStoreDetail(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching store details:', error);
        toast.error('Failed to load store details');
      } finally {
        setStoreDetailLoading(false);
      }
    },
    []
  );

  const handleStoreAction = useCallback(
    async (
      communityId: string | number,
      storeId: number,
      action: 'approve' | 'reject' | 'suspend' | 'reopen',
      reason?: string
    ): Promise<boolean> => {
      setStoreActionLoading(true);
      try {
        const statusMap: Record<string, string> = {
          approve: 'Approved',
          reject: 'Rejected',
          suspend: 'Suspended',
          reopen: 'Approved',
        };

        const payload: Record<string, any> = {
          status: statusMap[action],
        };

        if ((action === 'reject' || action === 'suspend') && reason) {
          payload.reason = reason;
        }

        const response = await api.patch(
          `/communities/${communityId}/stores/${storeId}/status`,
          payload
        );

        if (response.data?.succeeded) {
          const actionText =
            action === 'approve'
              ? 'Approved'
              : action === 'reject'
                ? 'Rejected'
                : action === 'suspend'
                  ? 'Suspended'
                  : 'Re-opened';

          toast.success(`Store ${actionText} successfully`);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error processing store action:', error);
        toast.error('Failed to process action');
        return false;
      } finally {
        setStoreActionLoading(false);
      }
    },
    []
  );

  return {
    stores,
    storeDetail,
    storeStatusCounts,
    storesLoading,
    storeDetailLoading,
    storeActionLoading,
    fetchStoresByStatus,
    fetchStoreDetail,
    handleStoreAction,
  };
};
