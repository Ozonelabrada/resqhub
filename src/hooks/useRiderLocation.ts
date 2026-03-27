/**
 * useRiderLocation Hook
 * React hook for managing rider location tracking and updates
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  GeolocationManager,
  LocationSync,
  isGeolocationSupported,
  getCurrentLocation,
  getLocationPermissionStatus,
  PermissionStatus,
  type LocationCoordinates,
  type LocationError,
} from '@/pwa/geolocationManager';

interface RiderLocationState {
  location: LocationCoordinates | null;
  isTracking: boolean;
  isLoading: boolean;
  error: LocationError | string | null;
  permissionStatus: PermissionStatus;
  isSupported: boolean;
  accuracy: number | null;
}

export type { RiderLocationState };

export interface UseRiderLocationOptions {
  autoStart?: boolean;
  enableAutoSync?: boolean;
  syncInterval?: number;
  enableBackgroundSync?: boolean;
}

export interface UseRiderLocationResult extends RiderLocationState {
  startTracking: () => boolean;
  stopTracking: () => void;
  getLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  startSync: () => void;
  stopSync: () => void;
  manager: GeolocationManager | null;
}

export function useRiderLocation(options: UseRiderLocationOptions = {}): UseRiderLocationResult {
  const {
    autoStart = false,
    enableAutoSync = false,
    syncInterval = 30000,
    enableBackgroundSync = false,
  } = options;

  const [state, setState] = useState<RiderLocationState>({
    location: null,
    isTracking: false,
    isLoading: false,
    error: null,
    permissionStatus: PermissionStatus.UNKNOWN,
    isSupported: isGeolocationSupported(),
    accuracy: null,
  });

  const managerRef = useRef<GeolocationManager | null>(null);
  const syncRef = useRef<LocationSync | null>(null);

  /**
   * Initialize geolocation manager
   */
  useEffect(() => {
    if (!state.isSupported) return;

    if (!managerRef.current) {
      managerRef.current = new GeolocationManager();

      // Setup location update handler
      managerRef.current.onUpdate((location) => {
        setState((prev) => ({
          ...prev,
          location,
          accuracy: location.accuracy,
          error: null,
        }));
      });

      // Setup error handler
      managerRef.current.onError((error) => {
        console.error('Location error:', error);
        setState((prev) => ({
          ...prev,
          error,
        }));
      });
    }

    return () => {
      // Don't destroy on unmount - keep tracking alive
      // managerRef.current?.destroy();
    };
  }, [state.isSupported]);

  /**
   * Start tracking location
   */
  const startTracking = useCallback((): boolean => {
    if (!state.isSupported || !managerRef.current) return false;

    const success = managerRef.current.startTracking({
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000,
    });

    if (success) {
      setState((prev) => ({
        ...prev,
        isTracking: true,
        error: null,
      }));

      // Start auto-sync if enabled
      if (enableAutoSync && !syncRef.current) {
        startSync();
      }
    }

    return success;
  }, [state.isSupported, enableAutoSync]);

  /**
   * Stop tracking location
   */
  const stopTracking = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.stopTracking();
      stopSync();
      setState((prev) => ({
        ...prev,
        isTracking: false,
      }));
    }
  }, []);

  /**
   * Get current location once
   */
  const getLocation = useCallback(async () => {
    if (!state.isSupported) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setState((prev) => ({
        ...prev,
        location,
        accuracy: location.accuracy,
        isLoading: false,
        error: null,
      }));

      // Save to cache for background sync
      if (enableBackgroundSync && managerRef.current) {
        await managerRef.current.saveToCacheForSync();
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get location',
        isLoading: false,
      }));
    }
  }, [state.isSupported, enableBackgroundSync]);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const status = await getLocationPermissionStatus();
      setState((prev) => ({ ...prev, permissionStatus: status }));

      if (status === PermissionStatus.GRANTED) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return true;
      }

      // If prompt or unknown, request permission
      if (status === PermissionStatus.PROMPT || status === PermissionStatus.UNKNOWN) {
        const result = await new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
          );
        });

        if (result) {
          setState((prev) => ({
            ...prev,
            permissionStatus: PermissionStatus.GRANTED,
            isLoading: false,
          }));
          return true;
        }
      }

      setState((prev) => ({
        ...prev,
        permissionStatus: PermissionStatus.DENIED,
        isLoading: false,
      }));
      return false;
    } catch (error) {
      console.error('Permission error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Permission error',
      }));
      return false;
    }
  }, [state.isSupported]);

  /**
   * Start syncing location to server
   */
  const startSync = useCallback(() => {
    if (!managerRef.current || syncRef.current) return;

    syncRef.current = new LocationSync(
      managerRef.current,
      '/api/riders/location',
      syncInterval,
    );

    syncRef.current.startSync();
    console.log('Location sync started');
  }, [syncInterval]);

  /**
   * Stop syncing location
   */
  const stopSync = useCallback(() => {
    if (syncRef.current) {
      syncRef.current.destroy();
      syncRef.current = null;
      console.log('Location sync stopped');
    }
  }, []);

  /**
   * Get current permission status
   */
  useEffect(() => {
    if (state.isSupported) {
      getLocationPermissionStatus().then((status) => {
        setState((prev) => ({ ...prev, permissionStatus: status }));
      });
    }
  }, [state.isSupported]);

  /**
   * Auto-start tracking if enabled
   */
  useEffect(() => {
    if (autoStart && state.isSupported && !state.isTracking) {
      const timer = setTimeout(() => {
        startTracking();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoStart, state.isSupported, state.isTracking, startTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getLocation,
    requestPermission,
    startSync,
    stopSync,
    manager: managerRef.current,
  };
}

/**
 * useRiderLocationMap Hook
 * For displaying rider location on a map
 */

export interface RiderLocationMapState {
  latitude: number | null;
  longitude: number | null;
  bearing: number | null;
  speed: number | null;
  accuracy: number | null;
  updateTime: number | null;
}

export function useRiderLocationMap(
  manager: GeolocationManager | null,
): RiderLocationMapState {
  const [state, setState] = useState<RiderLocationMapState>({
    latitude: null,
    longitude: null,
    bearing: null,
    speed: null,
    accuracy: null,
    updateTime: null,
  });

  useEffect(() => {
    if (!manager) return;

    const unsubscribe = manager.onUpdate((location) => {
      setState({
        latitude: location.latitude,
        longitude: location.longitude,
        bearing: location.heading,
        speed: location.speed,
        accuracy: location.accuracy,
        updateTime: location.timestamp,
      });
    });

    return () => unsubscribe();
  }, [manager]);

  return state;
}


