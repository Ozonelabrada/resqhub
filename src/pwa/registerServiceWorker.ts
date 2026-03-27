/**
 * Service Worker Registration Module
 * Handles PWA service worker registration and updates
 */

export interface ServiceWorkerRegistrationOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register the service worker for PWA functionality
 */
export const registerServiceWorker = async (
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser');
    return null;
  }

  try {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;
    
    // In production, use the generated service worker
    // In development, it's auto-registered by vite-plugin-pwa
    if (!isDev && import.meta.env.PROD) {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle registration success
      if (options.onSuccess) {
        options.onSuccess(registration);
      }

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New service worker available');
            if (options.onUpdate) {
              options.onUpdate(registration);
            }
          }
        });
      });

      return registration;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Service Worker registration failed:', err);
    if (options.onError) {
      options.onError(err);
    }
    return null;
  }

  return null;
};

/**
 * Unregister the service worker
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('Failed to unregister Service Worker:', error);
    return false;
  }
};

/**
 * Check for service worker updates
 */
export const checkForUpdates = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Checked for service worker updates');
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
};

/**
 * Reload the app with new service worker
 */
export const reloadWithNewServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });

    // Listen for the service worker to take control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
};

/**
 * Get the current service worker registration
 */
export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (!('serviceWorker' in navigator)) {
    return undefined;
  }

  try {
    return await navigator.serviceWorker.getRegistration();
  } catch (error) {
    console.error('Failed to get Service Worker registration:', error);
    return undefined;
  }
};

/**
 * Post a message to the service worker
 */
export const postMessageToServiceWorker = (
  message: Record<string, any>
): void => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  reloadWithNewServiceWorker,
  getServiceWorkerRegistration,
  postMessageToServiceWorker,
};
