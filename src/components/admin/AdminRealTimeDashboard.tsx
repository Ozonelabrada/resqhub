import React from 'react';
import { useAdminNotifications, useDashboardUpdates, useWebSocket } from '../../hooks/useWebSocket';
import { Activity, Users, DollarSign, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface AdminRealTimeDashboardProps {
  className?: string;
}

export const AdminRealTimeDashboard: React.FC<AdminRealTimeDashboardProps> = ({
  className = ''
}) => {
  const { adminNotifications, pendingActions, markActionCompleted } = useAdminNotifications();
  const { dashboardData, lastUpdate } = useDashboardUpdates();
  const { isConnected } = useWebSocket();

  const recentNotifications = adminNotifications.slice(0, 5);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          {isConnected ? 'Live Updates Active' : 'Connection Lost'}
        </span>
        {lastUpdate && (
          <span className="text-gray-500 ml-auto">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.activeBookings || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingApprovals || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Riders</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.onlineRiders || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-purple-600">
                ₱{dashboardData.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Pending Actions ({pendingActions.length})
          </h3>
          <div className="space-y-2">
            {pendingActions.slice(0, 3).map((action) => (
              <div key={action.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.message}</p>
                </div>
                <button
                  onClick={() => markActionCompleted(action.id)}
                  className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                >
                  Mark Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Admin Notifications */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentNotifications.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              No recent activity
            </p>
          ) : (
            recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.priority === 'urgent' ? 'bg-red-500' :
                  notification.priority === 'high' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRealTimeDashboard;