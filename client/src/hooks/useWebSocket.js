import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * WebSocket hook for Maraya story streaming.
 * Forked from dawayir's WebSocket pattern, simplified for scene-based messaging.
 */
export default function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const handlersRef = useRef({});
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    shouldReconnectRef.current = true;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // In dev mode (Vite), connect directly to the backend server.
    // In production, the server serves the client, so use the same host.
    const isDev = import.meta.env.DEV;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = isDev ? 'localhost:3002' : window.location.host;
    const url = `${protocol}//${host}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return;

      setIsConnected(true);
      setError(null);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handler = handlersRef.current[message.type];

        if (handler) {
          handler(message);
        }

        // Also fire a generic handler
        if (handlersRef.current['*']) {
          handlersRef.current['*'](message);
        }
      } catch (err) {
        console.error('[ws] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      if (!shouldReconnectRef.current || reconnectTimerRef.current) {
        return;
      }

      // Auto-reconnect after 3 seconds for unexpected disconnects only.
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      if (!shouldReconnectRef.current) return;

      setError('Failed to connect to server');
      console.error('[ws] WebSocket error:', err);
    };
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      ws.close();
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type, data = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  const on = useCallback((type, handler) => {
    handlersRef.current[type] = handler;
  }, []);

  const off = useCallback((type) => {
    delete handlersRef.current[type];
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { isConnected, error, connect, disconnect, sendMessage, on, off };
}
