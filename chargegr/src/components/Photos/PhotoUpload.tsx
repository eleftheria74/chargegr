'use client';

import { useState, useRef } from 'react';
import { Camera, Images, X, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';

interface Props {
  onUpload: (file: File, caption?: string) => Promise<void>;
  uploading: boolean;
}

export default function PhotoUpload({ onUpload, uploading }: Props) {
  const { t } = useTranslation();
  const user = useAppStore(s => s.user);
  const fileGalleryRef = useRef<HTMLInputElement>(null);
  const fileCameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError(t('photos.tooLarge'));
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setError(null);

    try {
      await onUpload(selectedFile, caption || undefined);
      setSuccess(true);
      setPreview(null);
      setSelectedFile(null);
      setCaption('');
      if (fileGalleryRef.current) fileGalleryRef.current.value = '';
      if (fileCameraRef.current) fileCameraRef.current.value = '';
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    setCaption('');
    setError(null);
    if (fileGalleryRef.current) fileGalleryRef.current.value = '';
    if (fileCameraRef.current) fileCameraRef.current.value = '';
  };

  return (
    <div className="mt-2">
      <input
        ref={fileCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileGalleryRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <div>
          <div className="flex gap-2">
            <button
              onClick={() => fileCameraRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50"
            >
              <Camera size={16} />
              {t('photos.camera')}
            </button>
            <button
              onClick={() => fileGalleryRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50"
            >
              <Images size={16} />
              {t('photos.files')}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
            {t('photoConsent.notice')}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          {/* Preview */}
          <div className="relative w-full max-w-[200px]">
            <img src={preview} alt="Preview" className="w-full rounded-lg" />
            <button
              onClick={cancelPreview}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>

          {/* Caption */}
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value.slice(0, 200))}
            placeholder={t('photos.caption')}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            maxLength={200}
          />

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Camera size={16} />
                {t('photos.upload')}
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {success && <p className="text-xs text-green-600 mt-1">{t('photos.success')}</p>}
    </div>
  );
}
