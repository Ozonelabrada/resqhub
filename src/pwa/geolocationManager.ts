/**
 * Geolocation Manager
 * Handles continuous location tracking for riders with service worker support
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
  timestamp: number;
}

export type LocationUpdateCallback = (location: LocationCoordinates) => void;
export type LocationErrorCallback = (error: LocationError) => void;

/**
 * Geolocation Permission Status
 */
export const PermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt',
  UNKNOWN: 'unknown',
} as const;

export type PermissionStatus = typeof PermissionStatus[keyof typeof PermissionStatus];

/**
 * Convert GeolocationCoordinates to LocationCoordinates
 */
export function convertCoordinates(coords: GeolocationCoordinates): LocationCoordinates {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
    timestamp: Date.now(),
  };
}

/**
 * Check if Geolocation API is supported
 */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Get current permission status
 */
export async function getLocationPermissionStatus(): Promise<PermissionStatus> {
  if (!isGeolocationSupported()) {
    return PermissionStatus.UNKNOWN;
  }

  try {
    const permission = await (navigator.permissions as any)?.query({
      name: 'geolocation',
    });

    if (permission?.state) {
      return permission.state as PermissionStatus;
    }
  } catch (error) {
    console.warn('Failed to query location permission:', error);
  }

  return PermissionStatus.UNKNOWN;
}

/**
 * Request location permission
 */
export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isGeolocationSupported()) {
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        console.log('✅ Location permission granted');
        resolve(true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          console.log('❌ Location permission denied');
          resolve(false);
        } else {
          console.warn('Location permission error:', error);
          resolve(false);
        }
      },
    );
  });
}

/**
 * Get current location once
 */
export function getCurrentLocation(
  options?: PositionOptions,
): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = convertCoordinates(position.coords);
        console.log('✅ Got current location:', location);
        resolve(location);
      },
      (error) => {
        console.error('❌ Failed to get location:', error);
        reject({
          code: error.code,
          message: error.message,
          timestamp: Date.now(),
        } as LocationError);
      },
      defaultOptions,
    );
  });
}

/**
 * Geolocation Manager for continuous tracking
 */
export class GeolocationManager {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private updateCallbacks: Set<LocationUpdateCallback> = new Set();
  private errorCallbacks: Set<LocationErrorCallback> = new Set();
  private lastLocation: LocationCoordinates | null = null;
  private updateInterval: number;
  private lastUpdateTime: number = 0;

  constructor(updateIntervalMs: number = 10000) {
    this.updateInterval = updateIntervalMs;
  }

  /**
   * Start tracking location
   */
  public startTracking(options?: PositionOptions): boolean {
    if (!isGeolocationSupported()) {
      console.error('❌ Geolocation not supported');
      return false;
    }

    if (this.isTracking) {
      console.log('ℹ️  Already tracking location');
      return true;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000,
      ...options,
    };

    console.log('🎯 Starting location tracking...');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      defaultOptions,
    );

