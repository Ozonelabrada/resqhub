/**
 * ============================================================
 * SIGNALR WEBSOCKET SERVICE
 * ============================================================
 * 
 * This service integrates with the backend SignalR hub to receive
 * real-time notifications for various operations.
 * 
 * Based on backend guide: FRONTEND REAL-TIME NOTIFICATIONS IMPLEMENTATION GUIDE
 * 
 * ============================================================
 * EVENTS RECEIVED FROM BACKEND
 * ============================================================
 * 
 * BOOKING OPERATIONS:
 * - BookingCreated: When customer creates a booking
 * - BookingCancelled: When booking is cancelled
 * - BookingStatusUpdated: When booking status changes (accepted, completed, etc.)
 * 
 * COMMUNITY OPERATIONS:
 * - CommunityCreated: When community is created
 * - CommunityApproved: When admin approves community
 * - CommunityDenied: When admin rejects community
 * - LeftCommunity: When member leaves community
 * - MemberLeftCommunity: When admin notified of member leaving
 * 
 * APPLICATION OPERATIONS:
 * - RiderApplicationApproved: When admin approves rider application
 * - RiderApplicationDenied: When admin denies rider application
 * - RiderApplicationSuspended: When admin suspends rider account
 * 
 * SERVICE CREDITS:
 * - CreditsGranted: When admin grants credits to user
 * - CreditsDeducted: When credits are deducted from booking/service
 * 
 * USER OPERATIONS:
 * - UserStatusUpdated: When admin changes user status (Active/Inactive/Suspended/Banned)
 * - UserRoleUpdated: When admin changes user role (Admin/Moderator/User)
 * 
 * ANNOUNCEMENTS:
 * - AnnouncementCreated: When admin creates announcement
 * - AnnouncementUpdated: When admin updates announcement
 * - AnnouncementReceived: When user receives announcement
 * 
 * GENERIC:
 * - ReceiveNotification: Generic notification from backend
 * 
 * ============================================================
 * DATA STRUCTURE REFERENCE
 * ============================================================
 * 
 * All events from backend follow this structure:
 * {
 *   title: "emoji description",     // e.g., "📱 Booking Confirmed!"
 *   message: "human readable msg",   // e.g., "Your booking has been created"
 *   [Id]: "xxxxx",                   // BookingId, CommunityId, ApplicationId, UserId, etc.
 *   Status: "current status",        // pending, accepted, approved, etc.
 *   [Info]: { firstName, lastName, email, ... },  // User/Rider/Community info
 *   [Details]: { createdAt, totalAmount, ... },   // Operation-specific details
 *   Timestamp: "ISO 8601 date"       // When operation occurred
 * }
 * 
 * See type definitions in useWebSocket.ts for detailed interfaces.
 * 
 * ============================================================
 * ADMIN DASHBOARD NOTE
 * ============================================================
 * 
 * ✅ CLARIFIED: Backend does NOT send DashboardUpdated SignalR event
 * 
 * Admin dashboard stats are fetched via API polling using `useDashboardUpdates` hook:
 * - Initial fetch on component mount
 * - Optional auto-refresh at configurable interval (default 30 seconds)
 * - Manual refresh button available
 * - Uses AdminService.getOverview() and AdminService.getStatistics()
 * 
 * Real-time updates still work via admin_notification events for:
 * - CommunityApproved / CommunityDenied
 * - RiderApplicationApproved / RiderApplicationDenied / RiderApplicationSuspended
 * - UserStatusUpdated / UserRoleUpdated
 * - CreditsGranted / CreditsDeducted
 * 
 * ============================================================
 */

import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { authManager } from '../utils/sessionManager';

