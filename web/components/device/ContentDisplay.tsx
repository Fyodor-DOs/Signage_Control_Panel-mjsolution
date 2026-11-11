'use client';

import { Content } from '@/lib/types';

interface ContentDisplayProps {
  content: Content | null;
}

export function ContentDisplay({ content }: ContentDisplayProps) {
  if (!content) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-xl font-medium text-gray-400">No content assigned</p>
        <p className="text-sm text-gray-600 mt-1">Waiting for content from admin panel...</p>
      </div>
    );
  }

  if (content.tipe === 'image') {
    return (
      <div className="w-full h-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.payload}
          alt={content.judul}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (content.tipe === 'video') {
    return (
      <div className="w-full h-full bg-black">
        <video
          src={content.payload}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    );
  }

  if (content.tipe === 'text') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 p-8">
        <p className="text-white text-5xl font-bold text-center leading-tight max-w-4xl">
          {content.payload}
        </p>
      </div>
    );
  }

  return null;
}
