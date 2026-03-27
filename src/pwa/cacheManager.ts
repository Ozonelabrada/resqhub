/**
 * Cache Management Utilities
 * Provides utilities for managing service worker caches
 */

export interface CacheConfig {
  name: string;
  version: string;
  maxAge?: number; // milliseconds
  maxSize?: number; // bytes
}

/**
 * Get cache name with version
 */
export const getCacheName = (baseName: string, version: string = '1'): string => {
  return `${baseName}-v${version}`;
};

/**
 * Delete old cache versions
 */
export const deleteOldCaches = async (baseName: string, currentVersion: string = '1'): Promise<void> => {
  if (typeof caches === 'undefined') return;

  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(
    (name) => name.startsWith(baseName) && !name.endsWith(`-v${currentVersion}`)
  );

  await Promise.all(cachesToDelete.map((name) => caches.delete(name)));
  console.log(`🧹 Deleted ${cachesToDelete.length} old cache versions`);
};

/**
 * Clear all caches
 */
export const clearAllCaches = async (): Promise<void> => {
  if (typeof caches === 'undefined') return;

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('🧹 Cleared all caches');
};

/**
 * Get cache size
 */
export const getCacheSize = async (cacheName?: string): Promise<number> => {
  if (typeof caches === 'undefined') return 0;

  let totalSize = 0;
  const names = cacheName ? [cacheName] : await caches.keys();

  for (const name of names) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        totalSize += parseInt(response.headers.get('content-length') || '0', 10);
      }
    }
  }

  return totalSize;
};

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
  caches: Array<{ name: string; size: string; count: number }>;
  totalSize: string;
}> => {
  if (typeof caches === 'undefined') {
    return { caches: [], totalSize: '0 Bytes' };
  }

  const cacheNames = await caches.keys();
  const stats: Array<{ name: string; size: string; count: number }> = [];
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    let cacheSize = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        cacheSize += parseInt(response.headers.get('content-length') || '0', 10);
      }
    }

    totalSize += cacheSize;
    stats.push({
      name,
      size: formatBytes(cacheSize),
      count: keys.length,
    });
  }

  return {
    caches: stats,
    totalSize: formatBytes(totalSize),
  };
};

/**
 * Pre-cache critical resources
 */
export const precacheCriticalResources = async (cacheName: string, urls: string[]): Promise<void> => {
  if (typeof caches === 'undefined') return;

  try {
    const cache = await caches.open(cacheName);
    await cache.addAll(urls);
    console.log(`✅ Pre-cached ${urls.length} critical resources`);
  } catch (error) {
    console.error('Failed to pre-cache resources:', error);
  }
};

/**
 * Remove expired cache entries
 */
export const removeExpiredCacheEntries = async (
  cacheName: string,
  maxAgeMs: number
): Promise<number> => {
  if (typeof caches === 'undefined') return 0;

  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    let deletedCount = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const cachedTime = new Date(dateHeader).getTime();
          const age = Date.now() - cachedTime;

          if (age > maxAgeMs) {
            await cache.delete(request);
            deletedCount++;
          }
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Removed ${deletedCount} expired cache entries from ${cacheName}`);
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to remove expired cache entries:', error);
    return 0;
  }
};

export default {
  getCacheName,
  deleteOldCaches,
  clearAllCaches,
  getCacheSize,
  formatBytes,
  getCacheStats,
  precacheCriticalResources,
  removeExpiredCacheEntries,
};
