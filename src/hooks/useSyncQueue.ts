/**
 * Sync Queue Hook
 * React hook for managing offline actions and sync queue
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActionType,
  ActionTypeValue,
  ActionStatus,
  ActionStatusValue,
  SyncAction,
  addToSyncQueue,
  getSyncAction,
  getPendingActions,
  getPendingActionsCount,
  updateActionStatus,
  removeFromSyncQueue,
  registerSyncHandler,
  processSyncQueue,
  startAutoSync,
  stopAutoSync,
  isSyncInProgress,
  forceSync,
  clearSyncQueue,
} from '../pwa/syncQueue';

export interface UseSyncQueueReturn {
  pendingActions: SyncAction[];
  pendingCount: number;
  isLoading: boolean;
  error: Error | null;
  isSyncing: boolean;
  addAction: (type: ActionTypeValue, payload: Record<string, unknown>) => Promise<string>;
  getAction: (id: string) => Promise<SyncAction | null>;
  refreshPendingActions: () => Promise<void>;
  removeAction: (id: string) => Promise<void>;
  registerHandler: (type: ActionTypeValue, handler: (action: SyncAction) => Promise<void>) => void;
  manualSync: () => Promise<{ successful: number; failed: number }>;
  startSync: () => void;
  stopSync: () => void;
  clearQueue: () => Promise<void>;
}

/**
 * Hook to manage offline sync queue
 */
export const useSyncQueue = (): UseSyncQueueReturn => {
  const [pendingActions, setPendingActions] = useState<SyncAction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSyncStartedRef = useRef(false);

  // Initialize and cleanup
  useEffect(() => {
    refreshPendingActions();

    // Monitor sync status
    const syncStatusInterval = setInterval(updateSyncStatus, 2000);

    return () => {
      clearInterval(syncStatusInterval);
      if (syncCheckIntervalRef.current) {
        clearInterval(syncCheckIntervalRef.current);
      }
    };
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Back online - triggering sync');
      setTimeout(() => manualSync(), 500);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const updateSyncStatus = useCallback(() => {
    setIsSyncing(isSyncInProgress());
  }, []);

  const refreshPendingActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const actions = await getPendingActions();
      const count = await getPendingActionsCount();

      setPendingActions(actions);
      setPendingCount(count);

      if (count > 0) {
        console.log(`📤 ${count} pending actions in queue`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to refresh pending actions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAction = useCallback(
    async (type: ActionTypeValue, payload: Record<string, unknown>): Promise<string> => {
      try {
        const id = await addToSyncQueue(type, payload);
        await refreshPendingActions();
        return id;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ Failed to add action to queue:', error);
        throw error;
      }
    },
    [refreshPendingActions],
  );

  const getAction = useCallback(async (id: string) => {
    try {
      return await getSyncAction(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to get action:', error);
      return null;
    }
  }, []);

  const removeAction = useCallback(
    async (id: string) => {
      try {
        await removeFromSyncQueue(id);
        await refreshPendingActions();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ Failed to remove action:', error);
        throw error;
      }
    },
    [refreshPendingActions],
  );

  const registerHandler = useCallback((type: ActionTypeValue, handler: (action: SyncAction) => Promise<void>) => {
    registerSyncHandler(type, handler);
  }, []);

  const manualSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      const result = await processSyncQueue();
      await refreshPendingActions();
      console.log(`✅ Sync result: ${result.successful} successful, ${result.failed} failed`);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Sync failed:', error);
      return { successful: 0, failed: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPendingActions]);

  const startSync = useCallback(() => {
    if (!autoSyncStartedRef.current) {
      startAutoSync();
      autoSyncStartedRef.current = true;
      console.log('✅ Auto-sync started');

      // Check sync periodically
      syncCheckIntervalRef.current = setInterval(async () => {
        await refreshPendingActions();
      }, 5000);
    }
  }, [refreshPendingActions]);

  const stopSync = useCallback(() => {
    if (autoSyncStartedRef.current) {
      stopAutoSync();
      autoSyncStartedRef.current = false;

      if (syncCheckIntervalRef.current) {
        clearInterval(syncCheckIntervalRef.current);
        syncCheckIntervalRef.current = null;
      }

      console.log('⏹️ Auto-sync stopped');
    }
  }, []);

  const clearQueue = useCallback(async () => {
    try {
      await clearSyncQueue();
      await refreshPendingActions();
      console.log('✅ Sync queue cleared');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to clear sync queue:', error);
      throw error;
    }
  }, [refreshPendingActions]);

  return {
    pendingActions,
    pendingCount,
    isLoading,
    error,
    isSyncing,
    addAction,
    getAction,
    refreshPendingActions,
    removeAction,
    registerHandler,
    manualSync,
    startSync,
    stopSync,
    clearQueue,
  };
};
