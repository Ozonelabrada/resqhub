/**
 * Background Sync API Manager
 * Handles periodic background synchronization for pending bookings and data
 */

/**
 * Background Sync Tags
 */
export const SyncTags = {
  SYNC_PENDING_BOOKINGS: 'sync-pending-bookings',
  SYNC_PENDING_MESSAGES: 'sync-pending-messages',
  SYNC_LOCATION_UPDATES: 'sync-location-updates',
  SYNC_OFFLINE_DRAFTS: 'sync-offline-drafts',
} as const;

export type SyncTagValue = typeof SyncTags[keyof typeof SyncTags];

/**
 * Check if Background Sync API is supported
 */
export function isBackgroundSyncSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'SyncManager' in window
  );
}

/**
 * Register a background sync task
 */
export async function registerBackgroundSync(tag: SyncTagValue): Promise<boolean> {
  if (!isBackgroundSyncSupported()) {
    console.warn('⚠️ Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    console.log(`✅ Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to register background sync (${tag}):`, error);
    return false;
  }
}

/**
 * Check if a specific sync tag is registered
 */
export async function isBackgroundSyncRegistered(tag: SyncTagValue): Promise<boolean> {
  if (!isBackgroundSyncSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const tags = await (registration as any).sync.getTags?.();
    return tags?.includes(tag) || false;
  } catch (error) {
    console.error('Failed to check sync tags:', error);
    return false;
  }
}

/**
 * Get all registered background sync tags
 */
export async function getRegisteredSyncTags(): Promise<SyncTagValue[]> {
  if (!isBackgroundSyncSupported()) {
    return [];
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const tags = await (registration as any).sync.getTags?.();
    return tags || [];
  } catch (error) {
    console.error('Failed to get sync tags:', error);
    return [];
  }
}

/**
 * Unregister a background sync task
 */
export async function unregisterBackgroundSync(tag: SyncTagValue): Promise<boolean> {
  if (!isBackgroundSyncSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // Note: There's no built-in way to unregister a sync tag,
    // but sync tasks are automatically removed once completed
    console.log(`ℹ️ Sync task will be removed after completion: ${tag}`);
    return true;
  } catch (error) {
    console.error(`Failed to unregister sync (${tag}):`, error);
    return false;
  }
}

/**
 * Service Worker Sync Event Handler
 * Add this to your service worker:
 * 
 * self.addEventListener('sync', async (event) => {
 *   if (event.tag === 'sync-pending-bookings') {
 *     event.waitUntil(handleSyncPendingBookings());
 *   }
 *   // ... handle other sync tags
 * });
 */

export const backgroundSyncHandlers = {
  /**
   * Handle syncing pending bookings
   * Fetches and updates bookings from the server
   */
  async handleSyncPendingBookings() {
    console.log('[ServiceWorker] Syncing pending bookings...');
    try {
      const response = await fetch('/api/bookings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ServiceWorker] ✅ Bookings synced:', data);

      // Post message to clients about sync completion
      await (self as any).clients.matchAll().then((clients: any[]) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_COMPLETE',
            tag: 'sync-pending-bookings',
            data,
          });
        });
      });

      return true;
    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to sync bookings:', error);
      throw error; // Re-throw to retry
    }
  },

  /**
   * Handle syncing pending messages
   */
  async handleSyncPendingMessages() {
    console.log('[ServiceWorker] Syncing pending messages...');
    try {
      const response = await fetch('/api/messages/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ServiceWorker] ✅ Messages synced:', data);

      // Notify clients
      await (self as any).clients.matchAll().then((clients: any[]) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_COMPLETE',
            tag: 'sync-pending-messages',
            data,
          });
        });
      });

      return true;
    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to sync messages:', error);
      throw error;
    }
  },

  /**
   * Handle syncing location updates
   */
  async handleSyncLocationUpdates() {
    console.log('[ServiceWorker] Syncing location updates...');
    try {
      // Get location data from storage
      const cache = await (caches as any).open('location-cache');
      const locationData = await cache.match('/location-data');

      if (!locationData) {
        console.log('[ServiceWorker] No location data to sync');
        return true;
      }

      const location = await locationData.json();

      // Send to server
      const response = await fetch('/api/riders/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      console.log('[ServiceWorker] ✅ Location updated');
      return true;
    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to sync location:', error);
      throw error;
    }
  },

  /**
   * Handle syncing offline drafts
   */
  async handleSyncOfflineDrafts() {
    console.log('[ServiceWorker] Syncing offline drafts...');
    try {
      const response = await fetch('/api/drafts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ServiceWorker] ✅ Drafts synced:', data);

      // Notify clients
      await (self as any).clients.matchAll().then((clients: any[]) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_COMPLETE',
            tag: 'sync-offline-drafts',
            data,
          });
        });
      });

      return true;
    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to sync drafts:', error);
      throw error;
    }
  },
};

/**
 * Register background sync event listeners in service worker
 */
export function registerBackgroundSyncHandlers() {
  if (typeof self !== 'undefined' && 'addEventListener' in self) {
    (self as any).addEventListener('sync', async (event: any) => {
      console.log('[ServiceWorker] Sync event:', event.tag);

      try {
        switch (event.tag) {
          case SyncTags.SYNC_PENDING_BOOKINGS:
            event.waitUntil(backgroundSyncHandlers.handleSyncPendingBookings());
            break;
          case SyncTags.SYNC_PENDING_MESSAGES:
            event.waitUntil(backgroundSyncHandlers.handleSyncPendingMessages());
            break;
          case SyncTags.SYNC_LOCATION_UPDATES:
            event.waitUntil(backgroundSyncHandlers.handleSyncLocationUpdates());
            break;
          case SyncTags.SYNC_OFFLINE_DRAFTS:
            event.waitUntil(backgroundSyncHandlers.handleSyncOfflineDrafts());
            break;
          default:
            console.warn('[ServiceWorker] Unknown sync tag:', event.tag);
        }
      } catch (error) {
        console.error('[ServiceWorker] Sync handler error:', error);
      }
    });

    console.log('[ServiceWorker] Background sync handlers registered');
  }
}

/**
 * Sync status notifications
 */
export interface SyncStatusNotification {
  type: 'BACKGROUND_SYNC_COMPLETE' | 'BACKGROUND_SYNC_FAILED';
  tag: SyncTagValue;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Listen for background sync completion messages from service worker
 */
export function onBackgroundSyncComplete(
  callback: (notification: SyncStatusNotification) => void,
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'BACKGROUND_SYNC_COMPLETE' || event.data?.type === 'BACKGROUND_SYNC_FAILED') {
      callback(event.data);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);

  // Return cleanup function
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}
