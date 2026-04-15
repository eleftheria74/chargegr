'use client';

import { useEffect, useState } from 'react';
import { Heart, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { adminApi, type FavoriteItem, type Pagination as P } from '@/lib/api/admin';
import Pagination from '@/components/Admin/Pagination';

const LIMIT = 50;

export default function DashboardFavoritesPage() {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<FavoriteItem[]>([]);
  const [pagination, setPagination] = useState<P | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.favorites.list({ page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setRows(res.favorites);
        setPagination(res.pagination);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, tick]);

  const remove = async (f: FavoriteItem) => {
    if (!confirm(locale === 'el' ? 'Διαγραφή αγαπημένου;' : 'Delete favorite?')) return;
    const key = `${f.userId}:${f.stationId}`;
    setBusyKey(key);
    try {
      await adminApi.favorites.delete(f.userId, f.stationId);
      setTick((x) => x + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'error');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Heart size={22} className="text-red-500" />
        {locale === 'el' ? 'Αγαπημένα' : 'Favorites'}
      </h1>

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
          {rows.map((f) => {
            const key = `${f.userId}:${f.stationId}`;
            return (
              <div key={key} className="p-4 flex items-center gap-3">
                {f.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.userAvatar} alt="" className="w-9 h-9 rounded-full shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {f.userDisplayName || f.userEmail}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {t('admin.station')}: {f.stationId}
                  </div>
                </div>
                <div className="text-xs text-gray-500 shrink-0">
                  {new Date(f.createdAt).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')}
                </div>
                <button
                  onClick={() => remove(f)}
                  disabled={busyKey === key}
                  className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-40"
                  aria-label={t('admin.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
        {pagination && (
          <Pagination p={pagination} loading={loading} onChange={setPage} />
        )}
      </div>
    </div>
  );
}
