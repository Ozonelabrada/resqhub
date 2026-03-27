import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead?: boolean;
  createdAt?: string;
}

export interface BookingUpdateData {
  bookingId: string;
  status: string;
  userId: string;
  riderId?: string;
  timestamp?: string;
}

export interface AdminNotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  requiresAction?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  timestamp?: string;
}

export interface DashboardUpdateData {
  type: string;
  data: {
    activeBookings?: number;
    pendingApprovals?: number;
    onlineRiders?: number;
    totalRevenue?: number;
    timestamp?: string;
  };
}

export interface RiderUpdateData {
  riderId: string;
  status: string;
  location?: { lat: number; lng: number };
  currentBooking?: string | null;
}

// Booking Events
export interface BookingCreatedData {
  title: string;
  message: string;
  BookingId: string;
  BookingType: string;
  Status: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  bookingDetails: {
    createdAt: string;
    totalAmount: number;
    status: string;
    bookingType: string;
    nextSteps: string;
  };
  Timestamp: string;
}

export interface BookingCancelledData {
  title: string;
  message: string;
  BookingId: string;
  BookingType: string;
  Status: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  cancellationDetails: {
    cancelledAt: string;
    reason: string;
    cancellationFee: number;
    refundAmount: number;
    originalAmount: number;
  };
  Timestamp: string;
}

// Application Events
export interface ApplicationApprovedData {
  title: string;
  message: string;
  ApplicationId: string;
  Status: string;
  approvalDetails: {
    approvedAt: string;
    status: string;
    canAcceptBookings?: boolean;
  };
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  Timestamp: string;
}

export interface CreditsData {
  title: string;
  message: string;
  userId: string;
  amount: number;
  creditDetails: {
    amountGranted?: number;
    amountDeducted?: number;
    totalAvailable?: number;
    remainingBalance?: number;
    reason: string;
  };
  Timestamp: string;
}

// Hook for general WebSocket connection status
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(websocketService.isConnected);
  const [isReconnecting, setIsReconnecting] = useState(websocketService.isReconnecting);
  const [isSupported, setIsSupported] = useState(websocketService.isWebSocketSupported);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected);
      setIsReconnecting(websocketService.isReconnecting);
      setIsSupported(websocketService.isWebSocketSupported);
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000);

    // Initial check
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    isConnected,
    isReconnecting,
    isSupported, // Add this to let components know if WebSocket features are available
    connect,
    disconnect
  };
};

