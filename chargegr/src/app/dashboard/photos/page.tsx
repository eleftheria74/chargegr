'use client';

import { useEffect, useState } from 'react';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { adminApi, type PhotoItem, type Pagination as P } from '@/lib/api/admin';
import Pagination from '@/components/Admin/Pagination';

const LIMIT = 24;
const API_ORIGIN = process.env.NODE_ENV === 'development'
  ? 'https://chargegr.viralev.gr'
  : '';

function resolveUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_ORIGIN + url;
}

export default function DashboardPhotosPage() {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<PhotoItem[]>([]);
  const [pagination, setPagination] = useState<P | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [preview, setPreview] = useState<PhotoItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.photos.list({ page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setRows(res.photos);
        setPagination(res.pagination);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, tick]);

  const remove = async (id: string) => {
    if (!confirm(locale === 'el' ? 'Διαγραφή φωτογραφίας;' : 'Delete photo?')) return;
    setBusyId(id);
    try {
      await adminApi.photos.delete(id);
      setPreview(null);
      setTick((x) => x + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.photos')}</h1>

      {error && (
        <div className="p-4 text-red-700 bg-red-50 rounded flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && rows.length === 0 && (
        <div className="text-gray-500 text-sm">{t('admin.loading')}</div>
      )}
      {!loading && rows.length === 0 && (
        <div className="text-gray-500 text-sm">{t('admin.noResults')}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {rows.map((p) => (
          <div
            key={p.id}
            className="group relative aspect-square rounded overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => setPreview(p)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveUrl(p.thumbnailUrl || p.url)}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-[11px] leading-tight">
              <div className="truncate font-medium">{p.userDisplayName || p.userEmail}</div>
              <div className="opacity-75">
                {new Date(p.createdAt).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); remove(p.id); }}
              disabled={busyId === p.id}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white shadow opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
              aria-label={t('admin.delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="bg-white border rounded-lg">
          <Pagination p={pagination} loading={loading} onChange={setPage} />
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded"
            onClick={() => setPreview(null)}
          >
            <X size={20} />
          </button>
          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveUrl(preview.url)}
              alt=""
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
            <div className="bg-white rounded p-3 w-full max-w-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {preview.userDisplayName || preview.userEmail}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {t('admin.station')}: {preview.stationId} ·{' '}
                  {new Date(preview.createdAt).toLocaleString(locale === 'el' ? 'el-GR' : 'en-GB')}
                </div>
                {preview.caption && (
                  <div className="text-xs text-gray-700 mt-1">{preview.caption}</div>
                )}
              </div>
              <button
                onClick={() => remove(preview.id)}
                disabled={busyId === preview.id}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={14} /> {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
