import { Device, Content, PlaylistItem } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('signage_token');
}

function clearTokenAndRedirect() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('signage_token');
    window.location.href = '/login';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    clearTokenAndRedirect();
    throw new Error('Unauthorized');
  }

  return response;
}

// ----------------------------------------------------------------
// Devices
// ----------------------------------------------------------------
export async function getDevices(): Promise<Device[]> {
  const res = await fetchWithAuth('/api/devices');
  if (!res.ok) throw new Error('Failed to fetch devices');
  return res.json();
}

export async function getDevice(id: string): Promise<Device> {
  const res = await fetchWithAuth(`/api/devices/${id}`);
  if (!res.ok) throw new Error('Failed to fetch device');
  return res.json();
}

export async function createDevice(data: { nama: string; lokasi: string }): Promise<Device> {
  const res = await fetchWithAuth('/api/devices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create device');
  return res.json();
}

export async function updateDevice(id: string, data: { nama?: string; lokasi?: string }): Promise<Device> {
  const res = await fetchWithAuth(`/api/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update device');
  return res.json();
}

export async function deleteDevice(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/devices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete device');
}

export async function attachContent(deviceId: string, contentId: string | null): Promise<Device> {
  const res = await fetchWithAuth(`/api/devices/${deviceId}/content`, {
    method: 'PUT',
    body: JSON.stringify({ contentId }),
  });
  if (!res.ok) throw new Error('Failed to attach content');
  return res.json();
}

// ----------------------------------------------------------------
// Playlist
// ----------------------------------------------------------------
export async function getPlaylist(deviceId: string): Promise<PlaylistItem[]> {
  const res = await fetchWithAuth(`/api/devices/${deviceId}/playlist`);
  if (!res.ok) throw new Error('Failed to fetch playlist');
  return res.json();
}

export async function addPlaylistItem(
  deviceId: string,
  data: { content_id: string; durasi: number }
): Promise<PlaylistItem> {
  const res = await fetchWithAuth(`/api/devices/${deviceId}/playlist`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add playlist item');
  return res.json();
}

export async function updatePlaylistItem(
  deviceId: string,
  itemId: string,
  data: { durasi?: number; urutan?: number }
): Promise<PlaylistItem> {
  const res = await fetchWithAuth(`/api/devices/${deviceId}/playlist/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update playlist item');
  return res.json();
}

export async function removePlaylistItem(deviceId: string, itemId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/devices/${deviceId}/playlist/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove playlist item');
}

// ----------------------------------------------------------------
// Contents
// ----------------------------------------------------------------
export async function getContents(): Promise<Content[]> {
  const res = await fetchWithAuth('/api/contents');
  if (!res.ok) throw new Error('Failed to fetch contents');
  return res.json();
}

export async function createContent(data: { judul: string; tipe: 'image' | 'video' | 'text'; payload: string }): Promise<Content> {
  const res = await fetchWithAuth('/api/contents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create content');
  return res.json();
}

export async function updateContent(id: string, data: { judul?: string; tipe?: 'image' | 'video' | 'text'; payload?: string }): Promise<Content> {
  const res = await fetchWithAuth(`/api/contents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update content');
  return res.json();
}

export async function deleteContent(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/contents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete content');
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/contents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    clearTokenAndRedirect();
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
}

// ----------------------------------------------------------------
// Auth
// ----------------------------------------------------------------
export async function login(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(err.message || 'Login failed');
  }
  return res.json();
}
