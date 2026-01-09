import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureFlag = 'newsfeed' | 'community_hub' | 'messages' | 'reports' | 'admin_panel' | 'reactions' | 'comments' | 'sharing';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagContextType {
  flags: FeatureFlags;
  toggleFlag: (flag: FeatureFlag) => void;
  isFeatureEnabled: (flag: FeatureFlag) => boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  newsfeed: true,
  community_hub: false,
  messages: true,
  reports: true,
  admin_panel: true,
  reactions: true,
  comments: true,
  sharing: true,
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    const savedFlags = localStorage.getItem('sherra_feature_flags');
    return savedFlags ? JSON.parse(savedFlags) : DEFAULT_FLAGS;
  });

  useEffect(() => {
    localStorage.setItem('sherra_feature_flags', JSON.stringify(flags));
  }, [flags]);

  // Placeholder for future remote flag fetching
  useEffect(() => {
    const fetchRemoteFlags = async () => {
      // Set to true if we want to simulate an API call
      const ENABLE_REMOTE_FLAGS = false;
      if (!ENABLE_REMOTE_FLAGS) return;

      try {
        // const response = await fetch('/api/feature-flags');
        // const remoteFlags = await response.json();
        // setFlags(prev => ({ ...prev, ...remoteFlags }));
      } catch (error) {
        console.error('Failed to fetch remote feature flags:', error);
      }
    };

    fetchRemoteFlags();
  }, []);

  const toggleFlag = (flag: FeatureFlag) => {
    setFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  };

  const isFeatureEnabled = (flag: FeatureFlag) => {
    return !!flags[flag];
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag, isFeatureEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};
