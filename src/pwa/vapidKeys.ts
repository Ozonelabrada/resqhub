/**
 * VAPID Key Management
 * Handles VAPID key generation and configuration for Web Push API
 */

/**
 * VAPID Configuration with public/private keys
 * These keys are used to sign voluntary application server identification (VAPID)
 * Required for Web Push API subscription
 */
export interface VAPIDConfig {
  publicKey: string;
  privateKey?: string; // Only needed on server side
}

/**
 * Generate VAPID Key Pair
 * Note: In production, use a tool like:
 *   npm install -g web-push
 *   web-push generate-vapid-keys
 * 
 * Or use the Web Push library:
 *   const vapidKeys = require('web-push').generateVAPIDKeys();
 * 
 * Store public key in environment variable or config
 * Store private key securely on server only
 */
export function generateVAPIDKeysInstruction(): string {
  return `
To generate VAPID keys:

1. Install web-push globally:
   npm install -g web-push

2. Generate keys:
   web-push generate-vapid-keys

3. Store the PUBLIC key in .env:
   VITE_VAPID_PUBLIC_KEY=<your-public-key>

4. Store the PRIVATE key securely on your backend server:
   VAPID_PRIVATE_KEY=<your-private-key>
   VAPID_SUBJECT=<your-email>

Never expose the private key in the frontend!
`;
}

/**
 * Get VAPID public key from environment
 */
export function getVAPIDPublicKey(): string {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!key) {
    console.warn(
      '⚠️ VAPID_PUBLIC_KEY not configured. Push notifications will not work.',
    );
    return '';
  }
  return key;
}

/**
 * Validate VAPID public key format
 */
export function isValidVAPIDPublicKey(key: string): boolean {
  // VAPID public keys are base64url encoded and typically 87-88 characters
  if (!key || key.length < 70) {
    return false;
  }
  try {
    // Should be valid base64url
    atob(key.replace(/-/g, '+').replace(/_/g, '/'));
    return true;
  } catch {
    return false;
  }
}

/**
 * URL-safe base64 decode helper for VAPID keys
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Configuration for Web Push
 * Should be set up in your backend during initialization
 */
export const pushNotificationConfig = {
  /**
   * Configure Web Push library on backend with:
   * 
   * const webpush = require('web-push');
   * webpush.setVapidDetails(
   *   'mailto:' + process.env.VAPID_SUBJECT,
   *   process.env.VAPID_PUBLIC_KEY,
   *   process.env.VAPID_PRIVATE_KEY
   * );
   * 
   * Then send notifications with:
   * webpush.sendNotification(subscription, JSON.stringify(notificationData));
   */
  instructions: `
BACKEND SETUP:
1. Install web-push: npm install web-push
2. Configure in your Node/Express server:
   
   const webpush = require('web-push');
   webpush.setVapidDetails(
     'mailto:' + process.env.VAPID_SUBJECT,
     process.env.VAPID_PUBLIC_KEY,
     process.env.VAPID_PRIVATE_KEY
   );

3. Create endpoint to handle subscriptions (POST /api/notifications/subscribe):
   - Accept subscription object from client
   - Save to database with user ID
   - Return success response

4. Create endpoint to send notifications (POST /api/notifications/send):
   - Get subscription from database
   - Send with webpush.sendNotification()
   - Handle errors (410 = unsubscribed, retry)

EXAMPLE BACKEND CODE:
app.post('/api/notifications/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  
  // Save subscription to database
  await db.pushSubscriptions.create({
    userId,
    endpoint: subscription.endpoint,
    auth: subscription.keys.auth,
    p256dh: subscription.keys.p256dh,
  });
  
  res.json({ success: true });
});

app.post('/api/notifications/send', async (req, res) => {
  const { userId, data } = req.body;
  
  const subscription = await db.pushSubscriptions.findByUserId(userId);
  if (!subscription) {
    return res.status(404).json({ error: 'Not subscribed' });
  }
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(data));
    res.json({ success: true });
  } catch (error) {
    if (error.statusCode === 410) {
      // Subscription expired, remove it
      await db.pushSubscriptions.delete(userId);
    }
    res.status(error.statusCode).json({ error: error.message });
  }
});
`,
};
