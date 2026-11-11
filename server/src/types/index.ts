// ============================================================
// Shared TypeScript interfaces & types
// ============================================================

export interface Device {
  id: string;
  nama: string;
  lokasi: string;
  status: 'online' | 'offline';
  last_seen: string | null;
  content_id: string | null;
}

export interface Content {
  id: string;
  judul: string;
  tipe: 'image' | 'video' | 'text';
  payload: string;
  created_at: string;
}

// ------------------------------------
// WebSocket message union type
// ------------------------------------
export type WsMessage =
  | {
      type: 'device:status';
      payload: {
        deviceId: string;
        status: 'online' | 'offline';
        last_seen: string | null;
      };
    }
  | {
      type: 'content:update';
      payload: {
        contentId: string | null;
        content: Content | null;
      };
    }
  | { type: 'ping' }
  | { type: 'pong' };
