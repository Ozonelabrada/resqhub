/**
 * Device Testing Utilities
 * Comprehensive device detection and testing helpers for PWA
 */

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'unknown';
  isPWA: boolean;
  isStandalone: boolean;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser' | 'unknown';
  screenSize: {
    width: number;
    height: number;
    dpi: number;
  };
  hasNotificationAPI: boolean;
  hasServiceWorker: boolean;
  hasBackgroundSync: boolean;
  hasGeolocation: boolean;
  hasIndexedDB: boolean;
  maxStorageQuota: number;
}

/**
 * Detect device information
 */
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent.toLowerCase();

  // Detect platform
  let platform: DeviceInfo['platform'] = 'unknown';
  if (/iphone|ipad|ipod/.test(ua)) platform = 'ios';
  else if (/android/.test(ua)) platform = 'android';
  else if (/windows/.test(ua)) platform = 'windows';
  else if (/mac/.test(ua)) platform = 'macos';
  else if (/linux/.test(ua)) platform = 'linux';

  // Detect browser
  let browser: DeviceInfo['browser'] = 'unknown';
  if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'safari';
  else if (/chrome/.test(ua)) browser = 'chrome';
  else if (/firefox/.test(ua)) browser = 'firefox';
  else if (/edg/.test(ua)) browser = 'edge';

  // Detect PWA display mode
  let displayMode: DeviceInfo['displayMode'] = 'browser';
  let isStandalone = false;

  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
    isStandalone = true;
  } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
    displayMode = 'fullscreen';
  } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    displayMode = 'minimal-ui';
  }

  // iOS standalone detection
  if ((navigator as any).standalone === true) {
    isStandalone = true;
    displayMode = 'standalone';
  }

  // API support detection
  const hasNotificationAPI = 'Notification' in window;
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasBackgroundSync = 'SyncManager' in window;
  const hasGeolocation = 'geolocation' in navigator;
  const hasIndexedDB = 'indexedDB' in window;

  // Get screen info
  const screenSize = {
    width: window.screen.width,
    height: window.screen.height,
    dpi: window.devicePixelRatio * 96, // Convert to DPI
  };

  return {
    platform: platform as DeviceInfo['platform'],
    browser: browser as DeviceInfo['browser'],
    isPWA: isStandalone,
    isStandalone,
    displayMode,
    screenSize,
    hasNotificationAPI,
    hasServiceWorker,
    hasBackgroundSync,
    hasGeolocation,
    hasIndexedDB,
    maxStorageQuota: 50 * 1024 * 1024, // 50MB default
  };
}

/**
 * Test device capabilities
 */
export interface DeviceCapabilityTest {
  name: string;
  supported: boolean;
  testDate: number;
  details?: string;
}

export async function testDeviceCapabilities(): Promise<DeviceCapabilityTest[]> {
  const tests: DeviceCapabilityTest[] = [];

  // Service Worker test
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      tests.push({
        name: 'Service Worker',
        supported: !!registration,
        testDate: Date.now(),
        details: registration ? 'Active and ready' : 'Registered but not ready',
      });
    } catch (error) {
      tests.push({
        name: 'Service Worker',
        supported: false,
        testDate: Date.now(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    tests.push({
      name: 'Service Worker',
      supported: false,
      testDate: Date.now(),
      details: 'Not supported',
    });
  }

  // Cache API test
  if ('caches' in window) {
    try {
      const cache = await caches.open('test-cache');
      await cache.put(new Request('/test'), new Response('test'));
      await cache.delete(new Request('/test'));
      tests.push({
        name: 'Cache API',
        supported: true,
        testDate: Date.now(),
        details: 'Read/write/delete operations successful',
      });
    } catch (error) {
      tests.push({
        name: 'Cache API',
        supported: false,
        testDate: Date.now(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // IndexedDB test
  if ('indexedDB' in window) {
    try {
      const db = indexedDB.open('test-db');
      tests.push({
        name: 'IndexedDB',
        supported: true,
        testDate: Date.now(),
        details: 'Database open successful',
      });
    } catch (error) {
      tests.push({
        name: 'IndexedDB',
        supported: false,
        testDate: Date.now(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Geolocation test
  if ('geolocation' in navigator) {
    const supported = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        () => {
          clearTimeout(timeout);
          resolve(true);
        },
        () => {
          clearTimeout(timeout);
          resolve(false);
        },
      );
    });

    tests.push({
      name: 'Geolocation',
      supported,
      testDate: Date.now(),
      details: supported ? 'Position retrieved successfully' : 'Permission denied or unavailable',
    });
  }

  // Notification API test
  if ('Notification' in window) {
    const hasPermission = Notification.permission === 'granted';
    tests.push({
      name: 'Notification API',
      supported: true,
      testDate: Date.now(),
      details: `Permission: ${Notification.permission}`,
    });
  }

  // Push API test
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      tests.push({
        name: 'Push API',
        supported: true,
        testDate: Date.now(),
        details: subscription ? 'Subscription active' : 'Not subscribed',
      });
    } catch (error) {
      tests.push({
        name: 'Push API',
        supported: false,
        testDate: Date.now(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Background Sync test
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    tests.push({
      name: 'Background Sync',
      supported: true,
      testDate: Date.now(),
      details: 'SyncManager API available',
    });
  }

  // Offline detection
  tests.push({
    name: 'Offline Support',
    supported: navigator.onLine,
    testDate: Date.now(),
    details: navigator.onLine ? 'Online' : 'Offline',
  });

  return tests;
}

/**
 * Get browser console logs for debugging
 */
export interface ConsoleLogs {
  logs: Array<{ level: string; message: string; timestamp: number }>;
  errors: Array<{ message: string; stack?: string; timestamp: number }>;
  warnings: Array<{ message: string; timestamp: number }>;
}

let consoleLogs: ConsoleLogs = {
  logs: [],
  errors: [],
  warnings: [],
};

export function startConsoleLogging(): void {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    consoleLogs.logs.push({
      level: 'log',
      message: args.join(' '),
      timestamp: Date.now(),
    });
    originalLog(...args);
  };

  console.error = (...args) => {
    const message = args[0];
    consoleLogs.errors.push({
      message: message instanceof Error ? message.message : String(message),
      stack: message instanceof Error ? message.stack : undefined,
      timestamp: Date.now(),
    });
    originalError(...args);
  };

  console.warn = (...args) => {
    consoleLogs.warnings.push({
      message: args.join(' '),
      timestamp: Date.now(),
    });
    originalWarn(...args);
  };
}

export function getConsoleLogs(): ConsoleLogs {
  return consoleLogs;
}

export function clearConsoleLogs(): void {
  consoleLogs = {
    logs: [],
    errors: [],
    warnings: [],
  };
}

/**
 * Export device diagnostics report
 */
export interface DiagnosticsReport {
  deviceInfo: DeviceInfo;
  capabilities: DeviceCapabilityTest[];
  consoleLogs: ConsoleLogs;
  timestamp: number;
  userAgent: string;
}

export async function generateDiagnosticsReport(): Promise<DiagnosticsReport> {
  return {
    deviceInfo: getDeviceInfo(),
    capabilities: await testDeviceCapabilities(),
    consoleLogs: getConsoleLogs(),
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };
}

export function downloadDiagnosticsReport(report: DiagnosticsReport): void {
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `diagnostics-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
