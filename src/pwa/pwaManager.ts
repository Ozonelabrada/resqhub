/**
 * PWA Manager
 * Centralizes PWA initialization and management
 */

import {
  registerServiceWorker,
  checkForUpdates,
  getServiceWorkerRegistration,
  postMessageToServiceWorker,
  ServiceWorkerRegistrationOptions,
} from './registerServiceWorker';

export interface PWAManagerOptions {
  enableAutoUpdate?: boolean;
  checkUpdateInterval?: number; // in milliseconds, default 60000 (1 minute)
  onServiceWorkerReady?: (registration: ServiceWorkerRegistration) => void;
  onServiceWorkerUpdate?: (registration: ServiceWorkerRegistration) => void;
  onServiceWorkerError?: (error: Error) => void;
}

class PWAManager {
  private swUpdateCheckInterval: NodeJS.Timeout | null = null;
  private options: Required<PWAManagerOptions>;

  constructor(options: PWAManagerOptions = {}) {
    this.options = {
      enableAutoUpdate: options.enableAutoUpdate ?? true,
      checkUpdateInterval: options.checkUpdateInterval ?? 60000,
      onServiceWorkerReady: options.onServiceWorkerReady ?? (() => {}),
      onServiceWorkerUpdate: options.onServiceWorkerUpdate ?? (() => {}),
      onServiceWorkerError: options.onServiceWorkerError ?? (() => {}),
    };
  }

  /**
   * Initialize PWA
   */
  async init(): Promise<void> {
    console.log('🚀 Initializing PWA...');

    try {
      // Register service worker
      const registration = await registerServiceWorker({
        onSuccess: (reg) => {
          console.log('✅ Service Worker registered successfully');
          this.options.onServiceWorkerReady(reg);
          this.startUpdateCheck();
        },
        onUpdate: (reg) => {
          console.log('📦 Service Worker update available');
          this.options.onServiceWorkerUpdate(reg);
        },
        onError: (error) => {
          console.error('❌ Service Worker registration failed:', error);
          this.options.onServiceWorkerError(error);
        },
      });

      // Log PWA status
      this.logPWAStatus();

      // Handle controller change (when new SW takes over)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker controller changed');
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });
      }
    } catch (error) {
      console.error('PWA initialization error:', error);
    }
  }

  /**
   * Start periodic update checks
   */
  private startUpdateCheck(): void {
    if (!this.options.enableAutoUpdate) {
      return;
    }

    // Check immediately
    checkForUpdates();

    // Check periodically
    this.swUpdateCheckInterval = setInterval(() => {
      checkForUpdates();
    }, this.options.checkUpdateInterval);
  }

  /**
   * Stop update checks
   */
  stopUpdateCheck(): void {
    if (this.swUpdateCheckInterval) {
      clearInterval(this.swUpdateCheckInterval);
      this.swUpdateCheckInterval = null;
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('📦 Cache updated:', payload);
        break;
      case 'OFFLINE_MODE':
        console.log('📴 Offline mode:', payload);
        break;
      case 'SYNC_COMPLETED':
        console.log('✅ Background sync completed:', payload);
        break;
      default:
        console.log('Message from SW:', event.data);
    }
  }

  /**
   * Request page refresh with new service worker
   */
  requestAppRefresh(): void {
    postMessageToServiceWorker({ type: 'SKIP_WAITING' });

    // Listen for controller change and reload
    let refreshing = false;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }

  /**
   * Log PWA status
   */
  private logPWAStatus(): void {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalledIOS = (navigator as any).standalone === true;
    const isPWA = isStandalone || isInstalledIOS;

    console.log('📱 PWA Status:');
    console.log(`  - Standalone mode: ${isStandalone}`);
    console.log(`  - iOS installed: ${isInstalledIOS}`);
    console.log(`  - PWA active: ${isPWA}`);
  }

  /**
   * Check if app is running as PWA
   */
  isPWA(): boolean {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalledIOS = (navigator as any).standalone === true;
    return isStandalone || isInstalledIOS;
  }

  /**
   * Get service worker registration
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    return getServiceWorkerRegistration();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopUpdateCheck();
  }
}

// Singleton instance
let pwaManager: PWAManager | null = null;

/**
 * Initialize PWA Manager (call once at app startup)
 */
export const initPWAManager = (options?: PWAManagerOptions): PWAManager => {
  if (!pwaManager) {
    pwaManager = new PWAManager(options);
    pwaManager.init();
  }
  return pwaManager;
};

/**
 * Get PWA Manager instance
 */
export const getPWAManager = (): PWAManager | null => {
  return pwaManager;
};

export default initPWAManager;
