/**
 * Cache Management Hook
 * Provides utilities for managing PWA cache in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { getCacheStats, clearAllCaches, formatBytes } from '../pwa/cacheManager';

export interface UseCacheReturn {
  cacheStats: {
    caches: Array<{ name: string; size: string; count: number }>;
    totalSize: string;
  } | null;
  totalCacheSize: string;
  cacheCount: number;
  isLoading: boolean;
  error: Error | null;
  refreshStats: () => Promise<void>;
  clearCache: () => Promise<void>;
  isClearing: boolean;
}

/**
 * Hook to manage and monitor cache
 */
export const useCacheManagement = (): UseCacheReturn => {
  const [cacheStats, setCacheStats] = useState<{
    caches: Array<{ name: string; size: string; count: number }>;
    totalSize: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof caches === 'undefined') {
        throw new Error('Cache API not available in this browser');
      }

      const stats = await getCacheStats();
      setCacheStats(stats);
      console.log('✅ Cache stats refreshed:', stats);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to get cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async () => {
    setIsClearing(true);
    setError(null);

    try {
      await clearAllCaches();
      setCacheStats(null);
      console.log('✅ All caches cleared');
      
      // Refresh stats after clearing
      await refreshStats();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  }, [refreshStats]);

  // Load cache stats on mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    cacheStats,
    totalCacheSize: cacheStats?.totalSize || '0 Bytes',
    cacheCount: cacheStats?.caches.length || 0,
    isLoading,
    error,
    refreshStats,
    clearCache,
    isClearing,
  };
};

export default useCacheManagement;
