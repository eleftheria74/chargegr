'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function LegalLinks() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!mounted) return null;

  const openLink = (path: string) => {
    setOpen(false);
    try {
      window.open(path, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = path;
    }
  };

  return (
    <div ref={ref} className="fixed bottom-3 left-3 z-30">
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                        border border-gray-200 dark:border-gray-600 py-1 min-w-[180px]">
          <button
            onClick={() => openLink('/privacy/')}
            className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('legal.privacyPolicy')}
          </button>
          <button
            onClick={() => openLink('/terms/')}
            className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('legal.termsOfService')}
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center
                   bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow
                   border border-gray-200 dark:border-gray-600
                   hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition-all"
        aria-label="Legal info"
      >
        <Info size={14} className="text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}
