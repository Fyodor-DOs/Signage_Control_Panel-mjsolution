'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Content } from '@/lib/types';

interface UseDeviceSocketResult {
  isConnected: boolean;
  currentContent: Content | null;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export function useDeviceSocket(deviceId: string | null): UseDeviceSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!deviceId || unmountedRef.current) return;

    const ws = new WebSocket(`${WS_URL}/ws?role=device&deviceId=${deviceId}`);
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
        } else if (msg.type === 'content:update') {
          setCurrentContent(msg.payload.content);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setIsConnected(false);
      wsRef.current = null;
      const delay = Math.min(reconnectDelayRef.current, 30000);
      reconnectDelayRef.current = delay * 2;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [deviceId]);

  useEffect(() => {
    unmountedRef.current = false;
    if (!deviceId) return;
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
  }, [deviceId, connect]);

  return { isConnected, currentContent };
}
