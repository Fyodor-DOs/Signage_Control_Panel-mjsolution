'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DeviceStatus {
  status: 'online' | 'offline';
  last_seen: string | null;
}

interface UseAdminSocketResult {
  isConnected: boolean;
  deviceStatuses: Map<string, DeviceStatus>;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export function useAdminSocket(token: string | null): UseAdminSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatus>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!token || unmountedRef.current) return;

    const ws = new WebSocket(`${WS_URL}/ws?role=admin&token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmountedRef.current) return;
      setIsConnected(true);
      reconnectDelayRef.current = 1000;
    };

    ws.onmessage = (event) => {
      if (unmountedRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        } else if (msg.type === 'device:status') {
          const { deviceId, status, last_seen } = msg.payload;
          setDeviceStatuses((prev) => {
            const next = new Map(prev);
            next.set(deviceId, { status, last_seen });
            return next;
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setIsConnected(false);
      wsRef.current = null;
      // Reconnect with exponential backoff
      const delay = Math.min(reconnectDelayRef.current, 30000);
      reconnectDelayRef.current = delay * 2;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    unmountedRef.current = false;
    if (!token) return;
    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token, connect]);

  return { isConnected, deviceStatuses };
}
