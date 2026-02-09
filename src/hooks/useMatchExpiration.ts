import { useEffect, useState, useCallback, useRef } from 'react';
import type { MatchExpirationData } from '@/types/match.types';

/**
 * Hook to track match expiration and countdown timer
 * Matches expire after 48 hours from creation
 */
export const useMatchExpiration = (
  matchCreatedAt: string | undefined | null,
  onExpired?: () => void
) => {
  const [expirationData, setExpirationData] = useState<MatchExpirationData | null>(null);
  const [isCountdownVisible, setIsCountdownVisible] = useState(false);
  const hasCalledExpiredRef = useRef(false);
  const prevDataRef = useRef<MatchExpirationData | null>(null);
  const onExpiredRef = useRef(onExpired); // Store callback in ref to avoid dependency

  // Keep callback ref in sync
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Calculate expiration - no dependencies to keep it pure
  const calculateExpiration = useCallback((createdAt: string | undefined | null) => {
    if (!createdAt) return null;

    const createdDate = new Date(createdAt);
    const expiresAt = new Date(createdDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    const now = new Date();
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const isExpired = timeRemaining <= 0;

    const hoursRemaining = isExpired ? 0 : Math.ceil(timeRemaining / (60 * 60 * 1000));

    const data: MatchExpirationData = {
      matchId: 0, // Will be set externally if needed
      createdAt: createdAt,
      expiresAt: expiresAt.toISOString(),
      timeRemaining: Math.max(0, timeRemaining),
      isExpired,
      hoursRemaining
    };

    return data;
  }, []);

  // Helper to check if data meaningfully changed (not just timeRemaining slightly different)
  const hasDataChanged = (newData: MatchExpirationData | null, oldData: MatchExpirationData | null): boolean => {
    if (!newData && !oldData) return false;
    if (!newData || !oldData) return true;
    // Only care about isExpired and hoursRemaining changes, not millisecond time differences
    return newData.isExpired !== oldData.isExpired || newData.hoursRemaining !== oldData.hoursRemaining;
  };

  // Update expiration data and check if expired - runs only on mount or when matchCreatedAt changes
  useEffect(() => {
    const newData = calculateExpiration(matchCreatedAt);
    
    // Only update state if data meaningfully changed
    if (hasDataChanged(newData, prevDataRef.current)) {
      prevDataRef.current = newData;
      
      if (newData) {
        setExpirationData(newData);
        setIsCountdownVisible(newData.hoursRemaining <= 24); // Show when less than 24 hours left

        // Call onExpired callback only once when match expires
        if (newData.isExpired && onExpiredRef.current && !hasCalledExpiredRef.current) {
          hasCalledExpiredRef.current = true;
          onExpiredRef.current();
        }
      }
    }
  }, [matchCreatedAt]); // Only depend on matchCreatedAt

  // Set up interval to update countdown every minute
  useEffect(() => {
    if (!matchCreatedAt) return;

    const interval = setInterval(() => {
      const newData = calculateExpiration(matchCreatedAt);
      
      // Only update state if data meaningfully changed
      if (hasDataChanged(newData, prevDataRef.current)) {
        prevDataRef.current = newData;
        
        if (newData) {
          setExpirationData(newData);
          setIsCountdownVisible(newData.hoursRemaining <= 24);

          if (newData.isExpired && onExpiredRef.current && !hasCalledExpiredRef.current) {
            hasCalledExpiredRef.current = true;
            onExpiredRef.current();
            clearInterval(interval);
          }
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [matchCreatedAt]); // Only depend on matchCreatedAt

  const formatTimeRemaining = (timeRemaining: number): string => {
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCountdownColor = (): string => {
    if (!expirationData) return 'text-slate-500';
    if (expirationData.isExpired) return 'text-red-600';
    if (expirationData.hoursRemaining <= 6) return 'text-red-500';
    if (expirationData.hoursRemaining <= 12) return 'text-amber-500';
    return 'text-teal-600';
  };

  const getCountdownBgColor = (): string => {
    if (!expirationData) return 'bg-slate-50';
    if (expirationData.isExpired) return 'bg-red-50';
    if (expirationData.hoursRemaining <= 6) return 'bg-red-50';
    if (expirationData.hoursRemaining <= 12) return 'bg-amber-50';
    return 'bg-teal-50';
  };

  return {
    expirationData,
    isCountdownVisible,
    formatTimeRemaining,
    getCountdownColor,
    getCountdownBgColor,
    isExpired: expirationData?.isExpired ?? false,
    hoursRemaining: expirationData?.hoursRemaining ?? 0
  };
};
