import { useEffect, useRef, useCallback } from 'react';
import type { WsMessage } from '@appTypes/api';

type MessageHandler = (msg: WsMessage) => void;

interface UseWebSocketOptions {
  token: string | null;
  onMessage: MessageHandler;
  enabled?: boolean;
}

const WS_URL = import.meta.env.VITE_WS_URL as string;
const RECONNECT_DELAY = 3000;

export function useWebSocket({ token, onMessage, enabled = true }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        onMessageRef.current(msg);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (enabled && token) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token, enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
