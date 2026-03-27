/**
 * WebSocket Manager with Reconnection Strategy
 * Handles connection pooling, exponential backoff, and automatic reconnection
 */

export interface WebSocketConfig {
  url: string;
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  backoffMultiplier?: number;
  heartbeatIntervalMs?: number;
  messageQueueSize?: number;
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

export type WebSocketEventType = 'open' | 'close' | 'error' | 'message' | 'reconnect' | 'offline';
export type WebSocketEventHandler = (event: WebSocketEvent) => void;

export interface WebSocketEvent {
  type: WebSocketEventType;
  data?: any;
  error?: Error;
  timestamp: number;
}

/**
 * WebSocket Connection State
 */
export const ConnectionState = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  FAILED: 'FAILED',
  OFFLINE: 'OFFLINE',
  RECONNECTING: 'RECONNECTING',
} as const;

export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState];

/**
 * WebSocket Manager
 * Manages a single WebSocket connection with automatic reconnection
 */
export class WebSocketManager {
  private config: Required<WebSocketConfig>;
  private ws: WebSocket | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private retryCount: number = 0;
  private currentBackoffMs: number;
  private messageQueue: WebSocketMessage[] = [];
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor(config: WebSocketConfig) {
    this.config = {
      maxRetries: 10,
      initialBackoffMs: 1000,
      maxBackoffMs: 30000,
      backoffMultiplier: 1.5,
      heartbeatIntervalMs: 30000,
      messageQueueSize: 100,
      ...config,
    };

    this.currentBackoffMs = this.config.initialBackoffMs;

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      console.log(`ℹ️ WebSocket already ${this.state.toLowerCase()}`);
      return;
    }

    if (!this.isOnline) {
      this.state = ConnectionState.OFFLINE;
      this.emit('offline', { error: new Error('No internet connection') });
      return;
    }

