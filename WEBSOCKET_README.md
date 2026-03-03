# WebSocket Implementation for ResQHub

This implementation provides real-time notifications and updates for your ResQHub application using WebSocket connections.

## Features

- **Real-time Notifications**: Instant notifications for users, riders, and admins
- **Booking Updates**: Live status updates for ongoing bookings
- **Admin Dashboard**: Real-time statistics and approval requests
- **Rider Tracking**: Live rider availability and location updates
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Authentication**: JWT-based authentication for WebSocket connections

## Setup

### 1. Backend Requirements

Your backend needs to implement Socket.IO server with these endpoints:

```javascript
// Install dependencies
npm install socket.io

// Server setup
import { Server } from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  // socket.userId = decoded.id;
  // socket.userRole = decoded.role;
  next();
});

// Handle connections
io.on('connection', (socket) => {
  // Join user-specific rooms
  socket.join(`user_${socket.userId}`);

  // Handle booking status changes
  socket.on('booking_status_change', (data) => {
    // Emit to relevant users
    io.to(`user_${data.userId}`).emit('notification', {
      type: 'booking_update',
      title: 'Booking Status Update',
      message: `Your booking ${data.bookingId} status: ${data.status}`
    });
  });
});
```

### 2. Frontend Integration

The WebSocket service auto-connects when users authenticate. No manual setup required.

## Usage Examples

### Basic Notifications

```tsx
import { useWebSocketNotifications } from '@/hooks/useWebSocket';

function NotificationComponent() {
  const { notifications, unreadCount, markAsRead } = useWebSocketNotifications();

  return (
    <div>
      <h3>Notifications ({unreadCount})</h3>
      {notifications.map(notif => (
        <div key={notif.id}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
          {!notif.isRead && (
            <button onClick={() => markAsRead(notif.id)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Admin Dashboard

```tsx
import { AdminRealTimeDashboard } from '@/components/admin/AdminRealTimeDashboard';

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AdminRealTimeDashboard />
    </div>
  );
}
```

### Booking Status Updates

```tsx
import { WebSocketActions } from '@/utils/websocketActions';

// When booking status changes
WebSocketActions.notifyBookingStatusChange(
  bookingId,
  'confirmed',
  userId,
  riderId
);

// When rider is assigned
WebSocketActions.notifyRiderAssigned(bookingId, riderId, userId);
```

### Approval Requests

```tsx
// When user requests approval
WebSocketActions.requestApproval(
  applicationId,
  'rider_application',
  userId
);
```

## Available Hooks

### `useWebSocket()`
- Connection status monitoring
- Manual connect/disconnect

### `useWebSocketNotifications()`
- Real-time notification management
- Mark as read functionality

### `useBookingUpdates()`
- Booking status change notifications

### `useAdminNotifications()`
- Admin-specific notifications and actions

### `useDashboardUpdates()`
- Real-time dashboard statistics

### `useRiderUpdates()`
- Rider availability and status updates

### `useWebSocketEmitter()`
- Send custom WebSocket events

## Event Types

### Client to Server Events
- `booking_status_change`: Notify about booking updates
- `approval_request`: Request admin approval
- `admin_broadcast`: Send system-wide messages
- `rider_status_update`: Update rider availability

### Server to Client Events
- `notification`: General user notifications
- `admin_notification`: Admin-specific notifications
- `dashboard_update`: Dashboard statistics updates
- `booking_update`: Booking status changes
- `rider_update`: Rider status updates

## Integration Points

Add WebSocket notifications to your existing workflows:

1. **Booking Creation**: Notify admins of new bookings
2. **Status Changes**: Update all relevant parties
3. **Rider Assignment**: Notify user and rider
4. **Approvals**: Alert admins of pending requests
5. **Completions**: Send completion confirmations

## Error Handling

The implementation includes:
- Automatic reconnection on disconnection
- Connection status indicators
- Graceful fallback to polling if WebSocket fails
- Error logging and user feedback

## Security

- JWT authentication required for all connections
- User-specific rooms prevent unauthorized access
- Admin-only events are protected server-side
- Connection tokens expire with user sessions