import { useEffect, useRef, useCallback } from 'react';
import type { WsMessage } from '@appTypes/api';

type MessageHandler = (msg: WsMessage) => void;

interface UseWebSocketOptions {
  token: string | null;
  onMessage: MessageHandler;
  enabled?: boolean;
}

const WS_URL = import.meta.env.VITE_WS_URL as string;
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

export function useWebSocket({ token, onMessage, enabled = true }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  const retriesRef = useRef(0);
  const enabledRef = useRef(enabled);
  onMessageRef.current = onMessage;
  enabledRef.current = enabled;

  const clearTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const connect = useCallback(() => {
    if (!token || !enabledRef.current) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Reset retry counter on successful connection
      retriesRef.current = 0;
    };

    ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        onMessageRef.current(msg);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (enabledRef.current && token && retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    retriesRef.current = 0;
    connect();
    return () => {
      clearTimer();
      wsRef.current?.close();
    };
  }, [connect]);

  // Clean up when enabled changes to false
  useEffect(() => {
    if (!enabled) {
      clearTimer();
      wsRef.current?.close();
    }
  }, [enabled]);
}
