/**
 * useWebSocketOptimized Hook
 * React hook for optimal WebSocket connection management with state tracking
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  WebSocketManager,
  ConnectionState,
  type WebSocketMessage,
  type WebSocketConfig,
} from '@/pwa/websocketManager';

interface WebSocketState {
  isConnected: boolean;
  state: ConnectionState;
  isLoading: boolean;
  error: string | null;
  queueLength: number;
  lastMessage: WebSocketMessage | null;
}

export type { WebSocketState };

export interface UseWebSocketOptimizedResult extends WebSocketState {
  send: (message: WebSocketMessage) => boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  manager: WebSocketManager | null;
}

export function useWebSocketOptimized(config: WebSocketConfig): UseWebSocketOptimizedResult {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    state: ConnectionState.DISCONNECTED,
    isLoading: false,
    error: null,
    queueLength: 0,
    lastMessage: null,
  });

  const managerRef = useRef<WebSocketManager | null>(null);

  /**
   * Initialize manager
   */
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new WebSocketManager(config);
    }

    return () => {
      // Don't destroy on unmount - keep connection alive
      // managerRef.current?.destroy();
    };
  }, [config]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    if (!managerRef.current) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await managerRef.current.connect();
      // State will be updated via event listeners
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
      setState((prev) => ({
        ...prev,
        isConnected: false,
        state: ConnectionState.DISCONNECTED,
      }));
    }
  }, []);

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(async () => {
    disconnect();
    // Wait a bit before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 500));
    await connect();
  }, [connect, disconnect]);

  /**
   * Send a message
   */
  const send = useCallback((message: WebSocketMessage): boolean => {
    if (!managerRef.current) return false;

    const success = managerRef.current.send(message);

    // Update queue length
    setState((prev) => ({
      ...prev,
      queueLength: managerRef.current?.getQueueLength() || 0,
      lastMessage: success ? message : prev.lastMessage,
    }));

    return success;
  }, []);

  /**
   * Setup event listeners on manager
   */
  useEffect(() => {
    if (!managerRef.current) return;

    const manager = managerRef.current;

    const unsubscribeOpen = manager.on('open', () => {
      console.log('[React] WebSocket opened');
      setState((prev) => ({
        ...prev,
        isConnected: true,
        state: ConnectionState.CONNECTED,
        isLoading: false,
        error: null,
      }));
    });

    const unsubscribeClose = manager.on('close', () => {
      console.log('[React] WebSocket closed');
      setState((prev) => ({
        ...prev,
        isConnected: false,
        state: ConnectionState.DISCONNECTED,
      }));
    });

    const unsubscribeError = manager.on('error', (event) => {
      console.error('[React] WebSocket error:', event.error);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        state: ConnectionState.FAILED,
        isLoading: false,
        error: event.error?.message || 'Connection error',
      }));
    });

    const unsubscribeReconnect = manager.on('reconnect', () => {
      console.log('[React] WebSocket reconnecting');
      setState((prev) => ({
        ...prev,
        state: ConnectionState.RECONNECTING,
      }));
    });

    const unsubscribeOffline = manager.on('offline', () => {
      console.log('[React] WebSocket offline');
      setState((prev) => ({
        ...prev,
        isConnected: false,
        state: ConnectionState.OFFLINE,
      }));
    });

    const unsubscribeMessage = manager.on('message', (event) => {
      setState((prev) => ({
        ...prev,
        lastMessage: event.data,
      }));
    });

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
      unsubscribeError();
      unsubscribeReconnect();
      unsubscribeOffline();
      unsubscribeMessage();
    };
  }, []);

  return {
    ...state,
    send,
    connect,
    disconnect,
    reconnect,
    manager: managerRef.current,
  };
}

/**
 * useWebSocketMessage Hook
 * React hook for subscribing to specific WebSocket message types
 */

export interface UseWebSocketMessageResult {
  messages: WebSocketMessage[];
  latestMessage: WebSocketMessage | null;
  messageCount: number;
  clearMessages: () => void;
}

export function useWebSocketMessage(
  manager: WebSocketManager | null,
  messageType?: string,
): UseWebSocketMessageResult {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [latestMessage, setLatestMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!manager) return;

    const unsubscribe = manager.on('message', (event) => {
      const message = event.data as WebSocketMessage;

      if (!messageType || message.type === messageType) {
        setLatestMessage(message);
        setMessages((prev) => [...prev.slice(-99), message]); // Keep last 100 messages
      }
    });

    return () => unsubscribe();
  }, [manager, messageType]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLatestMessage(null);
  }, []);

  return {
    messages,
    latestMessage,
    messageCount: messages.length,
    clearMessages,
  };
}


