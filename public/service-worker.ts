/**
 * Service Worker for ResqHub PWA
 * Handles caching, offline support, and app updates
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Cache versions
const CACHE_VERSION = 'v1';
const CACHE_NAME = `resqhub-${CACHE_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Failed to cache some static assets:', err);
          // Continue even if some assets fail
          return cache.add('/').catch(() => {
            console.warn('[SW] Could not cache root');
          });
        });
      }),
    ]).then(() => {
      // Force new service worker to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith('resqhub-')) {
              return undefined;
            }

            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }

            return undefined;
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip WebSocket requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Determine request type and apply appropriate strategy
  if (request.method === 'GET') {
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.includes('.json')
    ) {
      // API requests - network first, fallback to cache
      event.respondWith(handleApiRequest(request));
    } else if (
      url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|font|woff|woff2)$/)
    ) {
      // Static assets - cache first
      event.respondWith(handleStaticRequest(request));
    } else {
      // HTML pages - network first, fallback to cache
      event.respondWith(handlePageRequest(request));
    }
  } else if (request.method === 'POST') {
    // POST requests - try network, but don't cache
    event.respondWith(
      fetch(request).catch(() => {
        return createErrorResponse(
          'Post request failed - offline',
          503
        );
      })
    );
  }
});

/**
 * Cache first strategy (for static assets)
 */
async function handleStaticRequest(request: Request): Promise<Response> {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('[SW] Static request failed:', error);
    return createErrorResponse('Asset not available offline', 404);
  }
}

/**
 * Network first strategy (for API and dynamic content)
 */
async function handleApiRequest(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);

    // Cache successful API responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('[SW] API request failed, checking cache:', error);

    // Try to return cached API response
    const cached = await caches.match(request);
    if (cached) {
      // Add a header to indicate this is from cache
      const cachedResponse = cached.clone();
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-From-Cache', 'true');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers,
      });
    }

    return createErrorResponse('API request failed - offline', 503);
  }
}

/**
 * Network first strategy (for HTML pages)
 */
async function handlePageRequest(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);

    // Cache successful page responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('[SW] Page request failed, checking cache:', error);

    // Try to return cached page
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return createErrorResponse('Page not available offline', 503);
  }
}

/**
 * Create error response
 */
function createErrorResponse(
  message: string,
  status: number = 503
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      status: status,
      timestamp: new Date().toISOString(),
    }),
    {
      status: status,
      statusText: status === 503 ? 'Service Unavailable' : 'Not Found',
      headers: {
        'Content-Type': 'application/json',
        'X-Error': 'true',
      },
    }
  );
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith('resqhub-'))
          .map((name) => caches.delete(name))
      );
    });
  }
});

// Handle background sync for failed requests
self.addEventListener('sync', ((event: ExtendableEvent) => {
  if ((event as any).tag === 'sync-reports') {
    event.waitUntil(syncFailedRequests());
  }
}) as EventListener);

async function syncFailedRequests(): Promise<void> {
  console.log('[SW] Syncing failed requests...');
  // Implementation for background sync
  // This will retry failed requests when connectivity is restored
}

export {};