class WebSocketService {
  private connection: HubConnection | null = null;
  private isConnecting = false;
  private websocketSupported = true;

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupConnection();
  }

  private setupConnection() {
    // Only connect if user is authenticated
    if (!authManager.isAuthenticated()) {
      return;
    }

    // WebSocket connections are disabled until hub endpoint is confirmed
    const enableWebSocket = import.meta.env.VITE_APP_ENABLE_WEBSOCKET === 'true';
    if (!enableWebSocket) {
      console.log('WebSocket connections are disabled. Set VITE_APP_ENABLE_WEBSOCKET=true to enable.');
      return;
    }

    if (this.isConnecting || this.connection?.state === HubConnectionState.Connected || !this.websocketSupported) return;

    this.isConnecting = true;

    const token = authManager.getToken();
    const baseURL = import.meta.env.VITE_APP_API_BASE_URL || 'https://findrhub.api.dev.nextstep-software.com';

    // Build the SignalR hub URL
    const hubUrl = `${baseURL}/notificationHub`;

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        transport: 4, // Try LongPolling first (WebSockets=1, ServerSentEvents=2, LongPolling=4)
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.startConnection();
  }

  private async startConnection() {
    if (!this.connection) return;

    try {
      console.log('🔗 Attempting SignalR connection to:', this.connection?.baseUrl || 'unknown URL');
      console.log('📋 Connection state:', HubConnectionState[this.connection.state]);
      
      await this.connection.start();
      console.log('✅ Connected to notifications hub:', this.connection.connectionId);
      this.isConnecting = false;
    } catch (error) {
      console.error('❌ SignalR connection error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = {
        message: errorMessage,
        name: error instanceof Error ? error.name : 'Unknown',
        isCorsError: errorMessage.includes('CORS') || errorMessage.includes('Access-Control') || errorMessage.includes('blocked'),
      };
      console.error('📊 Full error details:', errorDetails);
      this.isConnecting = false;

      // Handle CORS errors specifically
      if (errorDetails.isCorsError) {
        console.warn('⚠️  CORS Error: Backend is not allowing WebSocket connections from this origin.');
        console.warn('📋 Backend team needs to configure CORS for SignalR with .AllowCredentials()');
        this.websocketSupported = false;
        this.connection = null;
        return;
      }

      // Check if it's a transport error (server doesn't support SignalR)
      if (errorMessage.includes('Failed to start') || errorMessage.includes('Unable to connect')) {
        console.warn('❌ SignalR not supported by server. Real-time features will be unavailable.');
        this.websocketSupported = false;
        this.connection = null;
        return;
      }

      // Other connection errors - will retry via automatic reconnect
      console.warn('⚠️  SignalR will attempt to reconnect...');
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Handle connection events
    this.connection.onclose(() => {
      console.log('⚠️  SignalR disconnected');
      this.isConnecting = false;
    });

    this.connection.onreconnecting(() => {
      console.log('🔄 SignalR reconnecting...');
      this.isConnecting = true;
    });

    this.connection.onreconnected(() => {
      console.log('✅ SignalR reconnected:', this.connection?.connectionId);
      this.isConnecting = false;
    });

    // ============================================================
    // BOOKING OPERATIONS
    // ============================================================
    this.connection.on('BookingCreated', (data) => {
      console.log('📱 Received booking created:', data);
      this.emitToListeners('booking_created', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('BookingCancelled', (data) => {
      console.log('❌ Received booking cancelled:', data);
      this.emitToListeners('booking_cancelled', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('BookingStatusUpdated', (data) => {
      console.log('🚗 Received booking status update:', data);
      this.emitToListeners('booking_status_updated', data);
      this.emitToListeners('notification', data);
    });

    // ============================================================
    // COMMUNITY OPERATIONS
    // ============================================================
    this.connection.on('CommunityCreated', (data) => {
      console.log('🎉 Received community created:', data);
      this.emitToListeners('community_created', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('CommunityApproved', (data) => {
      console.log('✅ Received community approved:', data);
      this.emitToListeners('community_approved', data);
      this.emitToListeners('admin_notification', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('CommunityDenied', (data) => {
      console.log('⚠️ Received community denied:', data);
      this.emitToListeners('community_denied', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('LeftCommunity', (data) => {
      console.log('👋 Received left community:', data);
      this.emitToListeners('left_community', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('MemberLeftCommunity', (data) => {
      console.log('⚠️ Received member left community:', data);
      this.emitToListeners('member_left_community', data);
      this.emitToListeners('admin_notification', data);
    });

    // ============================================================
    // APPLICATION OPERATIONS (Rider, Seller, Provider)
    // ============================================================
    this.connection.on('RiderApplicationApproved', (data) => {
      console.log('🎉 Received rider application approved:', data);
      this.emitToListeners('rider_application_approved', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('RiderApplicationDenied', (data) => {
      console.log('⚠️ Received rider application denied:', data);
      this.emitToListeners('rider_application_denied', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('RiderApplicationSuspended', (data) => {
      console.log('⏸️ Received rider application suspended:', data);
      this.emitToListeners('rider_application_suspended', data);
      this.emitToListeners('notification', data);
    });

    // ============================================================
    // SERVICE CREDITS OPERATIONS
    // ============================================================
    this.connection.on('CreditsGranted', (data) => {
      console.log('🎉 Received credits granted:', data);
      this.emitToListeners('credits_granted', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('CreditsDeducted', (data) => {
      console.log('⚠️ Received credits deducted:', data);
      this.emitToListeners('credits_deducted', data);
      this.emitToListeners('notification', data);
    });

    // ============================================================
    // USER OPERATIONS
    // ============================================================
    this.connection.on('UserStatusUpdated', (data) => {
      console.log('✅ Received user status updated:', data);
      this.emitToListeners('user_status_updated', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('UserRoleUpdated', (data) => {
      console.log('🛡️ Received user role updated:', data);
      this.emitToListeners('user_role_updated', data);
      this.emitToListeners('notification', data);
    });

    // ============================================================
    // ANNOUNCEMENTS
    // ============================================================
    this.connection.on('AnnouncementCreated', (data) => {
      console.log('📢 Received announcement created:', data);
      this.emitToListeners('announcement_created', data);
      this.emitToListeners('announcement_received', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('AnnouncementUpdated', (data) => {
      console.log('📝 Received announcement updated:', data);
      this.emitToListeners('announcement_updated', data);
      this.emitToListeners('notification', data);
    });

    this.connection.on('AnnouncementReceived', (data) => {
      console.log('📢 Received announcement:', data);
      this.emitToListeners('announcement_received', data);
      this.emitToListeners('notification', data);
    });

    // ============================================================
    // GENERIC NOTIFICATIONS
    // ============================================================
    this.connection.on('ReceiveNotification', (data) => {
      console.log('📬 Received notification:', data);
      this.emitToListeners('notification', data);
    });
  }


  // Public methods
  connect() {
    this.setupConnection();
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
    this.isConnecting = false;
    this.websocketSupported = true; // Reset support flag on manual disconnect
  }

  // Send events to server
  async emit(event: string, data?: any) {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke(event, data);
      } catch (error) {
        console.error('Failed to send event:', event, error);
      }
    } else {
      console.warn('SignalR not connected, cannot emit:', event);
    }
  }

  // Listen for events
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emitToListeners(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  get isReconnecting(): boolean {
    return this.connection?.state === HubConnectionState.Reconnecting || this.isConnecting;
  }

  get isWebSocketSupported(): boolean {
    return this.websocketSupported;
  }

  // Reset WebSocket support flag (useful when switching environments)
  resetWebSocketSupport() {
    this.websocketSupported = true;
  }

  // Join specific rooms
  joinRoom(room: string) {
    this.emit('join_room', room);
  }

  leaveRoom(room: string) {
    this.emit('leave_room', room);
  }

  // Specific methods for your use cases
  sendBookingStatusChange(data: {
    bookingId: string;
    status: string;
    userId: string;
    riderId?: string;
  }) {
    this.emit('booking_status_change', data);
  }

  sendApprovalRequest(data: {
    requestId: string;
    type: string;
    requesterId: string;
  }) {
    this.emit('approval_request', data);
  }

  sendAdminBroadcast(data: {
    title: string;
    message: string;
  }) {
    this.emit('admin_broadcast', data);
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Auto-connect when user is authenticated
authManager.addListener((user) => {
  if (user) {
    websocketService.connect();
  } else {
    websocketService.disconnect();
  }
});

export default websocketService;