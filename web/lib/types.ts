export interface Device {
  id: string;
  nama: string;
  lokasi: string;
  status: 'online' | 'offline';
  last_seen: string | null;
  content_id: string | null;
  content?: Content | null; // joined
}

export interface Content {
  id: string;
  judul: string;
  tipe: 'image' | 'video' | 'text';
  payload: string;
  created_at: string;
}

export interface PlaylistItem {
  id: string;
  device_id: string;
  content_id: string;
  urutan: number;
  durasi: number;
  content?: Content;
}

export type WsMessage =
  | { type: 'device:status'; payload: { deviceId: string; status: 'online' | 'offline'; last_seen: string | null } }
  | { type: 'content:update'; payload: { contentId: string | null; content: Content | null } }
  | { type: 'playlist:update'; payload: { items: PlaylistItem[] } }
  | { type: 'ping' }
  | { type: 'pong' };
