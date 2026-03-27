/**
 * PWA Module Exports
 * Central export point for all PWA-related functionality
 */

export {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  reloadWithNewServiceWorker,
  getServiceWorkerRegistration,
  postMessageToServiceWorker,
  type ServiceWorkerRegistrationOptions,
} from './registerServiceWorker';

export {
  initPWAManager,
  getPWAManager,
  type PWAManagerOptions,
} from './pwaManager';

export {
  getCacheName,
  deleteOldCaches,
  clearAllCaches,
  getCacheSize,
  formatBytes,
  getCacheStats,
  precacheCriticalResources,
  removeExpiredCacheEntries,
  type CacheConfig,
} from './cacheManager';

export {
  cacheFirstStrategy,
  networkFirstStrategy,
  staleWhileRevalidateStrategy,
  networkOnlyStrategy,
  cacheOnlyStrategy,
  selectStrategy,
  applyStrategy,
  type CacheStrategy,
  type CacheStrategyOptions,
} from './cacheStrategies';

export {
  initializeOfflineDB,
  getDB,
  saveBookingDraft,
  getBookingDraft,
  getAllBookingDrafts,
  getBookingDraftsByStatus,
  deleteBookingDraft,
  clearAllDrafts,
  saveUserPreference,
  getUserPreference,
  updateSyncMetadata,
  getSyncMetadata,
  cleanupOldDrafts,
  getStorageEstimate,
  requestPersistentStorage,
  type BookingDraft,
  type CachedReport,
  type UserPreference,
  type SyncMetadata,
  StoreName,
} from './offlineStorage';

export {
  initializeSyncQueue,
  addToSyncQueue,
  getSyncAction,
  getPendingActions,
  updateActionStatus,
  incrementRetryCount,
  removeFromSyncQueue,
  registerSyncHandler,
  processSyncQueue,
  startAutoSync,
  stopAutoSync,
  getPendingActionsCount,
  updatePendingActionsCount,
  isSyncInProgress,
  forceSync,
  clearSyncQueue,
  type SyncAction,
  ActionType,
  ActionStatus,
} from './syncQueue';

export {
  getVAPIDPublicKey,
  generateVAPIDKeysInstruction,
  isValidVAPIDPublicKey,
  urlBase64ToUint8Array,
  type VAPIDConfig,
} from './vapidKeys';

export {
  isPushNotificationsSupported,
  getNotificationPermission,
  hasNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  subscriptionToJSON,
  sendSubscriptionToBackend,
  sendTestNotification,
  requestPushNotification,
  watchPushSubscription,
  type NotificationSubscription,
  type NotificationData,
} from './notificationManager';

export {
  pushEventHandler,
  registerPushHandlers,
  type PushNotificationPayload,
} from './pushEventHandlers';

export {
  SyncTags,
  isBackgroundSyncSupported,
  registerBackgroundSync,
  isBackgroundSyncRegistered,
  getRegisteredSyncTags,
  unregisterBackgroundSync,
  backgroundSyncHandlers,
  registerBackgroundSyncHandlers,
  onBackgroundSyncComplete,
  type SyncTagValue,
  type SyncStatusNotification,
} from './backgroundSync';

export {
  WebSocketManager,
  WebSocketPool,
  ConnectionState,
  getGlobalWebSocketPool,
  resetGlobalWebSocketPool,
  type WebSocketConfig,
  type WebSocketMessage,
  type WebSocketEventType,
  type WebSocketEventHandler,
  type WebSocketEvent,
} from './websocketManager';

export {
  GeolocationManager,
  LocationSync,
  isGeolocationSupported,
  getLocationPermissionStatus,
  requestLocationPermission,
  getCurrentLocation,
  convertCoordinates,
  getGlobalGeolocationManager,
  resetGlobalGeolocationManager,
  PermissionStatus,
  type LocationCoordinates,
  type LocationError,
  type LocationUpdateCallback,
  type LocationErrorCallback,
} from './geolocationManager';

export {
  getDeviceInfo,
  testDeviceCapabilities,
  startConsoleLogging,
  getConsoleLogs,
  clearConsoleLogs,
  generateDiagnosticsReport,
  downloadDiagnosticsReport,
  type DeviceInfo,
  type DeviceCapabilityTest,
  type ConsoleLogs,
  type DiagnosticsReport,
} from './deviceTesting';

export {
  collectPerformanceMetrics,
  PerformanceMonitor,
  getPerformanceMonitor,
  getOptimizationRecommendations,
  type PerformanceMetrics,
} from './performanceMonitoring';

export { default as registerServiceWorkerModule } from './registerServiceWorker';
export { default as pwaManagerModule } from './pwaManager';
export { default as cacheManagerModule } from './cacheManager';
export { default as cacheStrategiesModule } from './cacheStrategies';
