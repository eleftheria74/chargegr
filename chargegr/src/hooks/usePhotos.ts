import { useState, useCallback, useRef } from 'react';
import { apiGet } from '@/lib/api';

const BASE_URL = '/api';

function getJwt(): string | null {
  try { return localStorage.getItem('chargegr_jwt'); } catch { return null; }
}

export interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string | null;
  userName: string;
  createdAt: string;
}

interface PhotosResponse {
  photos: Photo[];
}

export function usePhotos(stationId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Track which stationId has been loaded (ref avoids useCallback dep issues)
  const loadedForRef = useRef<string | null>(null);

  const fetchPhotos = useCallback(async (force = false) => {
    if (loadedForRef.current === stationId && !force) return;

    // Clear stale data only when station changed (not on force refetch after upload)
    if (loadedForRef.current !== stationId) {
      setPhotos([]);
    }

    setLoading(true);
    try {
      const data = await apiGet<PhotosResponse>(`/stations/${stationId}/photos`);
      setPhotos(data.photos ?? []);
      loadedForRef.current = stationId;
    } catch (err) {
      console.warn('[usePhotos] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  const uploadPhoto = useCallback(async (file: File, caption?: string) => {
    const jwt = getJwt();
    if (!jwt) throw new Error('unauthorized');

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (caption) formData.append('caption', caption);

      const res = await fetch(`${BASE_URL}/stations/${stationId}/photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwt}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      // Refresh photos list
      await fetchPhotos(true);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [stationId, fetchPhotos]);

  const deletePhoto = useCallback(async (photoId: number) => {
    const jwt = getJwt();
    if (!jwt) throw new Error('unauthorized');

    const res = await fetch(`${BASE_URL}/photos/${photoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${jwt}` },
    });

    if (!res.ok) throw new Error('Delete failed');
    await fetchPhotos(true);
  }, [fetchPhotos]);

  return { photos, loading, loaded: loadedForRef.current === stationId, uploading, uploadProgress, fetchPhotos, uploadPhoto, deletePhoto };
}
