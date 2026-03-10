import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((realtimeNotifications) => {
      setNotifications(realtimeNotifications);
      const unread = realtimeNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError('Failed to fetch unread notifications');
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stored notifications
  const fetchNotifications = useCallback(async (page: number = 1, pageSize: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.getNotifications(page, pageSize);
      // Merge with real-time notifications
      const allNotifications = [
        ...notifications,
        ...result.notifications.filter(stored =>
          !notifications.some(realtime => realtime.id === stored.id)
        )
      ];
      setNotifications(allNotifications);
      return result;
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      return { notifications: [], total: 0, page, pageSize };
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Optional: Poll for updates every 30 seconds (fallback for stored notifications)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
