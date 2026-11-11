import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { sendContentUpdate } from '../websocket/wsServer';
import { Content } from '../types';

// GET /api/devices
export async function getDevices(_req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*, content:contents(*)');

    if (error) throw error;
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// GET /api/devices/:id
export async function getDevice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('devices')
      .select('*, content:contents(*)')
      .eq('id', id)
      .single();

    if (error) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// POST /api/devices
export async function createDevice(req: Request, res: Response): Promise<void> {
  try {
    const { nama, lokasi } = req.body as { nama?: string; lokasi?: string };

    if (!nama || !lokasi) {
      res.status(400).json({ error: 'nama and lokasi are required' });
      return;
    }

    const { data, error } = await supabase
      .from('devices')
      .insert({ nama, lokasi })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// PUT /api/devices/:id
export async function updateDevice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body as Record<string, unknown>;

    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// DELETE /api/devices/:id
export async function deleteDevice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('devices').delete().eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// PUT /api/devices/:id/content
export async function attachContent(req: Request, res: Response): Promise<void> {
  try {
    const { id: deviceId } = req.params;
    const { contentId } = req.body as { contentId: string | null };

    // Update device's content_id in DB
    const { data: device, error: updateError } = await supabase
      .from('devices')
      .update({ content_id: contentId })
      .eq('id', deviceId)
      .select()
      .single();

    if (updateError) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    // Fetch the content if contentId provided
    let content: Content | null = null;
    if (contentId) {
      const { data: contentData, error: contentError } = await supabase
        .from('contents')
        .select('*')
        .eq('id', contentId)
        .single();

      if (!contentError && contentData) {
        content = contentData as Content;
      }
    }

    // Push update to connected device over WebSocket
    sendContentUpdate(deviceId, content);

    // Return the updated device (with joined content shape)
    res.json({ ...device, content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}
