/**
 * Cache Strategies
 * Implements common caching patterns for service workers
 */

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';

export interface CacheStrategyOptions {
  cacheName: string;
  networkTimeoutMs?: number;
  expireAfterMs?: number;
}

/**
 * Cache-First Strategy
 * Try cache first, fall back to network
 */
export const cacheFirstStrategy = async (
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> => {
  const { cacheName, networkTimeoutMs = 3000 } = options;

  try {
    // Try cache first
    const cached = await caches.match(request);
    if (cached) {
      console.log(`✅ Cache hit: ${request.url}`);
      return cached;
    }

    // Fall back to network
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), networkTimeoutMs);

    try {
      const response = await fetch(request, { signal: controller.signal });
      clearTimeout(timeoutId);

      // Cache successful response
      if (response.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // If network fails and cache is empty, return offline response
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }

      throw error;
    }
  } catch (error) {
    console.error(`❌ Cache-first strategy failed for ${request.url}:`, error);
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
};

/**
 * Network-First Strategy
 * Try network first, fall back to cache
 */
export const networkFirstStrategy = async (
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> => {
  const { cacheName, networkTimeoutMs = 3000 } = options;

  try {
    // Try network with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), networkTimeoutMs);

    try {
      const response = await fetch(request, { signal: controller.signal });
      clearTimeout(timeoutId);

      // Cache successful response
      if (response.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }

      console.log(`✅ Network fresh: ${request.url}`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Fall back to cache
      console.log(`⏱️  Network timeout, falling back to cache: ${request.url}`);
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      throw error;
    }
  } catch (error) {
    console.error(`❌ Network-first strategy failed for ${request.url}:`, error);
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
};

/**
 * Stale-While-Revalidate Strategy
 * Return cached response immediately, update cache in background
 */
export const staleWhileRevalidateStrategy = async (
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> => {
  const { cacheName } = options;

  try {
    // Check cache first
    const cached = await caches.match(request);

    // Fetch fresh response in background
    const fetchPromise = fetch(request).then((response) => {
      // Cache successful response
      if (response.status === 200) {
        const cache = caches.open(cacheName);
        cache.then((c) => c.put(request, response.clone()));
      }

      return response;
    });

    // Return cached response immediately, or wait for network
    return cached || fetchPromise;
  } catch (error) {
    console.error(`❌ Stale-while-revalidate strategy failed for ${request.url}:`, error);
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
};

/**
 * Network-Only Strategy
 * Always fetch from network
 */
export const networkOnlyStrategy = async (request: Request, options?: CacheStrategyOptions): Promise<Response> => {
  const networkTimeoutMs = options?.networkTimeoutMs ?? 3000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), networkTimeoutMs);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    console.log(`✅ Network response: ${request.url}`);
    return response;
  } catch (error) {
    console.error(`❌ Network-only strategy failed for ${request.url}:`, error);
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Network unavailable', { status: 503 });
  }
};

/**
 * Cache-Only Strategy
 * Only serve from cache
 */
export const cacheOnlyStrategy = async (request: Request): Promise<Response> => {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log(`✅ Cache-only hit: ${request.url}`);
      return cached;
    }

    console.log(`❌ Cache-only miss: ${request.url}`);
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Not in cache', { status: 404 });
  } catch (error) {
    console.error(`❌ Cache-only strategy failed for ${request.url}:`, error);
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
};

/**
 * Strategy selector based on request type
 */
export const selectStrategy = (request: Request): CacheStrategy => {
  const url = new URL(request.url);

  // API calls: Network-first
  if (url.pathname.includes('/api/')) {
    return 'network-first';
  }

  // Images: Cache-first
  if (/\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)) {
    return 'cache-first';
  }

  // Maps: Network-first with cache fallback
  if (url.hostname.includes('openstreetmap') || url.hostname.includes('nominatim') || url.hostname.includes('photon')) {
    return 'network-first';
  }

  // Assets (JS, CSS): Cache-first
  if (/\.(js|css)$/i.test(url.pathname)) {
    return 'cache-first';
  }

  // HTML documents: Network-first
  if (request.headers.get('accept')?.includes('text/html')) {
    return 'network-first';
  }

  // Default: Network-first
  return 'network-first';
};

/**
 * Apply strategy to request
 */
export const applyStrategy = async (
  request: Request,
  strategy: CacheStrategy,
  options: CacheStrategyOptions
): Promise<Response> => {
  switch (strategy) {
    case 'cache-first':
      return cacheFirstStrategy(request, options);
    case 'network-first':
      return networkFirstStrategy(request, options);
    case 'stale-while-revalidate':
      return staleWhileRevalidateStrategy(request, options);
    case 'network-only':
      return networkOnlyStrategy(request, options);
    case 'cache-only':
      return cacheOnlyStrategy(request);
    default:
      return networkFirstStrategy(request, options);
  }
};

export default {
  cacheFirstStrategy,
  networkFirstStrategy,
  staleWhileRevalidateStrategy,
  networkOnlyStrategy,
  cacheOnlyStrategy,
  selectStrategy,
  applyStrategy,
};