    this.isTracking = true;
    return true;
  }

  /**
   * Stop tracking location
   */
  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    console.log('⏹️  Location tracking stopped');
  }

  /**
   * Check if currently tracking
   */
  public isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get last known location
   */
  public getLastLocation(): LocationCoordinates | null {
    return this.lastLocation;
  }

  /**
   * Subscribe to location updates
   */
  public onUpdate(callback: LocationUpdateCallback): () => void {
    this.updateCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Unsubscribe from location updates
   */
  public offUpdate(callback: LocationUpdateCallback): void {
    this.updateCallbacks.delete(callback);
  }

  /**
   * Subscribe to location errors
   */
  public onError(callback: LocationErrorCallback): () => void {
    this.errorCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  /**
   * Unsubscribe from location errors
   */
  public offError(callback: LocationErrorCallback): void {
    this.errorCallbacks.delete(callback);
  }

  /**
   * Send location to server
   */
  public async sendLocationToServer(url: string = '/api/riders/location'): Promise<boolean> {
    if (!this.lastLocation) {
      console.log('ℹ️  No location to send');
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: this.lastLocation.latitude,
          longitude: this.lastLocation.longitude,
          accuracy: this.lastLocation.accuracy,
          timestamp: this.lastLocation.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      console.log('✅ Location sent to server');
      return true;
    } catch (error) {
      console.error('❌ Failed to send location:', error);
      return false;
    }
  }

  /**
   * Save location to cache for background sync
   */
  public async saveToCacheForSync(): Promise<boolean> {
    if (!this.lastLocation) {
      return false;
    }

    try {
      const cache = await caches.open('location-cache');
      const response = new Response(
        JSON.stringify({
          latitude: this.lastLocation.latitude,
          longitude: this.lastLocation.longitude,
          accuracy: this.lastLocation.accuracy,
          timestamp: this.lastLocation.timestamp,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      await cache.put('/location-data', response);
      console.log('✅ Location saved to cache');
      return true;
    } catch (error) {
      console.error('Failed to save location to cache:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two locations (Haversine formula)
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Private methods
   */

  private handleLocationUpdate = (position: GeolocationPosition): void => {
    const now = Date.now();

    // Throttle updates based on interval
    if (now - this.lastUpdateTime < this.updateInterval) {
      return;
    }

    this.lastUpdateTime = now;
    this.lastLocation = convertCoordinates(position.coords);

    console.log(`📍 Location updated:`, {
      lat: this.lastLocation.latitude.toFixed(6),
      lng: this.lastLocation.longitude.toFixed(6),
      accuracy: `${this.lastLocation.accuracy.toFixed(0)}m`,
    });

    // Notify all subscribers
    this.updateCallbacks.forEach((callback) => {
      try {
        callback(this.lastLocation!);
      } catch (error) {
        console.error('Error in location update callback:', error);
      }
    });
  };

  private handleLocationError = (error: GeolocationPositionError): void => {
    const locationError: LocationError = {
      code: error.code,
      message: error.message,
      timestamp: Date.now(),
    };

    console.error(`❌ Location error (${error.code}):`, error.message);

    // Notify all error subscribers
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(locationError);
      } catch (e) {
        console.error('Error in location error callback:', e);
      }
    });
  };

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopTracking();
    this.updateCallbacks.clear();
    this.errorCallbacks.clear();
  }
}

/**
 * Global Geolocation Manager Instance
 */
let globalManager: GeolocationManager | null = null;

export function getGlobalGeolocationManager(): GeolocationManager {
  if (!globalManager) {
    globalManager = new GeolocationManager();
  }
  return globalManager;
}

export function resetGlobalGeolocationManager(): void {
  if (globalManager) {
    globalManager.destroy();
    globalManager = null;
  }
}

/**
 * Continuous Location Sync
 * Periodically sends location to server
 */
export class LocationSync {
  private manager: GeolocationManager;
  private syncInterval: number;
  private syncTimer: NodeJS.Timeout | null = null;
  private serverUrl: string;

  constructor(
    manager: GeolocationManager,
    serverUrl: string = '/api/riders/location',
    syncIntervalMs: number = 30000,
  ) {
    this.manager = manager;
    this.serverUrl = serverUrl;
    this.syncInterval = syncIntervalMs;
  }

  /**
   * Start syncing location
   */
  public startSync(): void {
    if (this.syncTimer) {
      console.log('ℹ️  Location sync already running');
      return;
    }

    console.log('🔄 Starting location sync...');

    // Sync immediately
    this.manager.sendLocationToServer(this.serverUrl);

    // Then sync periodically
    this.syncTimer = setInterval(() => {
      this.manager.sendLocationToServer(this.serverUrl);
    }, this.syncInterval);
  }

  /**
   * Stop syncing location
   */
  public stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏹️  Location sync stopped');
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopSync();
  }
}