    this.state = ConnectionState.CONNECTING;
    console.log(`🔗 Connecting to WebSocket: ${this.config.url}`);

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.addEventListener('open', () => this.handleOpen());
      this.ws.addEventListener('close', () => this.handleClose());
      this.ws.addEventListener('error', (event) => this.handleError(event));
      this.ws.addEventListener('message', (event) => this.handleMessage(event));
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    this.clearTimers();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.state = ConnectionState.DISCONNECTED;
    this.retryCount = 0;
    this.currentBackoffMs = this.config.initialBackoffMs;
  }

  /**
   * Send a message through the WebSocket
   */
  public send(message: WebSocketMessage): boolean {
    const data = JSON.stringify({
      ...message,
      timestamp: message.timestamp || Date.now(),
    });

    if (this.state === ConnectionState.CONNECTED && this.ws) {
      try {
        this.ws.send(data);
        console.log(`📤 WebSocket message sent:`, message.type);
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.queueMessage(message);
        return false;
      }
    } else {
      // Queue message for later
      this.queueMessage(message);
      console.log(`📋 Message queued (state: ${this.state}):`, message.type);
      return false;
    }
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Get message queue length
   */
  public getQueueLength(): number {
    return this.messageQueue.length;
  }

  /**
   * Register event handler
   */
  public on(event: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Remove event handler
   */
  public off(event: WebSocketEventType, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Private Methods
   */

  private handleOpen = () => {
    console.log('✅ WebSocket connected');
    this.state = ConnectionState.CONNECTED;
    this.retryCount = 0;
    this.currentBackoffMs = this.config.initialBackoffMs;

    // Flush queued messages
    this.flushMessageQueue();

    // Start heartbeat
    this.startHeartbeat();

    this.emit('open', {});
  };

  private handleClose = () => {
    console.log('⏹️  WebSocket closed');
    this.state = ConnectionState.DISCONNECTED;
    this.clearTimers();

    if (this.isOnline && this.retryCount < this.config.maxRetries) {
      this.scheduleReconnect();
    }

    this.emit('close', {});
  };

  private handleError = (error: Error | Event) => {
    const err = error instanceof Error ? error : new Error('Unknown WebSocket error');
    console.error('❌ WebSocket error:', err);

    this.state = ConnectionState.FAILED;
    this.emit('error', { error: err });

    if (this.retryCount < this.config.maxRetries) {
      this.scheduleReconnect();
    }
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      console.log(`📥 WebSocket message received:`, data.type);
      this.emit('message', { data });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  private handleOnline = () => {
    console.log('🌐 Online detected');
    this.isOnline = true;

    if (this.state === ConnectionState.OFFLINE) {
      this.connect();
    } else if (this.state === ConnectionState.FAILED) {
      this.scheduleReconnect();
    }

    this.emit('reconnect', {});
  };

  private handleOffline = () => {
    console.log('📵 Offline detected');
    this.isOnline = false;

    if (this.state === ConnectionState.CONNECTED) {
      this.state = ConnectionState.OFFLINE;
      this.clearTimers();
      this.emit('offline', { error: new Error('Connection lost') });
    }
  };

  private scheduleReconnect = () => {
    if (this.state === ConnectionState.RECONNECTING) {
      return;
    }

    this.state = ConnectionState.RECONNECTING;
    this.retryCount++;

    const backoffMs = Math.min(
      this.currentBackoffMs,
      this.config.maxBackoffMs,
    );

    console.log(
      `⏱️  Reconnecting in ${backoffMs}ms (attempt ${this.retryCount}/${this.config.maxRetries})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.currentBackoffMs *= this.config.backoffMultiplier;
      this.connect();
    }, backoffMs);
  };

  private queueMessage = (message: WebSocketMessage): void => {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);
  };

  private flushMessageQueue = (): void => {
    console.log(`📤 Flushing ${this.messageQueue.length} queued messages`);

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws && this.state === ConnectionState.CONNECTED) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Failed to flush message:', error);
          this.queueMessage(message);
          break;
        }
      }
    }
  };

  private startHeartbeat = (): void => {
    this.clearHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        this.send({
          type: 'HEARTBEAT',
          timestamp: Date.now(),
        });
      }
    }, this.config.heartbeatIntervalMs);
  };

  private clearTimers = (): void => {
    this.clearHeartbeat();
    this.clearReconnectTimer();
  };

  private clearHeartbeat = (): void => {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  };

  private clearReconnectTimer = (): void => {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  };

  private emit = (event: WebSocketEventType, data: Partial<WebSocketEvent>): void => {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const wsEvent: WebSocketEvent = {
        type: event,
        timestamp: Date.now(),
        ...data,
      };
      handlers.forEach((handler) => {
        try {
          handler(wsEvent);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  };

  /**
   * Cleanup
   */
  public destroy(): void {
    this.disconnect();
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
    this.eventHandlers.clear();
    this.messageQueue = [];
  }
}

/**
 * WebSocket Connection Pool
 * Manages multiple WebSocket connections for different purposes
 */
export class WebSocketPool {
  private connections: Map<string, WebSocketManager> = new Map();
  private config: Partial<WebSocketConfig>;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = config || {};
  }

  /**
   * Get or create a connection
   */
  public getConnection(id: string, url: string): WebSocketManager {
    if (!this.connections.has(id)) {
      const connection = new WebSocketManager({
        url,
        ...this.config,
      });
      this.connections.set(id, connection);
    }
    return this.connections.get(id)!;
  }

  /**
   * Connect a connection by ID
   */
  public async connect(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (connection) {
      await connection.connect();
    }
  }

  /**
   * Disconnect a connection by ID
   */
  public disconnect(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.disconnect();
    }
  }

  /**
   * Disconnect all connections
   */
  public disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.disconnect();
    });
  }

  /**
   * Remove and destroy a connection
   */
  public removeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.destroy();
      this.connections.delete(id);
    }
  }

  /**
   * Get connection status
   */
  public getStatus(id?: string): Record<string, ConnectionState> {
    if (id) {
      const connection = this.connections.get(id);
      return { [id]: connection?.getState() || ConnectionState.DISCONNECTED };
    }

    const status: Record<string, ConnectionState> = {};
    this.connections.forEach((connection, key) => {
      status[key] = connection.getState();
    });
    return status;
  }

  /**
   * Cleanup all connections
   */
  public destroy(): void {
    this.connections.forEach((connection) => {
      connection.destroy();
    });
    this.connections.clear();
  }
}

/**
 * Global WebSocket Pool Instance
 */
let globalPool: WebSocketPool | null = null;

export function getGlobalWebSocketPool(): WebSocketPool {
  if (!globalPool) {
    globalPool = new WebSocketPool();
  }
  return globalPool;
}

export function resetGlobalWebSocketPool(): void {
  if (globalPool) {
    globalPool.destroy();
    globalPool = null;
  }
}
