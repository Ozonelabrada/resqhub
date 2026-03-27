/**
 * Network and Sync Status Hook
 * Monitors network status and background sync state for PWA
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseNetworkStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number;
  isSlowConnection: boolean;
  isMeteredConnection: boolean;
}

/**
 * Enhanced hook to monitor network status and connection quality
 */
export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [effectiveType, setEffectiveType] = useState<'4g' | '3g' | '2g' | 'slow-2g' | 'unknown'>('unknown');
  const [downlink, setDownlink] = useState<number>(0);
  const [isMeteredConnection, setIsMeteredConnection] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ App is now online');
      setIsOnline(true);
      setLastOnlineTime(new Date());
    };

    const handleOffline = () => {
      console.log('📴 App is now offline');
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection info if available (Chrome, Edge)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const handleConnectionChange = () => {
          setEffectiveType(connection.effectiveType || 'unknown');
          setDownlink(connection.downlink || 0);
          setIsMeteredConnection(connection.saveData || false);

          console.log('📊 Connection info updated:', {
            type: connection.effectiveType,
            downlink: connection.downlink,
            saveData: connection.saveData,
          });
        };

        // Initial check
        handleConnectionChange();

        // Listen for changes
        connection.addEventListener('change', handleConnectionChange);

        return () => {
          connection.removeEventListener('change', handleConnectionChange);
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSlowConnection = effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 1;

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineTime,
    lastOfflineTime,
    effectiveType,
    downlink,
    isSlowConnection,
    isMeteredConnection,
  };
};

export default useNetworkStatus;
