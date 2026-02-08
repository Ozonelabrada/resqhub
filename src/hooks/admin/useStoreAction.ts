import { useState, useCallback } from 'react';
import api from '@/api/client';
import { toast } from 'react-hot-toast';

export interface StoreActionModalState {
  type: 'approve' | 'reject' | 'suspend' | 'reopen' | null;
  open: boolean;
}

export const useStoreAction = (communityId: string | undefined) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<StoreActionModalState>({ type: null, open: false });
  const [reason, setReason] = useState('');

  const execute = useCallback(
    async (storeId: number, action: 'approve' | 'reject' | 'suspend' | 'reopen', actionReason?: string) => {
      if (!communityId) return;

      setActionLoading(true);
      try {
        const statusMap: Record<string, string> = {
          approve: 'Approved',
          reject: 'Rejected',
          suspend: 'Suspended',
          reopen: 'Approved',
        };

        const payload: any = { status: statusMap[action] };
        if ((action === 'reject' || action === 'suspend') && actionReason) {
          payload.reason = actionReason;
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
      } catch (error) {
        console.error('Error processing store action:', error);
        toast.error('Failed to process action');
      } finally {
        setActionLoading(false);
      }

      return false;
    },
    [communityId]
  );

  const openModal = useCallback((type: StoreActionModalState['type']) => {
    setModal({ type, open: true });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ type: null, open: false });
    setReason('');
  }, []);

  return {
    actionLoading,
    modal,
    reason,
    setReason,
    execute,
    openModal,
    closeModal,
  };
};
