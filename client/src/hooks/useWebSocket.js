import { useState, useRef, useCallback, useEffect } from 'react';

function appendQuery(url, query = {}) {
  const entries = Object.entries(query).filter(([, value]) => value != null && value !== '');
  if (entries.length === 0) return url;

  const nextUrl = new URL(url, window.location.origin);
  entries.forEach(([key, value]) => {
    nextUrl.searchParams.set(key, String(value));
  });
  return nextUrl.toString();
}

/**
 * WebSocket hook for Maraya story streaming.
 * Forked from dawayir's WebSocket pattern, simplified for scene-based messaging.
 */
export default function useWebSocket({ query } = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const handlersRef = useRef({});
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  const lastMetaRef = useRef(null);

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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const configuredUrl = import.meta.env.VITE_WS_URL;
    const host = window.location.host;
    const url = appendQuery(configuredUrl || `${protocol}//${host}/ws`, query);

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

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const handler = handlersRef.current.audio_chunk;
        if (handler && lastMetaRef.current) {
          handler({
            meta: lastMetaRef.current,
            blob: event.data,
          });
          lastMetaRef.current = null;
        }
        return;
      }

      try {
        const message = JSON.parse(event.data);

        if (message.type === 'audio_meta') {
          lastMetaRef.current = message;
        }

        const handler = handlersRef.current[message.type];
        if (handler) {
          handler(message);
        }

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
  }, [query]);

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

  useEffect(() => () => {
    disconnect();
  }, [disconnect]);

  return { isConnected, error, connect, disconnect, sendMessage, on, off };
}
