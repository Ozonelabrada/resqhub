/**
 * Offline Storage Hook
 * React hook for managing booking drafts and offline data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookingDraft,
  saveBookingDraft,
  getBookingDraft,
  getAllBookingDrafts,
  getBookingDraftsByStatus,
  deleteBookingDraft,
  clearAllDrafts,
  getStorageEstimate,
} from '../pwa/offlineStorage';

export interface UseOfflineStorageReturn {
  drafts: BookingDraft[];
  isLoading: boolean;
  error: Error | null;
  saveDraft: (draft: BookingDraft) => Promise<void>;
  getDraft: (id: string) => Promise<BookingDraft | null>;
  deleteDraft: (id: string) => Promise<void>;
  refreshDrafts: () => Promise<void>;
  getDraftsByStatus: (status: 'draft' | 'submitted' | 'synced') => Promise<BookingDraft[]>;
  clearDrafts: () => Promise<void>;
  storageUsage: { used: number; quota: number; percentage: number };
}

/**
 * Hook to manage offline storage and booking drafts
 */
export const useOfflineStorage = (): UseOfflineStorageReturn => {
  const [drafts, setDrafts] = useState<BookingDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0, percentage: 0 });
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load drafts on mount
  useEffect(() => {
    refreshDrafts();

    // Refresh storage estimate periodically
    const estimateInterval = setInterval(updateStorageEstimate, 30000);

    return () => {
      clearInterval(estimateInterval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const updateStorageEstimate = async () => {
    try {
      const estimate = await getStorageEstimate();
      setStorageUsage({
        used: estimate.usage,
        quota: estimate.quota,
        percentage: estimate.percentage,
      });

      if (estimate.percentage > 80) {
        console.warn('⚠️ Storage quota nearly full:', estimate.percentage.toFixed(1) + '%');
      }
    } catch (err) {
      console.error('Failed to update storage estimate:', err);
    }
  };

  const refreshDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allDrafts = await getAllBookingDrafts();
      setDrafts(allDrafts);
      await updateStorageEstimate();
      console.log(`✅ Loaded ${allDrafts.length} drafts`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to load drafts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveDraft = useCallback(
    async (draft: BookingDraft) => {
      try {
        await saveBookingDraft(draft);
        console.log('💾 Draft saved:', draft.id);

        // Refresh drafts with small delay to ensure DB is updated
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        refreshTimeoutRef.current = setTimeout(refreshDrafts, 100);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ Failed to save draft:', error);
        throw error;
      }
    },
    [refreshDrafts],
  );

  const getDraft = useCallback(async (id: string) => {
    try {
      return await getBookingDraft(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to get draft:', error);
      return null;
    }
  }, []);

  const deleteDraft = useCallback(
    async (id: string) => {
      try {
        await deleteBookingDraft(id);
        console.log('🗑️ Draft deleted:', id);
        await refreshDrafts();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ Failed to delete draft:', error);
        throw error;
      }
    },
    [refreshDrafts],
  );

  const getDraftsByStatus = useCallback(
    async (status: 'draft' | 'submitted' | 'synced') => {
      try {
        const statusDrafts = await getBookingDraftsByStatus(status);
        console.log(`📋 Found ${statusDrafts.length} ${status} drafts`);
        return statusDrafts;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ Failed to get drafts by status:', error);
        return [];
      }
    },
    [],
  );

  const clearDrafts = useCallback(async () => {
    try {
      await clearAllDrafts();
      console.log('🗂️ All drafts cleared');
      await refreshDrafts();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to clear drafts:', error);
      throw error;
    }
  }, [refreshDrafts]);

  return {
    drafts,
    isLoading,
    error,
    saveDraft,
    getDraft,
    deleteDraft,
    refreshDrafts,
    getDraftsByStatus,
    clearDrafts,
    storageUsage,
  };
};
