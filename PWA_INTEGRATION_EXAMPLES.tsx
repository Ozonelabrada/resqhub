/**
 * PWA Integration Examples
 * Complete working examples for integrating PWA features into your app
 */

// ============================================================================
// EXAMPLE 1: Basic Setup in main.tsx
// ============================================================================

/*
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { pwaServiceWorkerManager } from './services'

// Initialize PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('[PWA] Initializing service worker...')
      const registration = await pwaServiceWorkerManager.init()
      console.log('[PWA] Service worker initialized:', registration)
    } catch (error) {
      console.error('[PWA] Failed to initialize:', error)
    }
  })
}

// Listen for update notifications
window.addEventListener('pwa-update-available', (event) => {
  console.log('[PWA] Update available:', event.detail)
  // Show notification to user
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
*/

// ============================================================================
// EXAMPLE 2: App.tsx - Add Installation Banner
// ============================================================================

/*
import { useEffect, useState } from 'react'
import { InstallBanner } from '@/components/features'
import { useAppConfig } from '@/hooks'
import Router from './routes'
import Layout from './layouts/PublicLayout'

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { appConfig, loading } = useAppConfig()

  useEffect(() => {
    // Initialize app
    setIsInitialized(true)
  }, [])

  if (!isInitialized || loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      {/* PWA Installation Banner */}
      <InstallBanner />
      
      {/* Main App Content */}
      <Layout>
        <Router />
      </Layout>
    </>
  )
}
*/

// ============================================================================
// EXAMPLE 3: Header Component - Add Install Button
// ============================================================================

/*
import { InstallButton } from '@/components/features'
import { useAuth } from '@/hooks'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ResqHub</h1>
        
        <div className="flex items-center gap-4">
          {/* Install Button */}
          <InstallButton 
            variant="primary" 
            size="md"
            className="hidden md:block"
          />
          
          {/* User Menu */}
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
*/

// ============================================================================
// EXAMPLE 4: Settings Page - Show Install Card
// ============================================================================

/*
import { InstallCard } from '@/components/features'
import { useAuth } from '@/hooks'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* PWA Installation Card */}
      <div className="mb-8">
        <InstallCard />
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">General</h2>
        {/* Settings content */}
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <p>Email: {user?.email}</p>
        {/* Account content */}
      </div>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 5: Custom Component Using useInstallPrompt Hook
// ============================================================================

/*
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function CustomInstallComponent() {
  const {
    canInstall,
    isInstalled,
    isInstalling,
    installSource,
    errorMessage,
    showInstallPrompt,
    clearError,
  } = useInstallPrompt()

  if (isInstalled) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
        <p className="text-green-700">✅ App is installed on your device!</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg">
      <h3 className="font-bold text-blue-900 mb-2">Install ResqHub</h3>
      <p className="text-blue-800 mb-4">
        Get the best experience by installing ResqHub on your device.
      </p>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
          {errorMessage}
          <button onClick={clearError} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      <button
        onClick={showInstallPrompt}
        disabled={!canInstall || isInstalling}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isInstalling ? 'Installing...' : 'Install Now'}
      </button>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 6: Modal Installation Dialog
// ============================================================================

/*
import { useState } from 'react'
import { InstallModal } from '@/components/features'

export function HomePage() {
  const [showInstallModal, setShowInstallModal] = useState(false)

  return (
    <>
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to ResqHub</h1>
        
        <button
          onClick={() => setShowInstallModal(true)}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          📱 Install App
        </button>
      </div>

      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  )
}
*/

// ============================================================================
// EXAMPLE 7: Handling App Updates
// ============================================================================

/*
import { useEffect, useState } from 'react'
import { pwaServiceWorkerManager } from '@/services'

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('Update available:', customEvent.detail)
      setUpdateAvailable(true)
    }

    window.addEventListener('pwa-update-available', handleUpdateAvailable)
    return () =>
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
  }, [])

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
      <p className="mb-2">App update available!</p>
      <button
        onClick={async () => {
          await pwaServiceWorkerManager.skipWaiting()
        }}
        className="px-4 py-1 bg-white text-blue-600 rounded hover:bg-blue-50"
      >
        Update Now
      </button>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 8: Offline Detection
// ============================================================================

/*
import { useEffect, useState } from 'react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center">
      📡 You're offline. Some features may be limited.
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 9: Service Worker Management UI
// ============================================================================

/*
import { pwaServiceWorkerManager } from '@/services'

export function DeveloperTools() {
  const handleClearCache = async () => {
    if (confirm('Clear all caches? This will remove offline data.')) {
      await pwaServiceWorkerManager.clearCaches()
      alert('Caches cleared!')
    }
  }

  const handleCheckUpdate = async () => {
    const registration = pwaServiceWorkerManager.getRegistration()
    if (registration) {
      await registration.update()
      alert('Checked for updates')
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-3">PWA Tools (Dev Only)</h3>
      
      <div className="flex gap-2">
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Cache
        </button>
        
        <button
          onClick={handleCheckUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check for Updates
        </button>
      </div>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 10: Complete App.tsx Integration
// ============================================================================

/*
import { useEffect, useState } from 'react'
import { InstallBanner } from '@/components/features'
import { UpdateNotification } from '@/components/UpdateNotification'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import Router from './routes'
import Layout from './layouts/PublicLayout'

export default function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Simulate app initialization
    setIsReady(true)
  }, [])

  if (!isReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <>
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Installation Banner */}
      <InstallBanner />

      {/* Update Notification */}
      <UpdateNotification />

      {/* Main App */}
      <Layout>
        <Router />
      </Layout>
    </>
  )
}
*/

// ============================================================================
// EXPORT FOR QUICK ACCESS
// ============================================================================

export default {
  basicSetup: 'EXAMPLE 1: Check main.tsx',
  appLayout: 'EXAMPLE 2: Check App.tsx',
  headerComponent: 'EXAMPLE 3: Check Header',
  settingsPage: 'EXAMPLE 4: Check Settings',
  customComponent: 'EXAMPLE 5: Uses useInstallPrompt hook',
  modalDialog: 'EXAMPLE 6: InstallModal component',
  updateHandling: 'EXAMPLE 7: Handle app updates',
  offlineDetection: 'EXAMPLE 8: Detect offline status',
  developerTools: 'EXAMPLE 9: Dev tools for PWA',
  completeApp: 'EXAMPLE 10: Full integration in App.tsx',
}
