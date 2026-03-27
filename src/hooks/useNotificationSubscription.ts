/**
 * Notification Subscription Hook
 * React hook for managing push notification subscriptions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isPushNotificationsSupported,
  hasNotificationPermission,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  sendSubscriptionToBackend,
  sendTestNotification,
  watchPushSubscription,
  type NotificationData,
} from '../pwa/notificationManager';

export interface UseNotificationSubscriptionReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: Error | null;
  subscription: PushSubscription | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  sendTest: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

/**
 * Hook to manage push notification subscriptions
 */
export const useNotificationSubscription = (): UseNotificationSubscriptionReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const unwatchRef = useRef<(() => void) | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsSupported(isPushNotificationsSupported());

        if (isPushNotificationsSupported()) {
          // Set initial permission
          setPermission(getNotificationPermission());

          // Get current subscription
          const currentSubscription = await getPushSubscription();
          setSubscription(currentSubscription);
          setIsSubscribed(!!currentSubscription);

          // Watch for subscription changes
          if (unwatchRef.current) {
            unwatchRef.current();
          }
          unwatchRef.current = await watchPushSubscription((sub) => {
            setSubscription(sub);
            setIsSubscribed(!!sub);
          });

          console.log('✅ Notification subscription initialized');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ Failed to initialize notifications:', error);
      }
    };

    init();

    // Cleanup
    return () => {
      if (unwatchRef.current) {
        unwatchRef.current();
      }
    };
  }, []);

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentSubscription = await getPushSubscription();
      setSubscription(currentSubscription);
      setIsSubscribed(!!currentSubscription);
      setPermission(getNotificationPermission());
      console.log('✅ Subscription status refreshed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to refresh subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermission());
      console.log(granted ? '✅ Permission granted' : '❌ Permission denied');
      return granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to request permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // First request permission
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.warn('⚠️ Cannot subscribe without notification permission');
        return false;
      }

      setPermission(getNotificationPermission());

      // Subscribe to push
      const newSubscription = await subscribeToPushNotifications();
      if (!newSubscription) {
        throw new Error('Failed to create push subscription');
      }

      setSubscription(newSubscription);
      setIsSubscribed(true);

      // Send subscription to backend
      const sent = await sendSubscriptionToBackend(newSubscription);
      if (!sent) {
        console.warn('⚠️ Subscription created but not stored on backend');
      }

      console.log('✅ Successfully subscribed to notifications');
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to subscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await unsubscribeFromPushNotifications();

      if (success) {
        setSubscription(null);
        setIsSubscribed(false);

        // Notify backend about unsubscription
        try {
          await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch {
          console.warn('⚠️ Could not notify backend of unsubscription');
        }

        console.log('✅ Successfully unsubscribed');
        return true;
      }

      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to unsubscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendTest = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (!isSubscribed) {
      const newErr = new Error('Not subscribed to notifications');
      setError(newErr);
      console.warn('⚠️ Cannot send test - not subscribed');
      return false;
    }

    try {
      const success = await sendTestNotification(
        'ResqHub Notification',
        'This is a test notification to verify push is working!',
      );
      console.log(success ? '✅ Test notification sent' : '❌ Failed to send test');
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('❌ Failed to send test notification:', error);
      return false;
    }
  }, [isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscription,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTest,
    refreshSubscription,
  };
};
