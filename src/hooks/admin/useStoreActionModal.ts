import { useState, useCallback } from 'react';

interface StoreActionModalState {
  type: 'reject' | 'suspend' | 'approve' | 'reopen' | null;
  open: boolean;
}

interface UseStoreActionModalReturn {
  actionModal: StoreActionModalState;
  actionReason: string;
  actionMenuOpen: boolean;
  openActionModal: (type: StoreActionModalState['type']) => void;
  closeActionModal: () => void;
  setActionReason: (reason: string) => void;
  setActionMenuOpen: (open: boolean) => void;
}

/**
 * Custom hook to manage store action modal state and UI
 * Handles modal visibility, action type, and user input
 */
export const useStoreActionModal = (): UseStoreActionModalReturn => {
  const [actionModal, setActionModal] = useState<StoreActionModalState>({
    type: null,
    open: false,
  });
  const [actionReason, setActionReason] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const openActionModal = useCallback(
    (type: StoreActionModalState['type']) => {
      setActionModal({ type, open: true });
    },
    []
  );

  const closeActionModal = useCallback(() => {
    setActionModal({ type: null, open: false });
    setActionReason('');
  }, []);

  return {
    actionModal,
    actionReason,
    actionMenuOpen,
    openActionModal,
    closeActionModal,
    setActionReason,
    setActionMenuOpen,
  };
};
