import { useState, useEffect, useCallback } from 'react';
import { MessagesService } from '../services/messagesService';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

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
  }, [isAuthenticated]);

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
