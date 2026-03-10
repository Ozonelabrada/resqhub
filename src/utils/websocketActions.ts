import { websocketService } from '../services/websocketService';

// Utility functions to emit WebSocket events for common actions
export class WebSocketActions {
  /**
   * Notify when booking status changes
   */
  static notifyBookingStatusChange(
    bookingId: string,
    status: string,
    userId: string,
    riderId?: string,
    additionalData?: any
  ) {
    websocketService.sendBookingStatusChange({
      bookingId,
      status,
      userId,
      riderId
    });
  }

  /**
   * Notify when a rider is assigned to a booking
   */
  static notifyRiderAssigned(
    bookingId: string,
    riderId: string,
    userId: string
  ) {
    this.notifyBookingStatusChange(bookingId, 'rider_assigned', userId, riderId, {
      assignmentTime: new Date().toISOString()
    });
  }

  /**
   * Notify when booking is confirmed
   */
  static notifyBookingConfirmed(
    bookingId: string,
    userId: string,
    riderId?: string
  ) {
    this.notifyBookingStatusChange(bookingId, 'confirmed', userId, riderId);
  }

  /**
   * Notify when booking is completed
   */
  static notifyBookingCompleted(
    bookingId: string,
    userId: string,
    riderId?: string
  ) {
    this.notifyBookingStatusChange(bookingId, 'completed', userId, riderId);
  }

  /**
   * Notify when booking is cancelled
   */
  static notifyBookingCancelled(
    bookingId: string,
    userId: string,
    riderId?: string,
    reason?: string
  ) {
    this.notifyBookingStatusChange(bookingId, 'cancelled', userId, riderId, { reason });
  }

  /**
   * Send approval request notification to admins
   */
  static requestApproval(
    requestId: string,
    type: 'rider_application' | 'community_application' | 'report_action',
    requesterId: string,
    details?: any
  ) {
    websocketService.sendApprovalRequest({
      requestId,
      type,
      requesterId
    });
  }

  /**
   * Send admin broadcast message
   */
  static sendAdminBroadcast(
    title: string,
    message: string,
    targetUsers?: string[] // Optional: specific user IDs, if not provided, broadcasts to all
  ) {
    websocketService.sendAdminBroadcast({
      title,
      message
    });
  }

  /**
   * Update rider status (for real-time rider tracking)
   */
  static updateRiderStatus(
    riderId: string,
    status: 'available' | 'busy' | 'offline',
    location?: { lat: number; lng: number },
    currentBooking?: string
  ) {
    websocketService.emit('rider_status_update', {
      riderId,
      status,
      location,
      currentBooking
    });
  }

  /**
   * Request dashboard data refresh (for admin)
   */
  static requestDashboardUpdate() {
    websocketService.emit('request_dashboard_update');
  }
}

// Integration examples for your existing services:

// In your booking service, when status changes:
// WebSocketActions.notifyBookingStatusChange(bookingId, newStatus, userId, riderId);

// In your admin service, when approving applications:
// WebSocketActions.requestApproval(applicationId, 'rider_application', userId);

// In your rider service, when updating availability:
// WebSocketActions.updateRiderStatus(riderId, 'available', currentLocation);

// In your admin dashboard, to broadcast messages:
// WebSocketActions.sendAdminBroadcast('System Maintenance', 'Scheduled maintenance in 30 minutes');

export default WebSocketActions;