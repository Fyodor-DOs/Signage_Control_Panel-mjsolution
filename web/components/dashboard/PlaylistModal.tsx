'use client';

import { useState, useEffect } from 'react';
import { Device, Content, PlaylistItem } from '@/lib/types';
import { getPlaylist, addPlaylistItem, updatePlaylistItem, removePlaylistItem } from '@/lib/api';

interface PlaylistModalProps {
  device: Device;
  contents: Content[];
  onClose: () => void;
}

const typeBadge: Record<Content['tipe'], string> = {
  image: 'bg-purple-100 text-purple-700',
  video: 'bg-pink-100 text-pink-700',
  text: 'bg-amber-100 text-amber-700',
};

export function PlaylistModal({ device, contents, onClose }: PlaylistModalProps) {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContentId, setSelectedContentId] = useState('');
  const [durasi, setDurasi] = useState(10);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getPlaylist(device.id)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [device.id]);

  async function handleAdd() {
    if (!selectedContentId) return;
    setAdding(true);
    try {
      const item = await addPlaylistItem(device.id, { content_id: selectedContentId, durasi });
      setItems((prev) => [...prev, item]);
      setSelectedContentId('');
      setDurasi(10);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(itemId: string) {
    await removePlaylistItem(device.id, itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function handleDurasiChange(itemId: string, newDurasi: number) {
    if (newDurasi < 1) return;
    const updated = await updatePlaylistItem(device.id, itemId, { durasi: newDurasi });
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, durasi: updated.durasi } : i)));
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;

    // Swap urutan di array
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    // Update urutan di DB untuk kedua item
    await Promise.all([
      updatePlaylistItem(device.id, newItems[index].id, { urutan: index }),
      updatePlaylistItem(device.id, newItems[swapIndex].id, { urutan: swapIndex }),
    ]);

    setItems(newItems.map((item, i) => ({ ...item, urutan: i })));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Playlist</h2>
            <p className="text-sm text-gray-500 mt-0.5">{device.nama}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Playlist items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-sm">Playlist masih kosong. Tambahkan konten di bawah.</p>
            </div>
          )}

          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {/* Urutan */}
              <span className="w-6 h-6 flex-shrink-0 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>

              {/* Info konten */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.content?.judul ?? 'Konten tidak ditemukan'}
                </p>
                {item.content && (
                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${typeBadge[item.content.tipe]}`}>
                    {item.content.tipe}
                  </span>
                )}
              </div>

              {/* Durasi editor */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDurasiChange(item.id, item.durasi - 5)}
                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold flex items-center justify-center transition"
                >-</button>
                <span className="text-xs text-gray-700 w-10 text-center font-medium">{item.durasi}d</span>
                <button
                  onClick={() => handleDurasiChange(item.id, item.durasi + 5)}
                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold flex items-center justify-center transition"
                >+</button>
              </div>

              {/* Pindah urutan */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="w-5 h-5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 flex items-center justify-center transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  className="w-5 h-5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 flex items-center justify-center transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Hapus */}
              <button
                onClick={() => handleRemove(item.id)}
                className="flex-shrink-0 w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Tambah item baru */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tambah ke Playlist</p>
          <div className="flex gap-2">
            <select
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih konten...</option>
              {contents.map((c) => (
                <option key={c.id} value={c.id}>{c.judul} ({c.tipe})</option>
              ))}
            </select>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                min={1}
                value={durasi}
                onChange={(e) => setDurasi(Number(e.target.value))}
                className="w-16 px-2 py-2 border border-gray-300 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500">det</span>
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedContentId || adding}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-xl transition flex items-center gap-1.5"
            >
              {adding
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              }
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

