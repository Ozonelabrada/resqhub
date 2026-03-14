import { useEffect, useState, useCallback } from 'react';
import { AnnouncementsService } from '../services/announcementsService';
import { Announcement, CreateAnnouncementRequest } from '../types/admin';
import websocketService from '../services/websocketService';

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  createAnnouncement: (data: CreateAnnouncementRequest) => Promise<Announcement>;
  updateAnnouncement: (id: string, data: Partial<CreateAnnouncementRequest>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for admin to manage announcements
 */
export function useAnnouncements(): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AnnouncementsService.getActiveAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(errorMessage);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnnouncement = useCallback(async (data: CreateAnnouncementRequest) => {
    try {
      const result = await AnnouncementsService.createAnnouncement(data);
      setAnnouncements((prev) => [result, ...prev]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create announcement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, data: Partial<CreateAnnouncementRequest>) => {
    try {
      const result = await AnnouncementsService.updateAnnouncement(id, data);
      setAnnouncements((prev) =>
        prev.map((announcement) => (announcement.id === id ? result : announcement))
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update announcement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      await AnnouncementsService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete announcement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refetch = useCallback(() => fetchAnnouncements(), [fetchAnnouncements]);

  // Listen for announcement events via WebSocket
  useEffect(() => {
    const handleAnnouncementCreated = (data: Announcement) => {
      console.log('📢 New announcement received:', data);
      setAnnouncements((prev) => [data, ...prev]);
    };

    const handleAnnouncementUpdated = (data: Announcement) => {
      console.log('📝 Announcement updated:', data);
      setAnnouncements((prev) =>
        prev.map((announcement) => (announcement.id === data.id ? data : announcement))
      );
    };

    websocketService.on('announcement_created', handleAnnouncementCreated);
    websocketService.on('announcement_updated', handleAnnouncementUpdated);

    return () => {
      websocketService.off('announcement_created', handleAnnouncementCreated);
      websocketService.off('announcement_updated', handleAnnouncementUpdated);
    };
  }, []);

  return {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refetch,
  };
}

/**
 * Hook for users to view announcements
 */
export function useUserAnnouncements(): {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeAnnouncements = await AnnouncementsService.getActiveAnnouncements();
      setAnnouncements(activeAnnouncements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(errorMessage);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Listen for real-time announcements via WebSocket
  useEffect(() => {
    const handleAnnouncementReceived = (data: Announcement) => {
      console.log('📢 Announcement received:', data);
      setAnnouncements((prev) => [data, ...prev]);
    };

    websocketService.on('announcement_received', handleAnnouncementReceived);

    return () => {
      websocketService.off('announcement_received', handleAnnouncementReceived);
    };
  }, []);

  return {
    announcements,
    loading,
    error,
    refetch: fetchAnnouncements,
  };
}
