'use client';

import { X, Heart, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { useFavorites } from '@/hooks/useFavorites';

interface Props {
  onClose: () => void;
}

export default function FavoritesList({ onClose }: Props) {
  const { t } = useTranslation();
  const stations = useAppStore(s => s.stations);
  const selectStation = useAppStore(s => s.selectStation);
  const setFlyTo = useAppStore(s => s.setFlyTo);
  const { favorites } = useFavorites();

  const favoriteStations = stations.filter(s => favorites.includes(s.id));

  const handleSelect = (station: typeof stations[0]) => {
    selectStation(station);
    setFlyTo({ lat: station.lat, lng: station.lng });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-[340px] max-w-[90vw]
                      bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-red-500" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{t('favorites.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('common.close')}>
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="px-4 py-3">
          {favoriteStations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">{t('favorites.empty')}</p>
          ) : (
            <div className="space-y-2">
              {favoriteStations.map(station => (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{station.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{station.address || station.city}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
