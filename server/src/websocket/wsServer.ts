import * as http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import * as jwt from 'jsonwebtoken';
import { URL } from 'url';
import supabase from '../config/supabase';
import { Content, WsMessage } from '../types';

// ----------------------------------------------------------------
// In-memory client stores
// ----------------------------------------------------------------
const adminClients = new Set<WebSocket>();
const deviceClients = new Map<string, WebSocket>();

// Map to hold heartbeat timeout handles per WebSocket
const heartbeatTimeouts = new Map<WebSocket, ReturnType<typeof setTimeout>>();

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function send(ws: WebSocket, msg: WsMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function broadcastToAdmins(message: WsMessage): void {
  for (const ws of adminClients) {
    send(ws, message);
  }
}

export function sendContentUpdate(deviceId: string, content: Content | null): void {
  const ws = deviceClients.get(deviceId);
  if (ws) {
    send(ws, {
      type: 'content:update',
      payload: {
        contentId: content ? content.id : null,
        content,
      },
    });
  }
}

export async function resetAllDevicesOffline(): Promise<void> {
  const { error } = await supabase
    .from('devices')
    .update({ status: 'offline', last_seen: null })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all rows

  if (error) {
    console.error('[WS] Failed to reset devices offline on startup:', error.message);
  } else {
    console.log('[WS] All devices reset to offline on startup.');
  }
}

// ----------------------------------------------------------------
// Heartbeat
// ----------------------------------------------------------------
function startHeartbeat(wss: WebSocketServer): void {
  setInterval(() => {
    const allClients = [...adminClients, ...deviceClients.values()];

    for (const ws of allClients) {
      if (ws.readyState !== WebSocket.OPEN) continue;

      // Send ping; expect pong within 10 seconds
      send(ws, { type: 'ping' });

      const timeout = setTimeout(() => {
        console.warn('[WS] Client did not respond to ping — terminating.');
        ws.terminate();
      }, 10_000);

      heartbeatTimeouts.set(ws, timeout);
    }
  }, 20_000);
}

// ----------------------------------------------------------------
// DB helpers
// ----------------------------------------------------------------
async function setDeviceOnline(deviceId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('devices')
    .update({ status: 'online', last_seen: now })
    .eq('id', deviceId);

  if (error) {
    console.error(`[WS] Failed to set device ${deviceId} online:`, error.message);
  }

  broadcastToAdmins({
    type: 'device:status',
    payload: { deviceId, status: 'online', last_seen: now },
  });
}

async function setDeviceOffline(deviceId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('devices')
    .update({ status: 'offline', last_seen: now })
    .eq('id', deviceId);

  if (error) {
    console.error(`[WS] Failed to set device ${deviceId} offline:`, error.message);
  }

  broadcastToAdmins({
    type: 'device:status',
    payload: { deviceId, status: 'offline', last_seen: now },
  });
}

// ----------------------------------------------------------------
// Init
// ----------------------------------------------------------------
export function initWsServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    // Parse query params from request URL
    const baseUrl = `http://localhost`;
    const url = new URL(req.url ?? '/', baseUrl);
    const role = url.searchParams.get('role') ?? '';
    const deviceId = url.searchParams.get('deviceId') ?? '';
    const token = url.searchParams.get('token') ?? '';

    if (role === 'admin') {
      // Verify JWT
      try {
        jwt.verify(token, process.env.JWT_SECRET as string);
      } catch {
        ws.close(4001, 'Unauthorized');
        return;
      }
      adminClients.add(ws);
      console.log(`[WS] Admin connected. Total admins: ${adminClients.size}`);

      ws.on('message', (data: Buffer) => {
        try {
          const msg: WsMessage = JSON.parse(data.toString());
          if (msg.type === 'pong') {
            const timeout = heartbeatTimeouts.get(ws);
            if (timeout) {
              clearTimeout(timeout);
              heartbeatTimeouts.delete(ws);
            }
          } else if (msg.type === 'ping') {
            send(ws, { type: 'pong' });
          }
        } catch {
          // ignore malformed messages
        }
      });

      ws.on('close', () => {
        adminClients.delete(ws);
        const timeout = heartbeatTimeouts.get(ws);
        if (timeout) clearTimeout(timeout);
        heartbeatTimeouts.delete(ws);
        console.log(`[WS] Admin disconnected. Total admins: ${adminClients.size}`);
      });
    } else if (role === 'device') {
      if (!deviceId) {
        ws.close(4000, 'deviceId required');
        return;
      }
      deviceClients.set(deviceId, ws);
      setDeviceOnline(deviceId);
      console.log(`[WS] Device connected: ${deviceId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const msg: WsMessage = JSON.parse(data.toString());
          if (msg.type === 'pong') {
            const timeout = heartbeatTimeouts.get(ws);
            if (timeout) {
              clearTimeout(timeout);
              heartbeatTimeouts.delete(ws);
            }
          } else if (msg.type === 'ping') {
            send(ws, { type: 'pong' });
          }
        } catch {
          // ignore malformed messages
        }
      });

      ws.on('close', () => {
        deviceClients.delete(deviceId);
        const timeout = heartbeatTimeouts.get(ws);
        if (timeout) clearTimeout(timeout);
        heartbeatTimeouts.delete(ws);
        setDeviceOffline(deviceId);
        console.log(`[WS] Device disconnected: ${deviceId}`);
      });
    } else {
      ws.close(4000, 'Unknown role');
    }
  });

  startHeartbeat(wss);

  console.log('[WS] WebSocket server initialised on path /ws');
  return wss;
}
