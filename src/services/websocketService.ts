import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { authManager } from '../utils/sessionManager';

class WebSocketService {
  private connection: HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private websocketSupported = true; // Assume supported until proven otherwise

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupConnection();
  }

  private setupConnection() {
    if (this.isConnecting || this.connection?.state === HubConnectionState.Connected || !this.websocketSupported) return;

    this.isConnecting = true;

    const token = authManager.getToken();
    const baseURL = import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com';

    // Build the SignalR hub URL
    const hubUrl = `${baseURL}/notificationHub`;

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        transport: 1 | 2 | 4, // WebSockets | ServerSentEvents | LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.startConnection();
  }

  private async startConnection() {
    if (!this.connection) return;

    try {
      await this.connection.start();
      console.log('SignalR connected:', this.connection.connectionId);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    } catch (error) {
      console.error('SignalR connection error:', error);
      this.isConnecting = false;

      // Check if it's a transport error (server doesn't support SignalR)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to start') || errorMessage.includes('Unable to connect')) {
        console.warn('SignalR not supported by server. Real-time features will be unavailable.');
        this.websocketSupported = false;
        this.connection = null;
        return; // Don't attempt reconnection for transport errors
      }

      this.attemptReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Handle connection events
    this.connection.onclose(() => {
      console.log('SignalR disconnected');
      this.isConnecting = false;
      this.attemptReconnect();
    });

    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.isConnecting = true;
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected:', this.connection?.connectionId);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    // Handle real-time notifications
    this.connection.on('ReceiveNotification', (data) => {
      console.log('Received notification:', data);
      this.emitToListeners('notification', data);
    });

    // Handle community approval/denial events
    this.connection.on('CommunityApproved', (data) => {
      console.log('Received community approved:', data);
      this.emitToListeners('community_approved', data);
    });

    this.connection.on('CommunityDenied', (data) => {
      console.log('Received community denied:', data);
      this.emitToListeners('community_denied', data);
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.setupConnection();
    }, delay);
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