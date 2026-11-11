'use client';

import { useState } from 'react';
import { Device, Content } from '@/lib/types';

interface AttachContentModalProps {
  device: Device;
  contents: Content[];
  onAttach: (contentId: string | null) => Promise<void>;
  onClose: () => void;
}

const typeBadge: Record<Content['tipe'], string> = {
  image: 'bg-purple-100 text-purple-700',
  video: 'bg-pink-100 text-pink-700',
  text: 'bg-amber-100 text-amber-700',
};

export function AttachContentModal({ device, contents, onAttach, onClose }: AttachContentModalProps) {
  const [selected, setSelected] = useState<string | null>(device.content_id);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onAttach(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attach Content</h2>
            <p className="text-sm text-gray-500 mt-0.5">Device: {device.nama}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Remove option */}
          <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition ${selected === null ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="content"
              checked={selected === null}
              onChange={() => setSelected(null)}
              className="accent-blue-600"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 italic">No content (remove)</p>
            </div>
          </label>

          {contents.map((content) => (
            <label
              key={content.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition ${selected === content.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                name="content"
                checked={selected === content.id}
                onChange={() => setSelected(content.id)}
                className="accent-blue-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{content.judul}</p>
              </div>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge[content.tipe]}`}>
                {content.tipe}
              </span>
            </label>
          ))}

          {contents.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">No contents available. Create one first.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
