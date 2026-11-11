'use client';

import Link from 'next/link';
import { Device, Content } from '@/lib/types';

interface DeviceCardProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
  onAttach: (device: Device) => void;
  onPlaylist: (device: Device) => void;
  realtimeStatus?: { status: 'online' | 'offline'; last_seen: string | null };
}

function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Never';
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function DeviceCard({ device, onEdit, onDelete, onAttach, onPlaylist, realtimeStatus }: DeviceCardProps) {
  const status = realtimeStatus?.status ?? device.status;
  const lastSeen = realtimeStatus?.last_seen ?? device.last_seen;
  const isOnline = status === 'online';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{device.nama}</h3>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{device.lokasi}</span>
          </p>
        </div>
        {/* Status Badge */}
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2
            transition-all duration-500
            ${isOnline
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
            }
          `}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
          />
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Last seen */}
      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Last seen: {formatLastSeen(lastSeen)}
      </div>

      {/* Content info */}
      {device.content && (
        <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="truncate font-medium">{device.content.judul}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 flex-wrap">
        <button
          onClick={() => onAttach(device)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Attach
        </button>
        <button
          onClick={() => onPlaylist(device)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Playlist
        </button>
        <Link
          href={`/device?id=${device.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Layar
        </Link>
        <button
          onClick={() => onEdit(device)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete(device)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}
