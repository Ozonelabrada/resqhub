/**
 * PWA Installation Hook
 * Manages the app installation prompt and PWA install state
 */

import { useState, useEffect, useCallback } from 'react';

export interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptToInstall: () => Promise<void>;
  dismissPrompt: () => void;
  deferPrompt: () => void;
}

/**
 * Hook to manage PWA installation
 */
export const usePWAInstall = (): UsePWAInstallReturn => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if app is installed on iOS
    if ((navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as PWAInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for when the app is actually installed
    const handleAppInstalled = () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptToInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, []);

  const deferPrompt = useCallback(() => {
    // Deferred prompt will be shown later
    // This is handled by keeping deferredPrompt in state
  }, []);

  return {
    isInstallable,
    isInstalled,
    promptToInstall,
    dismissPrompt,
    deferPrompt,
  };
};

export default usePWAInstall;
