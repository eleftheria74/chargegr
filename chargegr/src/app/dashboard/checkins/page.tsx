'use client';

import { useEffect, useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { adminApi, type CheckinItem, type Pagination as P } from '@/lib/api/admin';
import Pagination from '@/components/Admin/Pagination';

const LIMIT = 25;

export default function DashboardCheckinsPage() {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<CheckinItem[]>([]);
  const [pagination, setPagination] = useState<P | null>(null);
  const [page, setPage] = useState(1);
  const [wasWorking, setWasWorking] = useState<'' | 'true' | 'false'>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params: Parameters<typeof adminApi.checkins.list>[0] = { page, limit: LIMIT };
    if (wasWorking === 'true') params.was_working = true;
    if (wasWorking === 'false') params.was_working = false;
    adminApi.checkins.list(params)
      .then((res) => {
        if (cancelled) return;
        setRows(res.checkins);
        setPagination(res.pagination);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, wasWorking, tick]);

  const remove = async (id: string) => {
    if (!confirm(locale === 'el' ? 'Διαγραφή check-in;' : 'Delete check-in?')) return;
    setBusyId(id);
    try {
      await adminApi.checkins.delete(id);
      setTick((x) => x + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.checkins')}</h1>

      <div className="bg-white border rounded-lg p-3 flex items-center gap-2">
        <select
          value={wasWorking}
          onChange={(e) => { setWasWorking(e.target.value as typeof wasWorking); setPage(1); }}
          className="text-sm border border-gray-300 rounded px-2 py-2"
        >
          <option value="">{t('admin.status')}: {t('admin.all')}</option>
          <option value="true">{locale === 'el' ? 'Λειτουργούσε' : 'Working'}</option>
          <option value="false">{locale === 'el' ? 'Δεν λειτουργούσε' : 'Not working'}</option>
        </select>
      </div>

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
          {rows.map((c) => (
            <div key={c.id} className="p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                c.wasWorking ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {c.wasWorking ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {c.userDisplayName || c.userEmail}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleString(locale === 'el' ? 'el-GR' : 'en-GB')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                  {t('admin.station')}: {c.stationId}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                  {c.connectorUsed && <span>{c.connectorUsed}</span>}
                  {c.chargingSpeedKw && (
                    <span className="inline-flex items-center gap-0.5">
                      <Zap size={10} /> {c.chargingSpeedKw} kW
                    </span>
                  )}
                </div>
                {c.comment && <p className="text-sm text-gray-700 mt-1">{c.comment}</p>}
              </div>
              <button
                onClick={() => remove(c.id)}
                disabled={busyId === c.id}
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
