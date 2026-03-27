/**
 * 🌐 Offline Context
 * Manages offline capabilities and sync queue
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface OfflineContextType {
  isOnline: boolean;
  isConnected: boolean;
  hasInternetConnection: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsOnline(connected);
      setIsConnected(connected);
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? false;
      setIsOnline(connected);
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, isConnected, hasInternetConnection: isOnline }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOfflineMode = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineMode must be used within OfflineProvider');
  }
  return context;
};
