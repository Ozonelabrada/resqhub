# PWA Setup and Integration Checklist

## 📋 Pre-Integration Requirements

Before integrating the PWA features, ensure you have:
- [ ] HTTPS enabled (PWA requires HTTPS)
- [ ] Service worker support (modern browsers only)
- [ ] Manifest.json file (already provided)
- [ ] Icons in proper sizes (192x192, 512x512 PNG)
- [ ] Updated index.html with manifest link

## 🔧 Setup Steps

### Step 1: Update index.html

Add the manifest link in the `<head>` section:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- PWA Configuration -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0d9488" />
    <meta name="description" content="Community-driven disaster response and emergency reporting platform" />
    
    <!-- iOS PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ResqHub" />
    <link rel="apple-touch-icon" href="/assets/images/icon-192x192.png" />
    
    <title>ResqHub - Emergency Response & Community Support</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 2: Initialize Service Worker in main.tsx

Update your `src/main.tsx` to register the service worker:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { pwaServiceWorkerManager } from './services'

// Initialize PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await pwaServiceWorkerManager.init()
      console.log('PWA Service Worker initialized')
    } catch (error) {
      console.error('Failed to initialize PWA:', error)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 3: Add Installation Banner to App Layout

Update your layout component (typically in `src/layouts/PublicLayout.tsx` or `src/App.tsx`):

```typescript
import { InstallBanner } from '@/components/features'

export function PublicLayout({ children }) {
  return (
    <>
      <InstallBanner />
      <main>{children}</main>
    </>
  )
}
```

### Step 4: Prepare App Icons

Create or generate icons in these sizes and save to `public/assets/images/`:

| Size | Filename | Purpose |
|------|----------|---------|
| 192x192 | icon-192x192.png | Android home screen |
| 512x512 | icon-512x512.png | Android splash screen |
| 192x192 | icon-192x192-maskable.png | Adaptive icons (Android) |
| 512x512 | icon-512x512-maskable.png | Adaptive icons (Android) |
| 540x720 | screenshot-540x720.png | Mobile app store |
| 1280x720 | screenshot-1280x720.png | Desktop app store |

**Quick icon generation:**
```bash
# Using ImageMagick (if installed)
convert original-icon.png -resize 192x192 icon-192x192.png
convert original-icon.png -resize 512x512 icon-512x512.png
```

### Step 5: Configure Build Output

Ensure `vite.config.ts` is properly configured:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Ensure service worker is properly built
    copyPublicDir: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  optimizeDeps: {
    exclude: ['public/service-worker.ts'],
  },
})
```

### Step 6: Update Service Worker Build

Add this to your build script to compile the TypeScript service worker:

**option A: Using TSC directly**
```bash
tsc public/service-worker.ts --outDir public --target ES2020 --lib ES2020,DOM
```

**Option B: In package.json**
```json
{
  "scripts": {
    "build": "tsc public/service-worker.ts --outDir public --target ES2020 --lib ES2020,DOM && vite build",
    "build:sw": "tsc public/service-worker.ts --outDir public --target ES2020 --lib ES2020,DOM"
  }
}
```

**Option C: Create a shell script** (`scripts/build-sw.sh`)
```bash
#!/bin/bash
echo "Building service worker..."
tsc public/service-worker.ts --outDir public --target ES2020 --lib ES2020,DOM
if [ $? -eq 0 ]; then
  echo "Service worker built successfully"
else
  echo "Service worker build failed"
  exit 1
