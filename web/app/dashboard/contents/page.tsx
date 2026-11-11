'use client';

import { useState, useEffect, useCallback } from 'react';
import { Content } from '@/lib/types';
import { getContents, deleteContent } from '@/lib/api';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { ContentForm } from '@/components/dashboard/ContentForm';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
          <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<Content | null | 'new'>(null);

  const loadContents = useCallback(async () => {
    try {
      setError(null);
      const data = await getContents();
      setContents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load contents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  async function handleDelete(content: Content) {
    if (!confirm(`Delete content "${content.judul}"?`)) return;
    try {
      await deleteContent(content.id);
      setContents((prev) => prev.filter((c) => c.id !== content.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  function handleContentSaved(saved: Content) {
    setContents((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
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
          <h1 className="text-2xl font-bold text-gray-900">Contents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contents.length} content item{contents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setEditContent('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Content
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={loadContents} className="ml-auto text-red-600 underline text-xs">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && contents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No content yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">Upload images, videos or add text content</p>
          <button
            onClick={() => setEditContent('new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition"
          >
            Add Content
          </button>
        </div>
      )}

      {/* Content grid */}
      {!loading && contents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onEdit={(c) => setEditContent(c)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ContentForm modal */}
      {editContent !== null && (
        <ContentForm
          content={editContent === 'new' ? undefined : editContent}
          onSave={handleContentSaved}
          onClose={() => setEditContent(null)}
        />
      )}
    </div>
  );
}
