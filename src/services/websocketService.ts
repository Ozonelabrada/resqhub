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

    // Handle booking status updates (as per backend documentation)
    this.connection.on('BookingStatusUpdated', (data) => {
      console.log('📬 Received booking status update:', data);
      this.emitToListeners('booking_status_updated', data);
    });

    // Handle booking accepted notification (as per backend documentation)
    this.connection.on('BookingAccepted', (data) => {
      console.log('✅ Received booking accepted:', data);
      this.emitToListeners('booking_accepted', data);
    });

    // Handle real-time notifications (generic)
    this.connection.on('ReceiveNotification', (data) => {
      console.log('📬 Received notification:', data);
      this.emitToListeners('notification', data);
    });

    // Handle community approval/denial events
    this.connection.on('CommunityApproved', (data) => {
      console.log('✅ Received community approved:', data);
      this.emitToListeners('community_approved', data);
    });

    this.connection.on('CommunityDenied', (data) => {
      console.log('❌ Received community denied:', data);
      this.emitToListeners('community_denied', data);
    });

    // Handle announcement events
    this.connection.on('AnnouncementCreated', (data) => {
      console.log('📢 Received announcement created:', data);
      this.emitToListeners('announcement_created', data);
      this.emitToListeners('announcement_received', data);
    });

    this.connection.on('AnnouncementUpdated', (data) => {
      console.log('📝 Received announcement updated:', data);
      this.emitToListeners('announcement_updated', data);
    });

    this.connection.on('AnnouncementReceived', (data) => {
      console.log('📢 Received announcement:', data);
      this.emitToListeners('announcement_received', data);
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