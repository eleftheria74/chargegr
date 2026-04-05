'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, children }: Props) {
  const { t } = useTranslation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = currentY.current - startY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    if (diff > 100) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full
                   bg-white rounded-t-2xl shadow-2xl
                   max-h-[80vh] overflow-y-auto transition-transform duration-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button — top right, matches desktop sidebar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100
                     min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
          aria-label={t('common.close')}
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Content — StationCard header uses pr-12 to clear the top-right close button */}
        <div className="px-4 pt-2 pb-6">
          {children}
        </div>
      </div>
    </>
  );
}
