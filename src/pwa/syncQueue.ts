/**
 * Sync Queue Module
 * Manages offline actions that need to be synced when back online
 * Persists actions in IndexedDB and syncs them when connection is restored
 */

import { updateSyncMetadata, getSyncMetadata, getDB, StoreName } from './offlineStorage';

export const ActionType = {
  SUBMIT_BOOKING: 'submit_booking',
  UPDATE_BOOKING: 'update_booking',
  DELETE_BOOKING: 'delete_booking',
  ADD_COMMENT: 'add_comment',
  UPDATE_LOCATION: 'update_location',
  MARK_RESOLVED: 'mark_resolved',
  UPLOAD_IMAGE: 'upload_image',
} as const;

export type ActionTypeValue = typeof ActionType[keyof typeof ActionType];

export const ActionStatus = {
  PENDING: 'pending',
  RETRYING: 'retrying',
  FAILED: 'failed',
  COMPLETED: 'completed',
} as const;

export type ActionStatusValue = typeof ActionStatus[keyof typeof ActionStatus];

export interface SyncAction {
  id: string;
  type: ActionTypeValue;
  status: ActionStatusValue;
  payload: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
  lastError?: string;
}

const SYNC_QUEUE_STORE = 'sync_queue';
const SYNC_CHECK_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;
const SYNC_TIMEOUT = 30000; // 30 seconds per action

interface SyncHandler {
  type: ActionTypeValue;
  handler: (action: SyncAction) => Promise<void>;
}

let syncHandlers: Map<ActionTypeValue, (action: SyncAction) => Promise<void>> = new Map();
let isSyncing = false;
let syncCheckInterval: NodeJS.Timeout | null = null;

/**
 * Initialize sync queue
 */
export async function initializeSyncQueue(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readwrite');

    // Check if store exists, if not create it
    if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
      db.close();
      const request = indexedDB.open('ResqHub', 2);
      request.onupgradeneeded = (event) => {
        const upgradedDB = (event.target as IDBOpenDBRequest).result;
        if (!upgradedDB.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const store = upgradedDB.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } else {
      resolve();
    }
  });
}

/**
 * Add action to sync queue
 */
