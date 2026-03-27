/**
 * PWA Install Prompt UI Components
 * Pre-built components for displaying install prompts to users
 */

import { useState } from 'react';
import { useInstallPrompt, useInstallInstructions } from '@/hooks/useInstallPrompt';

/**
 * Install Banner Component
 * Shows a non-intrusive banner at the top or bottom of the page
 */
export function InstallBanner() {
  const { canInstall, isInstalled, showInstallPrompt, isInstalling, errorMessage, clearError } =
    useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !canInstall || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 shadow-lg z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">📱 Install ResqHub</h3>
          <p className="text-sm text-teal-100">Get the app on your home screen for quick access</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsDismissed(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-700 hover:bg-teal-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={showInstallPrompt}
            disabled={isInstalling}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-50"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Install Card Component
 * Standalone card for install CTA
 */
export function InstallCard() {
  const { canInstall, isInstalled, isInstalling, showInstallPrompt } = useInstallPrompt();

  if (isInstalled) {
    return (
      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">✅ ResqHub Installed!</h3>
        <p className="text-green-700">You can now access ResqHub from your home screen.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">📱 Install ResqHub App</h3>
      <p className="text-blue-700 mb-4">
        Get instant access to ResqHub. Install it on your device for the best experience.
      </p>

      <button
        onClick={showInstallPrompt}
        disabled={!canInstall || isInstalling}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isInstalling ? 'Installing...' : canInstall ? 'Install Now' : 'Installation Not Available'}
      </button>
    </div>
  );
}

/**
 * Install Modal Component
 * Modal dialog for installation
 */
export function InstallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { canInstall, isInstalled, isInstalling, showInstallPrompt, errorMessage, clearError } =
    useInstallPrompt();
  const instructions = useInstallInstructions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📱 Install ResqHub</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-teal-700 w-8 h-8 flex items-center justify-center rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isInstalled ? (
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">Already Installed!</h3>
              <p className="text-gray-600">
                ResqHub is already installed on your device. You can launch it anytime from your home
                screen.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6">
                Get ResqHub on your device for faster access and offline functionality.
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {errorMessage}
                  <button
                    onClick={clearError}
                    className="ml-2 font-semibold hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {instructions.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Installation Steps:</h4>
                  <ol className="space-y-2">
                    {instructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-700 leading-relaxed">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                onClick={showInstallPrompt}
                disabled={!canInstall || isInstalling}
                className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isInstalling ? 'Installing...' : canInstall ? 'Install Now' : 'Check Compatibility'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Install Button Component
 * Simple button trigger
 */
export function InstallButton({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { canInstall, isInstalled, isInstalling, showInstallPrompt } = useInstallPrompt();

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
  };

  if (isInstalled) {
    return (
      <button
        disabled
        className={`rounded-lg font-semibold transition-colors opacity-50 cursor-not-allowed ${sizeClasses[size]} ${className}`}
      >
        ✓ Installed
      </button>
    );
  }

  return (
    <button
      onClick={showInstallPrompt}
      disabled={!canInstall || isInstalling}
      className={`rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isInstalling ? '⏳ Installing...' : canInstall ? '📱 Install App' : 'Not Available'}
    </button>
  );
}

/**
 * Full-Page Install Page
 * Dedicated page for PWA installation
 */
export function InstallPage() {
  const {
    canInstall,
    isInstalled,
    isInstalling,
    installSource,
    showInstallPrompt,
    errorMessage,
    clearError,
  } = useInstallPrompt();
  const instructions = useInstallInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Install ResqHub</h1>
          <p className="text-xl text-gray-600">
            Get the app on your device for the best experience
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {isInstalled ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">All Set!</h2>
              <p className="text-gray-600 mb-6">
                ResqHub is installed and ready to use on your device. You can launch it anytime from
                your home screen or app drawer.
              </p>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  💡 Tip: Pin resqhub to your taskbar for even faster access!
                </p>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-red-800 font-semibold mb-2">Installation Error</h3>
                  <p className="text-red-700 mb-3">{errorMessage}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800 underline font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-6">
                  ResqHub is a Progressive Web App that works like a native mobile app. Here's how to
                  install it:
                </p>

                {/* Platform Specific Instructions */}
                {installSource !== 'unknown' && (
                  <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Instructions for {installSource.charAt(0).toUpperCase() + installSource.slice(1)}
                    </h3>
                    <ol className="space-y-3">
                      {instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-4">
                          <span className="font-bold text-blue-600 flex-shrink-0">
                            {instruction[0]}
                          </span>
                          <span className="text-gray-700">{instruction.slice(2)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Install Button */}
                <button
                  onClick={showInstallPrompt}
                  disabled={!canInstall || isInstalling}
                  className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInstalling ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Installing...
                    </span>
                  ) : canInstall ? (
                    '📥 Install ResqHub Now'
                  ) : (
                    '⚠️ Installation Not Available on This Browser'
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-2">🔄</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Works Offline</h3>
                  <p className="text-gray-600 text-sm">
                    Use ResqHub even without an internet connection
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Instant launch and smooth performance
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-2">🔔</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Push Notifications</h3>
                  <p className="text-gray-600 text-sm">
                    Stay updated with real-time notifications
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-2">💾</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Save Space</h3>
                  <p className="text-gray-600 text-sm">
                    Lightweight app with minimal storage requirements
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Browser Support */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Supported Browsers</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Chrome', icon: '🟢' },
              { name: 'Firefox', icon: '🟠' },
              { name: 'Safari', icon: '🔵' },
              { name: 'Edge', icon: '🔷' },
            ].map((browser) => (
              <div key={browser.name} className="text-center">
                <div className="text-3xl mb-2">{browser.icon}</div>
                <p className="font-semibold text-gray-700">{browser.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
