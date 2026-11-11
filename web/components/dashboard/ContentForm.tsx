'use client';

import { useState, FormEvent, useRef } from 'react';
import { Content } from '@/lib/types';
import { createContent, updateContent, uploadFile } from '@/lib/api';

interface ContentFormProps {
  content?: Content;
  onSave: (content: Content) => void;
  onClose: () => void;
}

export function ContentForm({ content, onSave, onClose }: ContentFormProps) {
  const [judul, setJudul] = useState(content?.judul ?? '');
  const [tipe, setTipe] = useState<'image' | 'video' | 'text'>(content?.tipe ?? 'image');
  const [payload, setPayload] = useState(content?.payload ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let finalPayload = payload;

      // Upload file if one was selected
      if (file && (tipe === 'image' || tipe === 'video')) {
        setUploading(true);
        const result = await uploadFile(file);
        finalPayload = result.url;
        setUploading(false);
      }

      let saved: Content;
      if (content) {
        saved = await updateContent(content.id, { judul, tipe, payload: finalPayload });
      } else {
        saved = await createContent({ judul, tipe, payload: finalPayload });
      }
      onSave(saved);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  function handleTipeChange(newTipe: 'image' | 'video' | 'text') {
    setTipe(newTipe);
    setFile(null);
    if (newTipe !== content?.tipe) {
      setPayload('');
    } else {
      setPayload(content?.payload ?? '');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {content ? 'Edit Content' : 'Add Content'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
              placeholder="Content title"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['image', 'video', 'text'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTipeChange(t)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition capitalize ${
                    tipe === t
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Payload input based on type */}
          {(tipe === 'image' || tipe === 'video') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {tipe === 'image' ? 'Image' : 'Video'} File
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={tipe === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    if (f) setPayload('');
                  }}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                />
                {!file && (
                  <>
                    <p className="text-xs text-gray-400 text-center">— or enter URL —</p>
                    <input
                      type="url"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      placeholder={`https://example.com/${tipe}.${tipe === 'image' ? 'jpg' : 'mp4'}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    />
                  </>
                )}
                {/* Preview current */}
                {!file && payload && content?.tipe === tipe && (
                  <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-24">
                    {tipe === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={payload} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={payload} className="w-full h-full object-cover" muted />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {tipe === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Content</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                required
                rows={5}
                placeholder="Enter the text to display on screen..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {uploading ? 'Uploading...' : content ? 'Save Changes' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
