import React, { useEffect } from 'react';
import { useWebSocketNotifications, useWebSocket } from '../../hooks/useWebSocket';
import { Bell, Wifi, WifiOff } from 'lucide-react';

interface RealTimeNotificationsProps {
  className?: string;
}

export const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({
  className = ''
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useWebSocketNotifications();
  const { isConnected, isReconnecting } = useWebSocket();

  // Auto-mark notifications as read after 5 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        notifications.forEach((notif: any) => {
          if (!notif.isRead) {
            markAsRead(notif.id);
          }
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications, markAsRead]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
          </span>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">Real-time updates will appear here</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification: any) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                !notification.isRead
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      notification.type === 'booking_update'
                        ? 'bg-green-100 text-green-800'
                        : notification.type === 'rider_assigned'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {notifications.length > 10 && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500">
              And {notifications.length - 10} more notifications...
            </span>
          </div>
        )}
      </div>

      {/* Connection Issues */}
      {!isConnected && !isReconnecting && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Connection lost. Some notifications may be delayed.
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;