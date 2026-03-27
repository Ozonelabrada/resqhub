/**
 * PWA Service Worker Registration and Management
 * Handles service worker lifecycle, updates, and offline functionality
 */

class PWAServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: number | null = null;

  /**
   * Initialize and register the service worker
   */
  async init(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Workers are not supported in this browser');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('[PWA] Service Worker registered successfully:', this.registration);

      // Handle service worker updates
      this.setupUpdateListener();

      // Check for updates periodically
      this.startUpdateCheck();

      return this.registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Set up listener for service worker updates
   */
  private setupUpdateListener(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('[PWA] Service Worker updated');
          this.notifyUpdate();
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        this.notifyUpdate();
      }
    });
  }

  /**
   * Start periodic update checks
   */
  private startUpdateCheck(): void {
    // Check for updates every 60 seconds
    this.updateCheckInterval = window.setInterval(async () => {
      if (this.registration) {
        try {
          await this.registration.update();
        } catch (error) {
          console.warn('[PWA] Failed to check for updates:', error);
        }
      }
    }, 60000);
  }

  /**
   * Notify app of available update
   */
  private notifyUpdate(): void {
    // Dispatch custom event that the app can listen to
    window.dispatchEvent(
      new CustomEvent('pwa-update-available', {
        detail: {
          message: 'An app update is available',
          timestamp: new Date(),
        },
      })
    );
  }

  /**
   * Skip waiting and activate new service worker immediately
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Wait for the new service worker to activate
    await new Promise<void>((resolve) => {
      if (!this.registration) return;

      this.registration.addEventListener('controllerchange', () => {
        resolve();
      });
    });

    // Reload page to use new version
    window.location.reload();
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHES' });
    }

    // Also clear manually
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('resqhub-'))
        .map((name) => caches.delete(name))
    );

    console.log('[PWA] All caches cleared');
  }

  /**
   * Unregister and cleanup
   */
  async cleanup(): Promise<void> {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }

    if (this.registration) {
      try {
        await this.registration.unregister();
        console.log('[PWA] Service Worker unregistered');
      } catch (error) {
        console.error('[PWA] Failed to unregister Service Worker:', error);
      }
    }
  }

  /**
   * Get registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Export singleton instance
export const pwaServiceWorkerManager = new PWAServiceWorkerManager();

// Auto-initialize on module load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    pwaServiceWorkerManager.init();
  });
} else {
  pwaServiceWorkerManager.init();
}
