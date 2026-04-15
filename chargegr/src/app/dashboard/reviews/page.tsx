'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { adminApi, type ReviewItem, type Pagination as P } from '@/lib/api/admin';
import Pagination from '@/components/Admin/Pagination';

const LIMIT = 25;

export default function DashboardReviewsPage() {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<ReviewItem[]>([]);
  const [pagination, setPagination] = useState<P | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.reviews.list({ page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setRows(res.reviews);
        setPagination(res.pagination);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, tick]);

  const remove = async (id: string) => {
    if (!confirm(locale === 'el' ? 'Διαγραφή κριτικής;' : 'Delete review?')) return;
    setBusyId(id);
    try {
      await adminApi.reviews.delete(id);
      setTick((x) => x + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.reviews')}</h1>

      <div className="bg-white border rounded-lg">
        {error && (
          <div className="p-4 text-red-700 bg-red-50 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="divide-y">
          {loading && rows.length === 0 && (
            <div className="p-8 text-center text-gray-500">{t('admin.loading')}</div>
          )}
          {!loading && rows.length === 0 && (
            <div className="p-8 text-center text-gray-500">{t('admin.noResults')}</div>
          )}
          {rows.map((r) => (
            <div key={r.id} className="p-4 flex gap-3">
              {r.userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.userAvatar} alt="" className="w-9 h-9 rounded-full shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {r.userDisplayName || r.userEmail}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                    <Star size={12} fill="currentColor" /> {r.rating}
                  </span>
                  {r.wasWorking === false && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                      {locale === 'el' ? 'Δεν λειτουργούσε' : 'Not working'}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-700 mt-1">{r.comment}</p>}
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {t('admin.station')}: {r.stationId}
                </div>
              </div>
              <button
                onClick={() => remove(r.id)}
                disabled={busyId === r.id}
                className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-40"
                aria-label={t('admin.delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {pagination && (
          <Pagination p={pagination} loading={loading} onChange={setPage} />
        )}
      </div>
    </div>
  );
}
