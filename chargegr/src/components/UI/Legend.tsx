'use client';

import { useState, useEffect } from 'react';
import { Layers, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const LEGEND_ITEMS = [
  { color: '#9CA3AF', key: 'legend.slow' },
  { color: '#22C55E', key: 'legend.fast' },
  { color: '#F59E0B', key: 'legend.rapid' },
  { color: '#8B5CF6', key: 'legend.ultra' },
  { color: '#EF4444', key: 'legend.offline' },
];

export default function Legend() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Default: open on desktop, closed on mobile
  useEffect(() => {
    setOpen(window.innerWidth >= 768);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed top-20 left-3 z-30 w-10 h-10 flex items-center justify-center
                   bg-white dark:bg-gray-800 rounded-full shadow-lg
                   border border-gray-200 dark:border-gray-600
                   hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
        aria-label={t('legend.title')}
      >
        <Layers size={18} className="text-gray-600 dark:text-gray-300" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 left-3 z-30 bg-white dark:bg-gray-800 rounded-xl shadow-lg
                    border border-gray-200 dark:border-gray-600 p-3 min-w-[160px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t('legend.title')}
        </span>
        <button
          onClick={() => setOpen(false)}
          className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={14} className="text-gray-400" />
        </button>
      </div>
      <div className="space-y-1.5">
        {LEGEND_ITEMS.map(item => (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-300">{t(item.key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
