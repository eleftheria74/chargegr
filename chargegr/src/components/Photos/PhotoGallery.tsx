'use client';

import { useState, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Photo } from '@/hooks/usePhotos';

interface Props {
  photos: Photo[];
  loading: boolean;
}

export default function PhotoGallery({ photos, loading }: Props) {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Close lightbox on Escape
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) setLightboxIndex(lightboxIndex + 1);
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, photos.length]);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-20 h-20 rounded-lg bg-gray-200 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
        <Camera size={16} />
        <span>{t('photos.empty')}</span>
      </div>
    );
  }

  return (
    <>
      {/* Counter */}
      <p className="text-xs text-gray-500 mb-1.5">
        {photos.length} {t('photos.count')}
      </p>

      {/* Horizontal scroll gallery */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(idx)}
            className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-400 transition-all"
          >
            <img
              src={`/api${photo.thumbnailUrl}`}
              alt={photo.caption || ''}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2"
          >
            <X size={28} />
          </button>

          {/* Nav arrows */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh]">
            <img
              src={`/api${photos[lightboxIndex].url}`}
              alt={photos[lightboxIndex].caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {(photos[lightboxIndex].caption || photos[lightboxIndex].userName) && (
              <div className="text-center mt-2 text-white/80 text-sm">
                {photos[lightboxIndex].caption && (
                  <p>{photos[lightboxIndex].caption}</p>
                )}
                <p className="text-white/50 text-xs mt-1">
                  {photos[lightboxIndex].userName}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
