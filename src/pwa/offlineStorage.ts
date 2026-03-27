/**
 * Offline Storage Module
 * Manages IndexedDB for offline data persistence
 * Stores booking drafts, cached data, and sync state
 */

const DB_NAME = 'ResqHub';
const DB_VERSION = 1;

export const StoreName = {
  BOOKING_DRAFTS: 'booking_drafts',
  CACHED_REPORTS: 'cached_reports',
  USER_PREFERENCES: 'user_preferences',
  SYNC_METADATA: 'sync_metadata',
} as const;

export type StoreNameType = typeof StoreName[keyof typeof StoreName];

export interface BookingDraft {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  images?: string[];
  status: 'draft' | 'submitted' | 'synced';
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
}

export interface CachedReport {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  images?: string[];
  cachedAt: number;
  expiresAt?: number;
}

export interface UserPreference {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface SyncMetadata {
  key: string;
  lastSyncTime: number;
  syncInProgress: boolean;
  pendingActions: number;
}

/**
 * Initialize IndexedDB with proper schema
 */
export async function initializeOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;
      console.log('✅ IndexedDB initialized:', DB_NAME);
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('📦 Creating IndexedDB schema...');

      // Booking Drafts Store
      if (!db.objectStoreNames.contains(StoreName.BOOKING_DRAFTS)) {
        const draftStore = db.createObjectStore(StoreName.BOOKING_DRAFTS, { keyPath: 'id' });
        draftStore.createIndex('status', 'status', { unique: false });
        draftStore.createIndex('createdAt', 'createdAt', { unique: false });
        draftStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        console.log('📝 Created booking_drafts store');
      }

      // Cached Reports Store
      if (!db.objectStoreNames.contains(StoreName.CACHED_REPORTS)) {
        const reportStore = db.createObjectStore(StoreName.CACHED_REPORTS, { keyPath: 'id' });
        reportStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        reportStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        console.log('📋 Created cached_reports store');
      }

      // User Preferences Store
      if (!db.objectStoreNames.contains(StoreName.USER_PREFERENCES)) {
        db.createObjectStore(StoreName.USER_PREFERENCES, { keyPath: 'key' });
        console.log('⚙️ Created user_preferences store');
      }

      // Sync Metadata Store
      if (!db.objectStoreNames.contains(StoreName.SYNC_METADATA)) {
        db.createObjectStore(StoreName.SYNC_METADATA, { keyPath: 'key' });
        console.log('🔄 Created sync_metadata store');
      }
    };
  });
}

/**
 * Get IndexedDB instance
 */
let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    dbInstance = await initializeOfflineDB();
  }
  return dbInstance;
}

/**
 * Save booking draft
 */
export async function saveBookingDraft(draft: BookingDraft): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readwrite');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);

    draft.updatedAt = Date.now();
    const request = store.put(draft);

    request.onsuccess = () => {
      console.log('💾 Booking draft saved:', draft.id);
      resolve();
    };

    request.onerror = () => {
      console.error('❌ Failed to save booking draft:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get booking draft by ID
 */
export async function getBookingDraft(id: string): Promise<BookingDraft | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readonly');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error('❌ Failed to get booking draft:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get all booking drafts
 */
export async function getAllBookingDrafts(): Promise<BookingDraft[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readonly');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('❌ Failed to get booking drafts:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get drafts by status
 */
export async function getBookingDraftsByStatus(status: 'draft' | 'submitted' | 'synced'): Promise<BookingDraft[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readonly');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);
    const index = store.index('status');
    const request = index.getAll(status);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('❌ Failed to get drafts by status:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Delete booking draft
 */
export async function deleteBookingDraft(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readwrite');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('🗑️ Booking draft deleted:', id);
      resolve();
    };

    request.onerror = () => {
      console.error('❌ Failed to delete booking draft:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Clear all drafts
 */
export async function clearAllDrafts(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readwrite');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);
    const request = store.clear();

    request.onsuccess = () => {
      console.log('🗂️ All drafts cleared');
      resolve();
    };

    request.onerror = () => {
      console.error('❌ Failed to clear drafts:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Save user preference
 */
export async function saveUserPreference(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.USER_PREFERENCES], 'readwrite');
    const store = tx.objectStore(StoreName.USER_PREFERENCES);

    const preference: UserPreference = {
      key,
      value,
      updatedAt: Date.now(),
    };

    const request = store.put(preference);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get user preference
 */
export async function getUserPreference(key: string): Promise<unknown | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.USER_PREFERENCES], 'readonly');
    const store = tx.objectStore(StoreName.USER_PREFERENCES);
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result as UserPreference | undefined;
      resolve(result?.value || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Update sync metadata
 */
export async function updateSyncMetadata(key: string, metadata: Partial<SyncMetadata>): Promise<void> {
  const db = await getDB();
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction([StoreName.SYNC_METADATA], 'readwrite');
    const store = tx.objectStore(StoreName.SYNC_METADATA);

    // Get existing metadata
    const getRequest = store.get(key);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as SyncMetadata | undefined;
      const updated: SyncMetadata = {
        key,
        lastSyncTime: metadata.lastSyncTime ?? existing?.lastSyncTime ?? 0,
        syncInProgress: metadata.syncInProgress ?? existing?.syncInProgress ?? false,
        pendingActions: metadata.pendingActions ?? existing?.pendingActions ?? 0,
      };

      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Get sync metadata
 */
export async function getSyncMetadata(key: string): Promise<SyncMetadata | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.SYNC_METADATA], 'readonly');
    const store = tx.objectStore(StoreName.SYNC_METADATA);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Delete old drafts (older than 30 days)
 */
export async function cleanupOldDrafts(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
  const db = await getDB();
  const cutoffTime = Date.now() - maxAgeMs;
  let deletedCount = 0;

  return new Promise((resolve, reject) => {
    const tx = db.transaction([StoreName.BOOKING_DRAFTS], 'readwrite');
    const store = tx.objectStore(StoreName.BOOKING_DRAFTS);
    const request = store.getAll();

    request.onsuccess = () => {
      const drafts = request.result as BookingDraft[];
      drafts.forEach((draft) => {
        if (draft.updatedAt < cutoffTime && draft.status === 'synced') {
          store.delete(draft.id);
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${deletedCount} old drafts`);
      }

      resolve(deletedCount);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get storage size estimate
 */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number; percentage: number }> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usage: 0, quota: 0, percentage: 0 };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentage };
  } catch (error) {
    console.error('❌ Failed to get storage estimate:', error);
    return { usage: 0, quota: 0, percentage: 0 };
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    const persistent = await navigator.storage.persist();
    if (persistent) {
      console.log('✅ Persistent storage granted');
    }
    return persistent;
  } catch (error) {
    console.error('❌ Failed to request persistent storage:', error);
    return false;
  }
}
