import { useState, useEffect, useCallback } from 'react';
import { MessagesService } from '../services/messagesService';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const count = await MessagesService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError('Failed to fetch unread notifications');
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Optional: Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount
  };
};
