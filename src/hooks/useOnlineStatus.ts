/**
 * Online Status Hook
 * Monitors online/offline status and provides callbacks
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseOnlineStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

/**
 * Hook to monitor online/offline status
 */
export const useOnlineStatus = (): UseOnlineStatusReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is now online');
      setIsOnline(true);
      setLastOnlineTime(new Date());
    };

    const handleOffline = () => {
      console.log('App is now offline');
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineTime,
    lastOfflineTime,
  };
};

export default useOnlineStatus;
