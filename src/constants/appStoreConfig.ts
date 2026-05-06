/**
 * Mobile App Store URLs Configuration
 * Update these URLs when your apps are published
 */

export const APP_STORE_CONFIG = {
  // Mobile Apps
  mobile: {
    // iOS App Store
    ios: {
      url: 'https://apps.apple.com/app/findrhub/id6574892159',
      bundleId: 'com.findrhub.app',
      name: 'FindrHub',
    },
    
    // Google Play Store
    android: {
      url: 'https://expo.dev/accounts/olabrada/projects/findrhub/builds/7c060639-f649-472d-af2c-06b42850f45a',
      packageName: 'com.findrhub.app',
      name: 'FindrHub',
    },
  },

  // Desktop Apps
  desktop: {
    // Windows Installer
    windows: {
      url: 'https://github.com/Ozonelabrada/resqhub/releases/download/latest/FindrHub-Setup.exe',
      version: '1.0.0',
      name: 'Windows',
    },
    
    // macOS App
    macos: {
      url: 'https://github.com/Ozonelabrada/resqhub/releases/download/latest/FindrHub.dmg',
      version: '1.0.0',
      name: 'macOS',
    },
  },
  
  // Alternative store links
  alternativeStores: {
    huaweiAppGallery: 'https://appgallery.huawei.com/app/C105903989',
    amazonAppstore: 'https://www.amazon.com/dp/[YOUR_AMAZON_ID]',
  },

  // Backward compatibility
  ios: undefined as any,
  android: undefined as any,
};

// Set backward compatibility references
APP_STORE_CONFIG.ios = APP_STORE_CONFIG.mobile.ios;
APP_STORE_CONFIG.android = APP_STORE_CONFIG.mobile.android;

/**
 * Dynamic App Store Links
 * Generates appropriate store links based on user's device
 */
export const getAppStoreLink = (platform?: 'ios' | 'android' | 'auto'): string => {
  if (platform === 'ios') {
    return APP_STORE_CONFIG.ios.url;
  }
  
  if (platform === 'android') {
    return APP_STORE_CONFIG.android.url;
  }
  
  // Auto-detect based on user agent
  if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return APP_STORE_CONFIG.ios.url;
    }
    
    if (/android/.test(userAgent)) {
      return APP_STORE_CONFIG.android.url;
    }
  }
  
  // Default to Android if can't detect
  return APP_STORE_CONFIG.android.url;
};

/**
 * Open App Store Link in New Tab
 */
export const openAppStore = (platform?: 'ios' | 'android' | 'auto'): void => {
  const url = getAppStoreLink(platform);
  window.open(url, '_blank', 'noopener,noreferrer');
};
