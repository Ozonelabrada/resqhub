import api from '../api/client';
import { authManager } from '../utils/sessionManager';
import websocketService from './websocketService';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  bookingUpdates: boolean;
  riderAssignments: boolean;
  adminBroadcasts: boolean;
}

class NotificationService {
  private realtimeNotifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  constructor() {
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    websocketService.on('notification', (data: any) => {
      const notification: Notification = {
        id: data.id || `ws_${Date.now()}`,
        userId: authManager.getUser()?.id || '',
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
        expiresAt: data.expiresAt
      };

      this.addRealtimeNotification(notification);
    });
  }

  private addRealtimeNotification(notification: Notification) {
    this.realtimeNotifications.unshift(notification);
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener([...this.realtimeNotifications]);
    });
  }

  // Subscribe to real-time notifications
  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback);
    // Send current notifications immediately
    callback([...this.realtimeNotifications]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Get stored notifications from server
  async getNotifications(page: number = 1, pageSize: number = 20): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await api.get('/notifications', {
        params: { page, pageSize }
      });

      return {
        notifications: response.data.data?.notifications || [],
        total: response.data.data?.total || 0,
        page: response.data.data?.page || page,
        pageSize: response.data.data?.pageSize || pageSize
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        notifications: [],
        total: 0,
        page,
        pageSize
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await api.put(`/notifications/${notificationId}/read`);

      // Update local state
      this.realtimeNotifications = this.realtimeNotifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      );
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      await api.put('/notifications/mark-all-read');

      // Update local state
      this.realtimeNotifications = this.realtimeNotifications.map(notif => ({
        ...notif,
        isRead: true
      }));
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await api.delete(`/notifications/${notificationId}`);

      // Update local state
      this.realtimeNotifications = this.realtimeNotifications.filter(
        notif => notif.id !== notificationId
      );
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Fallback to counting local notifications
      return this.realtimeNotifications.filter(n => !n.isRead).length;
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data.data || this.getDefaultPreferences();
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      await api.put('/notifications/preferences', preferences);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      bookingUpdates: true,
      riderAssignments: true,
      adminBroadcasts: true
    };
  }

  // Get combined notifications (real-time + stored)
  getAllNotifications(): Notification[] {
    return [...this.realtimeNotifications];
  }

  // Clear all real-time notifications
  clearRealtimeNotifications() {
    this.realtimeNotifications = [];
    this.notifyListeners();
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

export default notificationService;
