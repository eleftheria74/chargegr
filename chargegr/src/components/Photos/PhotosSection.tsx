'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { usePhotos } from '@/hooks/usePhotos';
import PhotoGallery from './PhotoGallery';
import PhotoUpload from './PhotoUpload';

interface Props {
  stationId: string;
}

export default function PhotosSection({ stationId }: Props) {
  const { t } = useTranslation();
  const { photos, loading, fetchPhotos, uploadPhoto, uploading } = usePhotos(stationId);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {t('photos.title')}
      </h3>
      <PhotoGallery photos={photos} loading={loading} />
      <PhotoUpload onUpload={uploadPhoto} uploading={uploading} />
    </div>
  );
}