// Hook for real-time notifications
export const useWebSocketNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotification = (data: NotificationData) => {
      setNotifications(prev => [data, ...prev]);
      if (!data.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    };

    websocketService.on('notification', handleNotification);

    return () => {
      websocketService.off('notification', handleNotification);
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};

// Hook for booking updates
export const useBookingUpdates = () => {
  const [bookingUpdates, setBookingUpdates] = useState<BookingUpdateData[]>([]);

  useEffect(() => {
    const handleBookingUpdate = (data: BookingUpdateData) => {
      setBookingUpdates(prev => [data, ...prev]);
    };

    websocketService.on('booking_update', handleBookingUpdate);

    return () => {
      websocketService.off('booking_update', handleBookingUpdate);
    };
  }, []);

  const clearUpdates = useCallback(() => {
    setBookingUpdates([]);
  }, []);

  return {
    bookingUpdates,
    clearUpdates
  };
};

// Hook for admin notifications
export const useAdminNotifications = () => {
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationData[]>([]);
  const [pendingActions, setPendingActions] = useState<AdminNotificationData[]>([]);

  useEffect(() => {
    const handleAdminNotification = (data: AdminNotificationData) => {
      setAdminNotifications(prev => [data, ...prev]);
      if (data.requiresAction) {
        setPendingActions(prev => [data, ...prev]);
      }
    };

    websocketService.on('admin_notification', handleAdminNotification);

    return () => {
      websocketService.off('admin_notification', handleAdminNotification);
    };
  }, []);

  const markActionCompleted = useCallback((notificationId: string) => {
    setPendingActions(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  const clearNotifications = useCallback(() => {
    setAdminNotifications([]);
    setPendingActions([]);
  }, []);

  return {
    adminNotifications,
    pendingActions,
    markActionCompleted,
    clearNotifications
  };
};

/**
 * Hook for dashboard updates
 * 
 * NOTE: Backend does NOT send a DashboardUpdated SignalR event.
 * Dashboard stats must be fetched via API polling instead.
 * 
 * This hook provides:
 * - Initial fetch on mount
 * - Manual refresh capability
 * - Optional auto-refresh at specified interval
 */
export const useDashboardUpdates = () => {
  const [dashboardData, setDashboardData] = useState<DashboardUpdateData['data']>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Import AdminService to fetch dashboard stats
      const { AdminService } = await import('../services');
      await Promise.all([
        AdminService.getOverview(),
        AdminService.getStatistics('30d')
      ]);

      // Map API response to dashboard data structure
      // Note: Properties like activeBookings, pendingApprovals, onlineRiders, totalRevenue
      // may not be available in current AdminOverview/AdminStatistics APIs
      // Setting them to 0 as defaults until backend provides these metrics
      const mappedData: DashboardUpdateData['data'] = {
        activeBookings: 0,
        pendingApprovals: 0,
        onlineRiders: 0,
        totalRevenue: 0,
        timestamp: new Date().toISOString()
      };

      setDashboardData(mappedData);
      setLastUpdate(mappedData.timestamp || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard update error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Optional: Auto-refresh dashboard data at interval (e.g., every 30 seconds)
  const startAutoRefresh = useCallback((intervalMs = 30000) => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    dashboardData,
    lastUpdate,
    isLoading,
    error,
    refreshData: fetchDashboardData,
    startAutoRefresh
  };
};

// Hook for rider updates
export const useRiderUpdates = () => {
  const [riderUpdates, setRiderUpdates] = useState<RiderUpdateData[]>([]);
  const [onlineRiders, setOnlineRiders] = useState<Map<string, RiderUpdateData>>(new Map());

  useEffect(() => {
    const handleRiderUpdate = (data: RiderUpdateData) => {
      setRiderUpdates(prev => [data, ...prev]);

      // Update online riders map
      setOnlineRiders(prev => {
        const newMap = new Map(prev);
        if (data.status === 'online' || data.status === 'available') {
          newMap.set(data.riderId, data);
        } else {
          newMap.delete(data.riderId);
        }
        return newMap;
      });
    };

    websocketService.on('rider_update', handleRiderUpdate);

    return () => {
      websocketService.off('rider_update', handleRiderUpdate);
    };
  }, []);

  const getRiderStatus = useCallback((riderId: string) => {
    return onlineRiders.get(riderId);
  }, [onlineRiders]);

  const getOnlineRiderCount = useCallback(() => {
    return onlineRiders.size;
  }, [onlineRiders]);

  return {
    riderUpdates,
    onlineRiders: Array.from(onlineRiders.values()),
    getRiderStatus,
    getOnlineRiderCount
  };
};

// Hook for sending WebSocket events
export const useWebSocketEmitter = () => {
  const sendBookingStatusChange = useCallback((
    bookingId: string,
    status: string,
    userId: string,
    riderId?: string
  ) => {
    websocketService.sendBookingStatusChange({
      bookingId,
      status,
      userId,
      riderId
    });
  }, []);

  const sendApprovalRequest = useCallback((
    requestId: string,
    type: string,
    requesterId: string
  ) => {
    websocketService.sendApprovalRequest({
      requestId,
      type,
      requesterId
    });
  }, []);

  const sendAdminBroadcast = useCallback((
    title: string,
    message: string
  ) => {
    websocketService.sendAdminBroadcast({
      title,
      message
    });
  }, []);

  return {
    sendBookingStatusChange,
    sendApprovalRequest,
    sendAdminBroadcast
  };
};