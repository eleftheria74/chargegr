'use client';

import { useState } from 'react';
import { Navigation, Share2, Link2, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const APP_URL = 'https://chargegr.viralev.gr';

interface Props {
  lat: number;
  lng: number;
  stationName: string;
}

export default function NavigateButton({ lat, lng, stationName }: Props) {
  const { t } = useTranslation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('station.linkCopied'));
    } catch {
      // Clipboard API not available
    }
  };

  const handleShareStation = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: stationName,
          text: `${t('station.shareText')} ${stationName}`,
          url: googleMapsUrl,
        });
        return;
      } catch {
        // User cancelled or failed — fall through to clipboard
      }
    }
    await copyToClipboard(googleMapsUrl);
  };

  const handleShareApp = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'PlugMeNow',
          text: t('station.shareAppText'),
          url: APP_URL,
        });
        return;
      } catch {
        // User cancelled or failed — fall through to clipboard
      }
    }
    await copyToClipboard(APP_URL);
  };

  return (
    <div className="relative">
      {/* Buttons row — flex-wrap prevented, shrink navigate text if needed */}
      <div className="flex gap-2 mt-4">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 flex items-center justify-center gap-2 py-3 px-3 min-h-[44px]
                     bg-[#1B7B4E] text-white rounded-xl font-semibold text-sm
                     hover:bg-[#166640] active:scale-[0.98] transition-all"
        >
          <Navigation size={16} className="shrink-0" />
          <span className="truncate">{t('station.navigate')}</span>
        </a>
        <button
          onClick={handleShareStation}
          className="flex items-center justify-center p-3 min-h-[44px] min-w-[44px]
                     bg-gray-100 rounded-xl hover:bg-gray-200
                     active:scale-[0.98] transition-all shrink-0"
          aria-label={t('station.share')}
          title={t('station.share')}
        >
          <Share2 size={18} className="text-gray-700" />
        </button>
        <button
          onClick={handleShareApp}
          className="flex items-center justify-center p-3 min-h-[44px] min-w-[44px]
                     bg-gray-100 rounded-xl hover:bg-gray-200
                     active:scale-[0.98] transition-all shrink-0"
          aria-label={t('station.shareApp')}
          title={t('station.shareApp')}
        >
          <Link2 size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2
                        flex items-center gap-1.5 px-3 py-2
                        bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-lg
                        animate-fade-in whitespace-nowrap z-10">
          <Check size={14} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
