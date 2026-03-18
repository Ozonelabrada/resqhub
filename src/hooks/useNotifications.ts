import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to real-time notifications only if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    const unsubscribe = notificationService.subscribe((realtimeNotifications) => {
      setNotifications(realtimeNotifications);
      const unread = realtimeNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

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
  }, [isAuthenticated]);

  // Fetch stored notifications
  const fetchNotifications = useCallback(async (page: number = 1, pageSize: number = 20) => {
    if (!isAuthenticated) {
      return { notifications: [], total: 0, page, pageSize };
    }

    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.getNotifications(page, pageSize);
      setNotifications(result.notifications);
      return result;
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      return { notifications: [], total: 0, page, pageSize };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [isAuthenticated]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [isAuthenticated]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.deleteNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [isAuthenticated]);

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
