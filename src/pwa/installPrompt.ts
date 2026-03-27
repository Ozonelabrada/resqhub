/**
 * PWA Install Prompt Manager
 * Handles install prompts and provides UI for mobile app installation
 */

export interface InstallPromptState {
  canInstall: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  installSource: 'android' | 'ios' | 'desktop' | 'unknown';
  userChoice: 'accepted' | 'dismissed' | null;
  errorMessage: string | null;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private state: InstallPromptState = {
    canInstall: false,
    isInstalled: false,
    isInstalling: false,
    installSource: 'unknown',
    userChoice: null,
    errorMessage: null,
  };
  private listeners: Set<(state: InstallPromptState) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    this.checkInstallState();
    this.setupListeners();
  }

  private checkInstallState(): void {
    const ua = navigator.userAgent.toLowerCase();
    
    // Detect iOS
    if (/iphone|ipad|ipod/.test(ua)) {
      this.state.installSource = 'ios';
      this.state.isInstalled = (navigator as any).standalone === true;
    }
    // Detect Android
    else if (/android/.test(ua)) {
      this.state.installSource = 'android';
      this.state.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    }
    // Desktop
    else {
      this.state.installSource = 'desktop';
      this.state.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    }

    this.notify();
  }

  private setupListeners(): void {
    // Listen for beforeinstallprompt (Android)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.state.canInstall = true;
      console.log('💾 Install prompt available');
      this.notify();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.state.isInstalled = true;
      this.deferredPrompt = null;
      this.state.canInstall = false;
      console.log('✅ ResqHub installed successfully!');
      this.notify();
    });

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addListener((e: any) => {
      this.state.isInstalled = e.matches;
      this.notify();
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.state.isInstalled = true;
    }
    if ((navigator as any).standalone === true) {
      this.state.isInstalled = true;
    }
  }

  /**
   * Show install prompt programmatically
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    this.state.isInstalling = true;
    this.notify();

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      this.state.userChoice = outcome as 'accepted' | 'dismissed';
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted installation');
        this.state.isInstalled = true;
      } else {
        console.log('❌ User dismissed installation');
      }

      this.deferredPrompt = null;
    } catch (error) {
      this.state.errorMessage = error instanceof Error ? error.message : 'Installation failed';
      console.error('Installation error:', error);
    } finally {
      this.state.isInstalling = false;
      this.state.canInstall = false;
      this.notify();
    }

    return this.state.userChoice === 'accepted';
  }

  /**
   * Get current installation state
   */
  public getState(): InstallPromptState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: InstallPromptState) => void): () => void {
    this.listeners.add(listener);
    // Notify immediately with current state
    listener(this.state);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error('Error in install listener:', error);
      }
    });
  }

  /**
   * Reset error message
   */
  public clearError(): void {
    this.state.errorMessage = null;
    this.notify();
  }
}

// Global instance
let globalManager: PWAInstallManager | null = null;

export function getInstallManager(): PWAInstallManager {
  if (!globalManager) {
    globalManager = new PWAInstallManager();
  }
  return globalManager;
}

/**
 * Get iOS installation instructions
 */
export function getIOSInstallInstructions(): string[] {
  return [
    '1. Tap the Share button at the bottom of Safari',
    '2. Scroll and tap "Add to Home Screen"',
    '3. Customize the name if desired',
    '4. Tap "Add" to install ResqHub',
    '5. The app will now appear on your home screen!',
  ];
}

/**
 * Get Android installation instructions
 */
export function getAndroidInstallInstructions(): string[] {
  return [
    '1. Tap the menu button (three dots) in Chrome',
    '2. Tap "Install app" or "Add to Home screen"',
    '3. Follow the prompts to complete installation',
    '4. ResqHub will be installed on your device!',
  ];
}

/**
 * Get desktop installation instructions
 */
export function getDesktopInstallInstructions(): string[] {
  return [
    '1. Click the install icon in the address bar',
    '2. Or click "Install ResqHub" below',
    '3. Follow the installation prompts',
    '4. Launch ResqHub from your apps!',
  ];
}
