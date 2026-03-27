/**
 * useBackgroundSync Hook
 * Manages background synchronization tasks in React components
 */

import { useEffect, useState, useCallback } from 'react';
import {
  SyncTags,
  isBackgroundSyncSupported,
  registerBackgroundSync,
  getRegisteredSyncTags,
  onBackgroundSyncComplete,
  type SyncTagValue,
  type SyncStatusNotification,
} from '@/pwa/backgroundSync';

interface BackgroundSyncState {
  supported: boolean;
  registeredTags: SyncTagValue[];
  isLoading: boolean;
  error: string | null;
  lastSyncResults: Record<SyncTagValue, any>;
}

export interface BackgroundSyncHookResult extends BackgroundSyncState {
  registerSync: (tag: SyncTagValue) => Promise<void>;
  getRegisteredTags: () => Promise<void>;
}

export function useBackgroundSync(): BackgroundSyncHookResult {
  const [state, setState] = useState<BackgroundSyncState>({
    supported: isBackgroundSyncSupported(),
    registeredTags: [],
    isLoading: false,
    error: null,
    lastSyncResults: {} as Record<SyncTagValue, any>,
  });

  /**
   * Register a sync task
   */
  const registerSync = useCallback(async (tag: SyncTagValue) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await registerBackgroundSync(tag);

      if (success) {
        setState((prev) => ({
          ...prev,
          registeredTags: [...new Set([...prev.registeredTags, tag])],
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'Failed to register sync task',
          isLoading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Auto-sync error',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Get registered sync tags
   */
  const getRegisteredTagsList = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const tags = await getRegisteredSyncTags();
      setState((prev) => ({
        ...prev,
        registeredTags: tags,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get tags',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Listen for sync completion messages
   */
  useEffect(() => {
    if (!state.supported) return;

    const unsubscribe = onBackgroundSyncComplete((notification: SyncStatusNotification) => {
      console.log('Background sync completed:', notification);

      setState((prev) => ({
        ...prev,
        lastSyncResults: {
          ...prev.lastSyncResults,
          [notification.tag]: notification.data || { timestamp: Date.now() },
        },
      }));
    });

    return () => unsubscribe();
  }, [state.supported]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (state.supported) {
      getRegisteredTagsList();
    }
  }, [state.supported, getRegisteredTagsList]);

  return {
    ...state,
    registerSync,
    getRegisteredTags: getRegisteredTagsList,
  };
}


