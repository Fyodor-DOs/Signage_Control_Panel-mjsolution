import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import path from 'path';
import supabase from '../config/supabase';

// GET /api/contents
export async function getContents(_req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// GET /api/contents/:id
export async function getContent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// POST /api/contents
export async function createContent(req: Request, res: Response): Promise<void> {
  try {
    const { judul, tipe, payload } = req.body as {
      judul?: string;
      tipe?: string;
      payload?: string;
    };

    if (!judul || !tipe || !payload) {
      res.status(400).json({ error: 'judul, tipe, and payload are required' });
      return;
    }

    const validTypes = ['image', 'video', 'text'];
    if (!validTypes.includes(tipe)) {
      res.status(400).json({ error: `tipe must be one of: ${validTypes.join(', ')}` });
      return;
    }

    const { data, error } = await supabase
      .from('contents')
      .insert({ judul, tipe, payload })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// PUT /api/contents/:id
export async function updateContent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body as Record<string, unknown>;

    const { data, error } = await supabase
      .from('contents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// DELETE /api/contents/:id
export async function deleteContent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('contents').delete().eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

// POST /api/contents/upload  (multer middleware applied in route)
export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const ext = path.extname(req.file.originalname) || '';
    const filename = `${randomUUID()}${ext}`;
    const bucket = 'contents';

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    res.status(201).json({ url: publicData.publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}
