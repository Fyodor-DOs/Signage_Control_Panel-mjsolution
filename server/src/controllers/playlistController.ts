import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { sendPlaylistUpdate } from '../websocket/wsServer';

// GET /api/devices/:id/playlist
export async function getPlaylist(req: Request, res: Response): Promise<void> {
  try {
    const { id: deviceId } = req.params;
    const { data, error } = await supabase
      .from('playlist_items')
      .select('*, content:contents(*)')
      .eq('device_id', deviceId)
      .order('urutan', { ascending: true });

    if (error) throw error;
    res.json(data ?? []);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}

// POST /api/devices/:id/playlist  — tambah item
export async function addPlaylistItem(req: Request, res: Response): Promise<void> {
  try {
    const { id: deviceId } = req.params;
    const { content_id, durasi } = req.body as { content_id?: string; durasi?: number };

    if (!content_id) {
      res.status(400).json({ error: 'content_id wajib diisi' });
      return;
    }

    // Ambil urutan tertinggi yang ada lalu tambah 1
    const { data: existing } = await supabase
      .from('playlist_items')
      .select('urutan')
      .eq('device_id', deviceId)
      .order('urutan', { ascending: false })
      .limit(1);

    const nextUrutan = existing && existing.length > 0 ? existing[0].urutan + 1 : 0;

    const { data, error } = await supabase
      .from('playlist_items')
      .insert({ device_id: deviceId, content_id, urutan: nextUrutan, durasi: durasi ?? 10 })
      .select('*, content:contents(*)')
      .single();

    if (error) throw error;

    // Kirim playlist terbaru ke device via WebSocket
    await broadcastPlaylist(deviceId);

    res.status(201).json(data);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}

// PUT /api/devices/:id/playlist/:itemId  — ubah durasi
export async function updatePlaylistItem(req: Request, res: Response): Promise<void> {
  try {
    const { itemId } = req.params;
    const { durasi, urutan } = req.body as { durasi?: number; urutan?: number };

    const updates: Record<string, unknown> = {};
    if (durasi !== undefined) updates.durasi = durasi;
    if (urutan !== undefined) updates.urutan = urutan;

    const { data, error } = await supabase
      .from('playlist_items')
      .update(updates)
      .eq('id', itemId)
      .select('*, content:contents(*)')
      .single();

    if (error) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    await broadcastPlaylist(data.device_id as string);
    res.json(data);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}

// DELETE /api/devices/:id/playlist/:itemId
export async function removePlaylistItem(req: Request, res: Response): Promise<void> {
  try {
    const { id: deviceId, itemId } = req.params;
    const { error } = await supabase.from('playlist_items').delete().eq('id', itemId);

    if (error) throw error;

    await broadcastPlaylist(deviceId);
    res.status(204).send();
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}

// Helper: ambil playlist dari DB lalu push ke device via WS
async function broadcastPlaylist(deviceId: string): Promise<void> {
  const { data } = await supabase
    .from('playlist_items')
    .select('*, content:contents(*)')
    .eq('device_id', deviceId)
    .order('urutan', { ascending: true });

  sendPlaylistUpdate(deviceId, data ?? []);
}

// Ekspor broadcastPlaylist agar bisa dipanggil dari wsServer saat device connect
export { broadcastPlaylist };

