/**
 * Service Worker Push Event Handlers
 * Handles incoming push messages and notification clicks
 * This code runs in the Service Worker context
 */

// Types for Service Worker context
declare global {
  interface Clients {
    matchAll(options?: ClientQueryOptions): Promise<Client[]>;
    openWindow(url: string): Promise<Client | null>;
  }

  interface ClientQueryOptions {
    type?: 'window' | 'worker' | 'sharedworker' | 'all';
    includeUncontrolled?: boolean;
  }

  interface Client {
    focus(): Promise<unknown>;
    postMessage(message: unknown): void;
    url: string;
  }

  interface ServiceWorkerGlobalScope {
    addEventListener: (type: string, listener: EventListener) => void;
    clients: Clients;
    registration: ServiceWorkerRegistration;
  }
}

type PushEventType = Event & { data: PushMessageData };
type NotificationEventType = Event & { notification: Notification; action?: string };

interface PushMessageData {
  json: () => Record<string, unknown>;
  text: () => string;
}

/**
 * Push event listener (runs in service worker)
 * Add this to your service worker:
 * 
 * self.addEventListener('push', handlePushEvent);
 * self.addEventListener('notificationclick', handleNotificationClick);
 */

export const pushEventHandler = {
  /**
   * Handle push notifications
   * Usage in service worker:
   *   self.addEventListener('push', (event) => {
   *     event.waitUntil(handlePush(event));
   *   });
   */
  async handlePush(event: PushEventType) {
    console.log('[ServiceWorker] Push event received');

    try {
      let notificationData: Record<string, unknown> = {
        title: 'ResqHub Notification',
        body: 'You have a new notification',
        icon: '/logo.svg',
        badge: '/badge.svg',
        tag: 'resqhub-notification',
      };

      // Parse push data if available
      if (event.data) {
        try {
          const data = event.data.json();
          notificationData = { ...notificationData, ...data };
          console.log('[ServiceWorker] Parsed notification data:', data);
        } catch {
          // Plain text push
          notificationData.body = event.data.text();
          console.log('[ServiceWorker] Text notification:', notificationData.body);
        }
      }

      // Show notification
      const registration = (self as any as ServiceWorkerGlobalScope).registration;
      const notifOptions: any = {
        body: notificationData.body as string,
        icon: notificationData.icon as string,
        badge: notificationData.badge as string,
        tag: notificationData.tag as string,
        data: notificationData.data || {},
      };

      if (notificationData.actions) {
        notifOptions.actions = notificationData.actions;
      }

      await registration.showNotification(notificationData.title as string, notifOptions);

      console.log('[ServiceWorker] Notification displayed');
    } catch (error) {
      console.error('[ServiceWorker] Error handling push:', error);

      // Show error notification
      const registration = (self as any as ServiceWorkerGlobalScope).registration;
      await registration.showNotification('ResqHub', {
        body: 'Failed to process notification',
        icon: '/logo.svg',
        tag: 'error-notification',
      });
    }
  },

  /**
   * Handle notification clicks
   * Usage in service worker:
   *   self.addEventListener('notificationclick', (event) => {
   *     event.notification.close();
   *     event.waitUntil(handleNotificationClick(event));
   *   });
   */
  async handleNotificationClick(event: NotificationEventType) {
    console.log('[ServiceWorker] Notification clicked:', (event as any).notification?.tag);

    (event as any).notification?.close();

    try {
      const notificationData = (event as any).notification?.data || {};
      const action = event.action;

      // Route based on notification action or data
      let targetUrl = '/';

      if (notificationData?.type) {
        switch (notificationData.type) {
          case 'booking_confirmed':
            targetUrl = '/my-bookings';
            break;
          case 'report_update':
            targetUrl = `/reports/${notificationData.reportId}`;
            break;
          case 'message':
            targetUrl = '/messages';
            break;
          case 'rider_request':
            targetUrl = '/rider-dashboard';
            break;
          default:
            targetUrl = '/';
        }
      }

      // Handle action buttons
      if (action) {
        switch (action) {
          case 'view':
            targetUrl = notificationData?.url || targetUrl;
            break;
          case 'reply':
            // Could open a reply interface
            targetUrl = '/messages';
            break;
          case 'accept':
            // Send acceptance back to server
            if (notificationData?.requestId) {
              await fetch('/api/notifications/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'accept',
                  requestId: notificationData.requestId,
                }),
              });
            }
            targetUrl = '/rider-dashboard';
            break;
          case 'decline':
            // Send decline back to server
            if (notificationData?.requestId) {
              await fetch('/api/notifications/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'decline',
                  requestId: notificationData.requestId,
                }),
              });
            }
            break;
        }
      }

      // Find existing window/tab, or open new one
      const clients = await (self as any as ServiceWorkerGlobalScope).clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Check if app is already open
      for (const client of clients) {
        if ((client as any).url === targetUrl) {
          return client.focus();
        }
      }

      // Try to focus any open app window
      if (clients.length > 0) {
        const client = clients[0];
        await client.focus();
        // Post message to navigate
        client.postMessage({
          type: 'NAVIGATE',
          url: targetUrl,
        });
        return;
      }

      // No open window, open new one
      await (self as any as ServiceWorkerGlobalScope).clients.openWindow(targetUrl);
      console.log('[ServiceWorker] Opened window:', targetUrl);
    } catch (error) {
      console.error('[ServiceWorker] Error handling notification click:', error);
    }
  },
};

/**
 * Configuration for Vite PWA plugin to handle push events
 * Add to vite.config.ts in VitePWA options:
 * 
 * workbox: {
 *   globPatterns: ['**\/*.{js,css,html,svg,png,ico,json}'],
 *   skipWaiting: true,
 *   clientsClaim: true,
 *   runtimeCaching: [
 *     {
 *       urlPattern: /^https:\/\/(api\.resqhub\.com|nominatim\.openstreetmap\.org)/,
 *       handler: 'NetworkFirst',
 *       options: {
 *         cacheName: 'api-cache',
 *         expiration: {
 *           maxEntries: 50,
 *           maxAgeSeconds: 86400,
 *         },
 *       },
 *     },
 *   ],
 * },
 * 
 * In index.html add push event listener setup:
 * <script>
 *   if ('serviceWorker' in navigator) {
 *     navigator.serviceWorker.ready.then(reg => {
 *       reg.active.postMessage({
 *         type: 'SETUP_PUSH_HANDLERS'
 *       });
 *     });
 *   }
 * </script>
 */

/**
 * Service Worker Notification Types
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    type?: 'booking_confirmed' | 'report_update' | 'message' | 'rider_request' | string;
    url?: string;
    reportId?: string;
    requestId?: string;
    [key: string]: unknown;
  };
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Example service worker registration with push handlers
 * This would go in your main service worker file or auto-imported by Workbox
 */
export function registerPushHandlers() {
  if (typeof self !== 'undefined' && 'addEventListener' in self) {
    (self as any).addEventListener('push', async (event: PushEventType) => {
      console.log('[ServiceWorker] Handling push event...');
      await pushEventHandler.handlePush(event);
    });

    (self as any).addEventListener('notificationclick', async (event: NotificationEventType) => {
      console.log('[ServiceWorker] Handling notification click...');
      await pushEventHandler.handleNotificationClick(event);
    });

    (self as any).addEventListener('notificationclose', (event: NotificationEventType) => {
      console.log('[ServiceWorker] Notification closed:', (event as any).notification?.tag);
    });

    console.log('[ServiceWorker] Push handlers registered');
  }
}
