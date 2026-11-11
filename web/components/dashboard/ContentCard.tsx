'use client';

import { Content } from '@/lib/types';

interface ContentCardProps {
  content: Content;
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
}

const typeBadge: Record<Content['tipe'], { label: string; className: string }> = {
  image: { label: 'Image', className: 'bg-purple-100 text-purple-700' },
  video: { label: 'Video', className: 'bg-pink-100 text-pink-700' },
  text: { label: 'Text', className: 'bg-amber-100 text-amber-700' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ContentCard({ content, onEdit, onDelete }: ContentCardProps) {
  const badge = typeBadge[content.tipe];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Preview */}
      <div className="relative bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
        {content.tipe === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.payload}
            alt={content.judul}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        {content.tipe === 'video' && (
          <video
            src={content.payload}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        )}
        {content.tipe === 'text' && (
          <div className="p-4 text-center">
            <p className="text-gray-600 text-sm line-clamp-4 font-medium">{content.payload}</p>
          </div>
        )}
        {/* Type badge overlay */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900 truncate">{content.judul}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(content.created_at)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(content)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(content)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
