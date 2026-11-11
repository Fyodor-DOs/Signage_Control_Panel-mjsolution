'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Device } from '@/lib/types';
import { getDevices } from '@/lib/api';
import { useDeviceSocket } from '@/hooks/useDeviceSocket';
import { ContentDisplay } from '@/components/device/ContentDisplay';

function DeviceSelector() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getDevices()
      .then(setDevices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Select Device</h1>
          <p className="text-gray-400 text-sm mt-1">Choose a device to display</p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && devices.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No devices registered. Add devices from the admin panel.</p>
          </div>
        )}

        <div className="space-y-3">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => router.push(`/device?id=${device.id}`)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-left rounded-2xl p-4 border border-gray-700 hover:border-blue-500 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white group-hover:text-blue-400 transition">{device.nama}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{device.lokasi}</p>
                </div>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeviceDisplay({ deviceId }: { deviceId: string }) {
  const { isConnected, currentContent } = useDeviceSocket(deviceId);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Content display */}
      <ContentDisplay content={currentContent} />

      {/* Connection indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
            isConnected
              ? 'bg-green-900/60 border-green-700 text-green-300'
              : 'bg-red-900/60 border-red-700 text-red-300'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          {isConnected ? 'Connected' : 'Reconnecting...'}
        </div>
      </div>
    </div>
  );
}

function DevicePageContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get('id');

  if (!deviceId) {
    return <DeviceSelector />;
  }

  return <DeviceDisplay deviceId={deviceId} />;
}

export default function DevicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DevicePageContent />
    </Suspense>
  );
}