fi
```

## 🎯 Integration Checklist

After completing setup, verify:

### General Setup
- [ ] HTTPS enabled on production
- [ ] Manifest.json linked in index.html
- [ ] Service worker compiles without errors
- [ ] All required files present in public/

### Icons & Media
- [ ] 192x192 icon created and placed
- [ ] 512x512 icon created and placed
- [ ] Maskable icons created (optional but recommended)
- [ ] Screenshots created for app stores
- [ ] All paths in manifest.json correct

### Code Integration
- [ ] Service worker manager imported in main.tsx
- [ ] Installation banner added to layout
- [ ] useInstallPrompt hook available in components
- [ ] No console errors on initial load

### Testing
- [ ] Install prompt appears when expected
- [ ] App installs successfully
- [ ] Offline.html displays when offline
- [ ] Cache works correctly
- [ ] Updates detected and notified

## 🧪 Testing PWA Features

### Test Installation
```bash
# Use Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check Manifest loading
4. Verify Service Worker registration
5. Look for Install button in address bar
```

### Test Offline
```bash
# In Chrome DevTools
1. Go to Application > Service Workers
2. Check "Offline" checkbox
3. Reload page - should show cached content
4. Try accessing new pages
```

### Test Service Worker Updates
```javascript
// In browser console
navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' })
```

### Test Cache
```javascript
// In browser console
caches.keys().then(names => console.log(names))
caches.open('resqhub-v1').then(cache => cache.keys().then(keys => console.log(keys)))
```

## 🐛 Debugging Guide

### Service Worker Not Registering
1. Check browser console for errors
2. Verify service-worker.js is compiled and in public/
3. Ensure HTTPS in production
4. Check manifest.json validity

### Installation Prompt Not Showing
1. Click menu → Install (Chrome) or use share → Add to Home Screen
2. Verify manifest.json meets PWA requirements
3. Check if already installed
4. Try in incognito/private mode

### Cache Issues
```typescript
// Clear all caches programmatically
await pwaServiceWorkerManager.clearCaches()

// Or in console
caches.keys().then(names => 
  Promise.all(names.map(name => caches.delete(name)))
)
```

### Service Worker Update Issues
```typescript
// Skip waiting and activate immediately
await pwaServiceWorkerManager.skipWaiting()
```

## 📊 Performance Considerations

### Bundle Size Impact
- Service Worker: ~8KB (gzip)
- Components: ~15KB (gzip)
- Manifest & Config: ~5KB

### Caching Impact
- Typical app cache: 10-50MB
- Configurable in service-worker.ts
- Monitor disk usage regularly

### Memory Impact
- Minimal after initialization
- Service worker runs in background
- No significant impact on app performance

## 🔐 Security Best Practices

1. **HTTPS Only**: PWA requires HTTPS in production
2. **Scope Isolation**: Service worker limited to `/` scope
3. **Cache Validation**: Validate cached API responses
4. **Update Frequency**: Check for updates every 60s
5. **Error Handling**: Gracefully handle offline scenarios

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All icons in place with correct sizes
- [ ] Service worker compiles without errors
- [ ] Manifest.json validates at web.dev/pwacheck
- [ ] HTTPS certificate valid and renewed
- [ ] Update interval configured (~60s)
- [ ] Cache strategies reviewed and tested
- [ ] Error pages (offline.html) in public/
- [ ] Performance budget not exceeded
- [ ] Cross-browser testing completed

## 🆘 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Service worker not found | File not compiled | Run build script for service worker |
| Install button not showing | Manifest incomplete | Validate manifest at web.dev/pwacheck |
| Offline page not showing | Wrong cache path | Update service-worker.ts offline path |
| Updates not detected | Cache too aggressive | Reduce update check interval |
| Icons distorted | Wrong size or format | Use PNG, ensure exact dimensions |
| App crashes offline | Missing cached resources | Add more items to STATIC_ASSETS |

## 📚 Additional Resources

- [Web.dev PWA Checklist](https://web.dev/install-criteria/)
- [PWA Validator](https://www.pwabuilder.com/)
- [Manifest Validator](https://manifest-validator.appspot.com/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 🎓 Next Steps

After successful integration:
1. Test on multiple devices
2. Gather user feedback on install prompt
3. Monitor analytics for installation rates
4. Optimize cache strategies based on usage
5. Add push notifications
6. Implement background sync
7. Set up analytics for PWA metrics

---

Last Updated: 2024
