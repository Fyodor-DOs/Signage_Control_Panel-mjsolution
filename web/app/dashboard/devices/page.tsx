'use client';

import { useState, useEffect, useCallback } from 'react';
import { Device, Content } from '@/lib/types';
import { getDevices, getContents, deleteDevice, attachContent } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { DeviceCard } from '@/components/dashboard/DeviceCard';
import { DeviceForm } from '@/components/dashboard/DeviceForm';
import { AttachContentModal } from '@/components/dashboard/AttachContentModal';
import { PlaylistModal } from '@/components/dashboard/PlaylistModal';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
        <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
        <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const { token } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDevice, setEditDevice] = useState<Device | null | 'new'>(null);
  const [attachDevice, setAttachDevice] = useState<Device | null>(null);
  const [playlistDevice, setPlaylistDevice] = useState<Device | null>(null);

  const { isConnected, deviceStatuses } = useAdminSocket(token);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [devs, conts] = await Promise.all([getDevices(), getContents()]);
      setDevices(devs);
      setContents(conts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(device: Device) {
    if (!confirm(`Delete device "${device.nama}"?`)) return;
    try {
      await deleteDevice(device.id);
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleAttach(contentId: string | null) {
    if (!attachDevice) return;
    const updated = await attachContent(attachDevice.id, contentId);
    // Merge with joined content from contents list
    const withContent = {
      ...updated,
      content: contentId ? contents.find((c) => c.id === contentId) ?? null : null,
    };
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? withContent : d)));
  }

  function handleDeviceSaved(saved: Device) {
    setDevices((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            {devices.length} device{devices.length !== 1 ? 's' : ''}
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </p>
        </div>
        <button
          onClick={() => setEditDevice('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Device
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={loadData} className="ml-auto text-red-600 underline text-xs">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && devices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No devices yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">Add your first device to get started</p>
          <button
            onClick={() => setEditDevice('new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition"
          >
            Add Device
          </button>
        </div>
      )}

      {/* Device grid */}
      {!loading && devices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              realtimeStatus={deviceStatuses.get(device.id)}
              onEdit={(d) => setEditDevice(d)}
              onDelete={handleDelete}
              onAttach={(d) => setAttachDevice(d)}
              onPlaylist={(d) => setPlaylistDevice(d)}
            />
          ))}
        </div>
      )}

      {/* DeviceForm modal */}
      {editDevice !== null && (
        <DeviceForm
          device={editDevice === 'new' ? undefined : editDevice}
          onSave={handleDeviceSaved}
          onClose={() => setEditDevice(null)}
        />
      )}

      {/* AttachContent modal */}
      {attachDevice && (
        <AttachContentModal
          device={attachDevice}
          contents={contents}
          onAttach={handleAttach}
          onClose={() => setAttachDevice(null)}
        />
      )}

      {/* Playlist modal */}
      {playlistDevice && (
        <PlaylistModal
          device={playlistDevice}
          contents={contents}
          onClose={() => setPlaylistDevice(null)}
        />
      )}
    </div>
  );
}
