# ResqHub PWA Implementation Guide

## Overview

This document provides comprehensive information about the PWA (Progressive Web App) implementation for ResqHub, including architecture, features, testing procedures, and deployment guidelines.

## Table of Contents

- [Architecture](#architecture)
- [Core Features](#core-features)
- [Installation & Setup](#installation--setup)
- [Testing Guide](#testing-guide)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

---

## Architecture

### Project Structure

```
src/
├── pwa/
│   ├── registerServiceWorker.ts      # Service Worker registration
│   ├── pwaManager.ts                 # PWA lifecycle management
│   ├── cacheManager.ts               # Cache API utilities
│   ├── cacheStrategies.ts            # 5 caching strategies
│   ├── offlineStorage.ts             # IndexedDB management
│   ├── syncQueue.ts                  # Offline action queuing
│   ├── notificationManager.ts        # Push notifications
│   ├── pushEventHandlers.ts          # Service Worker push events
│   ├── backgroundSync.ts             # Background Sync API
│   ├── websocketManager.ts           # WebSocket with reconnection
│   ├── geolocationManager.ts         # Location tracking
│   ├── deviceTesting.ts              # Device capabilities testing
│   ├── performanceMonitoring.ts      # Performance metrics
│   └── index.ts                      # Consolidated exports
├── hooks/
│   ├── usePWAInstall.ts
│   ├── useOnlineStatus.ts
│   ├── useCacheManagement.ts
│   ├── useNetworkStatus.ts
│   ├── useOfflineStorage.ts
│   ├── useSyncQueue.ts
│   ├── useNotificationSubscription.ts
│   ├── useBackgroundSync.ts
│   ├── useWebSocketOptimized.ts
│   ├── useRiderLocation.ts
│   ├── usePerformanceMonitoring.ts
│   └── index.ts
└── services/
    ├── pwaService.ts                 # High-level PWA API
    └── ...
```

### Technology Stack

- **Build Tool**: Vite 7 with VitePWA plugin
- **Service Worker**: Workbox (auto-generated)
- **State Management**: React 19 hooks
- **Offline Storage**: IndexedDB
- **Caching**: Cache API with 5 strategies
- **Real-time**: WebSocket + SignalR
- **Location**: Geolocation API
- **Push**: Web Push API with VAPID

---

## Core Features

### Phase 1: Foundation
- ✅ Service Worker registration and lifecycle
- ✅ PWA manifest with app metadata
- ✅ Installation prompts (desktop & mobile)
- ✅ Auto-update detection
- ✅ Standalone/fullscreen display modes

### Phase 2: Caching
- ✅ 5 cache strategies:
  - Cache-First (assets, images)
  - Network-First (API calls)
  - Stale-While-Revalidate (reports)
  - Network-Only (real-time data)
  - Cache-Only (fallback pages)
- ✅ Runtime cache management
- ✅ Cache cleanup utilities
- ✅ Offline fallback page

### Phase 3: Offline Support
- ✅ IndexedDB storage with 4 stores:
  - booking_drafts
  - cached_reports
  - user_preferences
  - sync_metadata
- ✅ Automatic draft saving
- ✅ 30-day retention policy
- ✅ Storage quota monitoring

### Phase 4: Push Notifications
- ✅ VAPID key management
- ✅ Subscription lifecycle
- ✅ Push event handling
- ✅ Action buttons support
- ✅ Smart routing

### Phase 5: Real-time & Sync
- ✅ Background Sync API for pending actions
- ✅ WebSocket manager with auto-reconnection
- ✅ Exponential backoff strategy
- ✅ Message queuing
- ✅ Real-time location tracking
- ✅ Rider dashboard updates

### Phase 6: Testing & Optimization
- ✅ Device capability detection
- ✅ Performance monitoring
- ✅ Core Web Vitals tracking
- ✅ Memory and battery monitoring
- ✅ Diagnostics report generation

### Phase 7: Deployment
- ✅ CI/CD pipeline setup
- ✅ PWA validation
- ✅ Performance budgets
- ✅ Automated deployment

---

## Installation & Setup

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # .env
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   VITE_WEBSOCKET_URL=wss://your-websocket-url.com
   VITE_API_BASE_URL=https://your-api-url.com
   ```

3. **Generate VAPID keys** (if needed):
   ```bash
   # Using web-push CLI
   npx web-push generate-vapid-keys
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy to Vercel or your hosting:**
   ```bash
   npm run deploy
   ```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Testing Guide

### Unit Testing

Test individual PWA modules:

```typescript
import { getDeviceInfo, testDeviceCapabilities } from '@/pwa/deviceTesting';

// Test device detection
const device = getDeviceInfo();
console.log('Platform:', device.platform);
console.log('PWA Mode:', device.isPWA);

// Test capabilities
const capabilities = await testDeviceCapabilities();
console.log('Capabilities:', capabilities);
```

### Device Testing

#### iOS Testing

1. **Using Safari:**
   - Open ResqHub URL in Safari
   - Tap Share → Add to Home Screen
   - Launch from home screen
   - Test offline mode: Settings → Wi-Fi → turn off
   - Test notifications (iOS 16+)

2. **Using TestFlight:**
   ```bash
   # Build and upload to TestFlight
   npm run build
   # Then use Xcode to deploy
   ```

3. **Debugging:**
   ```
   Safari → Develop → [Device Name] → [App]
   ```

#### Android Testing

1. **Using Chrome DevTools:**
   - Chrome → DevTools (F12)
   - Application → Service Workers
   - Check "Update on reload"

2. **Using Android Studio:**
   ```bash
   # Preview on Android emulator
   npm run build
   # Then run on Android device via ADB
   ```

3. **Debugging:**
   ```
   chrome://inspect → [Device] → Inspect
   ```

### Capability Testing

```typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

function TestPanel() {
  const { capabilities, startMonitoring, metrics, recommendations } = 
    usePerformanceMonitoring();

  return (
    <div>
      <h2>Device Capabilities</h2>
      {capabilities.map(cap => (
        <div key={cap.name}>
          {cap.supported ? '✓' : '✗'} {cap.name}: {cap.details}
        </div>
      ))}
      
      <h2>Performance Metrics</h2>
      {metrics && (
        <>
          <p>LCP: {metrics.largestContentfulPaint}ms</p>
          <p>FID: {metrics.firstInputDelay}ms</p>
          <p>CLS: {metrics.cumulativeLayoutShift}</p>
        </>
      )}
      
      <h2>Recommendations</h2>
      {recommendations.map((rec, i) => (
        <p key={i}>{rec}</p>
      ))}
      
      <button onClick={() => startMonitoring()}>
        Start Monitoring
      </button>
    </div>
  );
}
```

### Offline Testing

1. **DevTools Throttling:**
   - DevTools → Network → Throttling → Offline
   - Test app functionality
   - Verify sync queue works

2. **Service Worker Testing:**
   - DevTools → Application → Service Workers
   - Check registered workers
   - Verify cache contents
   - Test update mechanism

3. **Background Sync Testing:**
   ```typescript
   import { registerBackgroundSync, SyncTags } from '@/pwa/backgroundSync';
   
   // Manually trigger background sync
   await registerBackgroundSync(SyncTags.SYNC_PENDING_BOOKINGS);
   ```

### Lighthouse Audit

```bash
# Run Lighthouse audit
npm run lighthouse

# Or manually in Chrome DevTools:
# DevTools → Lighthouse → Generate report
```

**PWA Audit Checklist:**
- [ ] Installable: Has manifest + HTTPS
- [ ] Has a service worker
- [ ] Has a web app manifest
- [ ] Start URL works when offline
- [ ] Asset caching
- [ ] Page load performance
- [ ] Core Web Vitals

---

## Performance Optimization

### Caching Strategies

**Cache-First** (Static Assets):
```typescript
// Images, fonts, CSS, JS
applyStrategy('cache-first', {
  cacheName: 'static-assets',
  networkTimeoutMs: 3000,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});
```

**Network-First** (API Calls):
```typescript
// API endpoints, dynamic content
applyStrategy('network-first', {
  cacheName: 'api-cache',
  networkTimeoutMs: 5000,
  maxAge: 5 * 60 * 1000 // 5 minutes
});
```

**Stale-While-Revalidate** (Reports):
```typescript
// User reports, reports data
applyStrategy('stale-while-revalidate', {
  cacheName: 'reports-cache',
  networkTimeoutMs: 3000
});
```

### Core Web Vitals Optimization

**LCP (Largest Contentful Paint) < 2.5s:**
- Preload critical resources
- Minimize main bundle size
- Use code splitting
- Optimize images

**FID (First Input Delay) < 100ms:**
- Break up long tasks
- Use RequestIdleCallback
- Defer non-critical JavaScript
- Optimize Third-party scripts

**CLS (Cumulative Layout Shift) < 0.1:**
- Use fixed dimensions for images
- Avoid inserting content above existing
- Use transform for animations
- Preload fonts

### Battery & Network Optimization

**Battery Saving:**
```typescript
// Reduce update frequency on low battery
if (batteryLevel < 20 && !batteryCharging) {
  syncInterval = 5 * 60 * 1000; // 5 minutes
  locationUpdateInterval = 30 * 1000; // 30 seconds
}
```

**Network Awareness:**
```typescript
// Adjust based on connection type
const connection = navigator.connection?.effectiveType;
if (connection === '4g') {
  // Aggressive prefetching
} else if (connection === '2g') {
  // Minimal prefetching, higher compression
}
```

---

## Troubleshooting

### Common Issues

#### Service Worker Not Registering

```typescript
// Check if registered
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    console.log('SW Registrations:', registrations);
  });

// Check browser console for errors
// Ensure HTTPS (except localhost)
```

#### Cache Not Working

```typescript
// Clear caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Disable cache in DevTools
// DevTools → Network → Disable cache (checked)
```

#### Push Notifications Not Received

1. **Check subscription:**
   ```typescript
   const registration = await navigator.serviceWorker.ready;
   const subscription = await registration.pushManager.getSubscription();
   console.log('Subscription:', subscription);
   ```

2. **Verify VAPID keys:**
   - Check `.env` file
   - Verify keys match backend
   - Regenerate if needed

3. **Check browser settings:**
   - Settings → Notifications → ResqHub (Allowed)
   - Check system notifications

#### Offline Actions Not Syncing

1. **Check sync queue:**
   ```typescript
   import { getPendingActions } from '@/pwa/syncQueue';
   const pending = await getPendingActions();
   console.log('Pending actions:', pending);
   ```

2. **Check background sync registration:**
   ```typescript
   const registration = await navigator.serviceWorker.ready;
   const tags = await registration.sync.getTags();
   console.log('Sync tags:', tags);
   ```

3. **Force sync:**
   ```typescript
   import { forceSync } from '@/pwa/syncQueue';
   await forceSync();
   ```

---

## Deployment

### Vercel Deployment

1. **Connect repository:**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Configure environment:**
   - Add `VITE_VAPID_PUBLIC_KEY` in Vercel dashboard
   - Set production URL

3. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

### GitHub Pages Deployment

```bash
# Build static site
npm run build

# Deploy dist folder to gh-pages branch
npm run deploy
```

### Docker Deployment

```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t resqhub-pwa .
docker run -p 80:80 resqhub-pwa
```

### Performance Budgets

Set up Webpack/Vite budgets:

```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'pwa': ['src/pwa/index.ts'],
        'vendor': ['react', 'react-dom']
      }
    }
  },
  chunkSizeWarningLimit: 1000 // 1MB
}
```

---

## Monitoring & Analytics

### Send Diagnostics to Backend

```typescript
import { generateDiagnosticsReport } from '@/pwa/deviceTesting';

async function sendDiagnostics() {
  const report = await generateDiagnosticsReport();
  
  await fetch('/api/diagnostics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
}
```

### Performance Analytics

```typescript
import { getPerformanceMonitor } from '@/pwa/performanceMonitoring';

const monitor = getPerformanceMonitor();
monitor.startMonitoring(60000); // Update every 60 seconds

monitor.onMetricsUpdate(metrics => {
  // Send to analytics service
  analytics.track('pwa_metrics', {
    lcp: metrics.largestContentfulPaint,
    fid: metrics.firstInputDelay,
    cls: metrics.cumulativeLayoutShift,
    memory: metrics.memoryUsage,
    battery: metrics.batteryLevel
  });
});
```

---

## Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web Vitals](https://web.dev/vitals/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## Support & Contributing

For issues or questions about the PWA implementation:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Open a new issue with diagnostics report
4. Contact the development team

---

**Last Updated**: March 27, 2026  
**PWA Version**: 5.0 (All Phases Complete)