export async function addToSyncQueue(
  type: ActionTypeValue,
  payload: Record<string, unknown>,
  maxRetries: number = MAX_RETRIES,
): Promise<string> {
  const db = await getDB();
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const action: SyncAction = {
    id,
    type,
    status: ActionStatus.PENDING,
    payload,
    retryCount: 0,
    maxRetries,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise(async (resolve, reject) => {
    // Initialize store if needed
    try {
      await initializeSyncQueue();
    } catch (error) {
      console.error('Failed to initialize sync queue:', error);
    }

    const tx = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.add(action);

    request.onsuccess = () => {
      console.log('📤 Action added to sync queue:', { type, id });
      updatePendingActionsCount();
      resolve(id);
    };

    request.onerror = () => {
      console.error('❌ Failed to add action to sync queue:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get action from queue
 */
export async function getSyncAction(id: string): Promise<SyncAction | null> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get all pending actions
 */
export async function getPendingActions(): Promise<SyncAction[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const index = store.index('status');
    const request = index.getAll(ActionStatus.PENDING);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Update action status
 */
export async function updateActionStatus(
  id: string,
  status: ActionStatusValue,
  error?: string,
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const action = getRequest.result as SyncAction;
      if (!action) {
        reject(new Error(`Action not found: ${id}`));
        return;
      }

      action.status = status;
      action.updatedAt = Date.now();
      if (error) {
        action.lastError = error;
      }

      const putRequest = store.put(action);
      putRequest.onsuccess = () => {
        console.log(`📝 Action status updated: ${id} → ${status}`);
        updatePendingActionsCount();
        resolve();
      };
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Increment retry count
 */
export async function incrementRetryCount(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const action = getRequest.result as SyncAction;
      if (!action) {
        reject(new Error(`Action not found: ${id}`));
        return;
      }

      action.retryCount++;
      action.updatedAt = Date.now();

      if (action.retryCount >= action.maxRetries) {
        action.status = ActionStatus.FAILED;
      } else {
        action.status = ActionStatus.RETRYING;
      }

      const putRequest = store.put(action);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Delete action from queue
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('🗑️ Action removed from sync queue:', id);
      updatePendingActionsCount();
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Register sync handler for action type
 */
export function registerSyncHandler(type: ActionTypeValue, handler: (action: SyncAction) => Promise<void>): void {
  syncHandlers.set(type, handler);
  console.log(`✅ Sync handler registered for: ${type}`);
}

/**
 * Process sync queue (attempt to sync all pending actions)
 */
export async function processSyncQueue(): Promise<{ successful: number; failed: number }> {
  if (isSyncing) {
    console.log('⏳ Already syncing...');
    return { successful: 0, failed: 0 };
  }

  if (!navigator.onLine) {
    console.log('📴 Offline - skipping sync');
    return { successful: 0, failed: 0 };
  }

  let isSyncingLocal = true;
  let successful = 0;
  let failed = 0;

  try {
    const pendingActions = await getPendingActions();

    if (pendingActions.length === 0) {
      console.log('✅ No pending actions to sync');
      return { successful: 0, failed: 0 };
    }

    console.log(`🔄 Processing ${pendingActions.length} pending actions...`);

    for (const action of pendingActions) {
      try {
        const handler = syncHandlers.get(action.type);

        if (!handler) {
          console.warn(`⚠️ No handler registered for action type: ${action.type}`);
          await updateActionStatus(action.id, ActionStatus.FAILED, 'No handler registered');
          failed++;
          continue;
        }

        // Execute handler with timeout
        await Promise.race([
          handler(action),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sync timeout')), SYNC_TIMEOUT),
          ),
        ]);

        await updateActionStatus(action.id, ActionStatus.COMPLETED);
        await removeFromSyncQueue(action.id);
        successful++;
        console.log(`✅ Action synced: ${action.id}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to sync action ${action.id}:`, errorMsg);

        await incrementRetryCount(action.id);
        failed++;
      }
    }

    console.log(`📊 Sync complete: ${successful} successful, ${failed} failed`);
    return { successful, failed };
  } finally {
    isSyncing = false;
  }
}

/**
 * Start automatic sync checking
 */
export function startAutoSync(interval: number = SYNC_CHECK_INTERVAL): void {
  if (syncCheckInterval) {
    console.log('⏳ Auto-sync already running');
    return;
  }

  console.log('✅ Starting auto-sync...');

  // Process queue when going online
  window.addEventListener('online', processSyncQueue);

  // Process queue periodically
  syncCheckInterval = setInterval(processSyncQueue, interval);
}

/**
 * Stop automatic sync checking
 */
export function stopAutoSync(): void {
  if (syncCheckInterval) {
    clearInterval(syncCheckInterval);
    syncCheckInterval = null;
    window.removeEventListener('online', processSyncQueue);
    console.log('⏹️ Auto-sync stopped');
  }
}

/**
 * Get pending actions count
 */
export async function getPendingActionsCount(): Promise<number> {
  const actions = await getPendingActions();
  return actions.length;
}

/**
 * Update pending actions count in metadata
 */
export async function updatePendingActionsCount(): Promise<void> {
  const count = await getPendingActionsCount();
  await updateSyncMetadata('sync_status', { pendingActions: count });
}

/**
 * Check if sync in progress
 */
export function isSyncInProgress(): boolean {
  return isSyncing;
}

/**
 * Force sync
 */
export async function forceSync(): Promise<{ successful: number; failed: number }> {
  console.log('⚡ Force syncing...');
  return processSyncQueue();
}

/**
 * Clear all sync actions
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.clear();

    request.onsuccess = () => {
      console.log('🗂️ Sync queue cleared');
      updatePendingActionsCount();
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
