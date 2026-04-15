'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Pagination as P } from '@/lib/api/admin';

export default function Pagination({
  p,
  loading,
  onChange,
}: {
  p: P;
  loading?: boolean;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (p.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t text-sm text-gray-600">
      <div>
        {t('admin.page')} {p.page} {t('admin.of')} {p.totalPages}
        <span className="text-gray-400"> · {p.total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={p.page <= 1 || loading}
          onClick={() => onChange(Math.max(1, p.page - 1))}
          className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
          aria-label={t('admin.previous')}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          disabled={p.page >= p.totalPages || loading}
          onClick={() => onChange(p.page + 1)}
          className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
          aria-label={t('admin.next')}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
