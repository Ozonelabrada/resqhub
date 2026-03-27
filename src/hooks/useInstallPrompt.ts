/**
 * useInstallPrompt Hook
 * React hook for PWA installation UI
 */

import { useEffect, useState, useCallback } from 'react';
import {
  getInstallManager,
  getIOSInstallInstructions,
  getAndroidInstallInstructions,
  getDesktopInstallInstructions,
  type InstallPromptState,
} from '@/pwa/installPrompt';

export function useInstallPrompt() {
  const [state, setState] = useState<InstallPromptState>({
    canInstall: false,
    isInstalled: false,
    isInstalling: false,
    installSource: 'unknown',
    userChoice: null,
    errorMessage: null,
  });

  const manager = getInstallManager();

  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, [manager]);

  const showInstallPrompt = useCallback(async () => {
    return await manager.showInstallPrompt();
  }, [manager]);

  const clearError = useCallback(() => {
    manager.clearError();
  }, [manager]);

  return {
    ...state,
    showInstallPrompt,
    clearError,
  };
}

/**
 * Installation instructions hook
 */
export function useInstallInstructions(platform?: 'ios' | 'android' | 'desktop') {
  const { installSource } = useInstallPrompt();
  const targetPlatform = platform || installSource;

  switch (targetPlatform) {
    case 'ios':
      return getIOSInstallInstructions();
    case 'android':
      return getAndroidInstallInstructions();
    case 'desktop':
      return getDesktopInstallInstructions();
    default:
      return [];
  }
}
