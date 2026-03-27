/**
 * Push Notification Manager
 * Handles subscription management and notification delivery
 */

import { getVAPIDPublicKey, urlBase64ToUint8Array, isValidVAPIDPublicKey } from './vapidKeys';

export interface NotificationSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationsSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Check if user has granted notification permission
 */
export function hasNotificationPermission(): boolean {
  return getNotificationPermission() === 'granted';
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    console.warn('❌ Push notifications not supported');
    return false;
  }

  if (hasNotificationPermission()) {
    console.log('✅ Notification permission already granted');
    return true;
  }

  if (getNotificationPermission() === 'denied') {
    console.warn('❌ Notification permission denied by user');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    }
    console.log('⏭️ Notification permission pending');
    return false;
  } catch (error) {
    console.error('❌ Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Get or create push notification subscription
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationsSupported()) {
    console.error('❌ Push notifications not supported');
    return null;
  }

  const vapidPublicKey = getVAPIDPublicKey();
  if (!vapidPublicKey || !isValidVAPIDPublicKey(vapidPublicKey)) {
    console.error('❌ Invalid VAPID public key');
    return null;
  }

  try {
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.warn('⚠️ Notification permission not granted');
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready for push subscription');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('📝 Creating new push subscription...');

      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      console.log('✅ Push subscription created');
    } else {
      console.log('✅ Existing push subscription found');
    }

    return subscription;
  } catch (error) {
    console.error('❌ Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    console.warn('⚠️ Push notifications not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Unsubscribed from push notifications');
      return true;
    }

    console.log('⚠️ No active push subscription found');
    return false;
  } catch (error) {
    console.error('❌ Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationsSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('❌ Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Convert PushSubscription to JSON for sending to backend
 */
export function subscriptionToJSON(subscription: PushSubscription): NotificationSubscription {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth')),
    },
  };
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Send subscription to backend for storage
 */
export async function sendSubscriptionToBackend(
  subscription: PushSubscription,
  backendUrl: string = '/api/notifications/subscribe',
): Promise<boolean> {
  try {
    const subscriptionJSON = subscriptionToJSON(subscription);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionJSON),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    console.log('✅ Subscription sent to backend');
    return true;
  } catch (error) {
    console.error('❌ Failed to send subscription to backend:', error);
    return false;
  }
}

/**
 * Test notification - sends a test notification to verify setup
 */
export async function sendTestNotification(
  title: string = 'ResqHub PWA',
  body: string = 'Push notifications are working!',
): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Show notification via service worker
    await registration.showNotification(title, {
      body,
      icon: '/logo.svg',
      badge: '/badge.svg',
      tag: 'test-notification',
      data: {
        timestamp: new Date().getTime(),
      },
    });

    console.log('✅ Test notification sent');
    return true;
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
    return false;
  }
}

/**
 * Send notification payload to backend for server-side push
 * Backend then sends via Web Push API
 */
export async function requestPushNotification(
  data: NotificationData,
  backendUrl: string = '/api/notifications/send',
): Promise<boolean> {
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    console.log('✅ Push notification request sent to backend');
    return true;
  } catch (error) {
    console.error('❌ Failed to request push notification:', error);
    return false;
  }
}

/**
 * Monitor subscription changes
 */
export async function watchPushSubscription(
  callback: (subscription: PushSubscription | null) => void,
): Promise<() => void> {
  if (!isPushNotificationsSupported()) {
    return () => {};
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Initial check
    const initial = await registration.pushManager.getSubscription();
    callback(initial);

    // Listen for subscription changes
    const handleChange = async () => {
      const subscription = await registration.pushManager.getSubscription();
      callback(subscription);
    };

    // Check periodically
    const interval = setInterval(handleChange, 30000); // 30 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  } catch (error) {
    console.error('❌ Failed to watch push subscription:', error);
    return () => {};
  }
}
