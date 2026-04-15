'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { adminApi, type AuditLogEntry, type Pagination as P } from '@/lib/api/admin';
import Pagination from '@/components/Admin/Pagination';

const LIMIT = 50;

function parseDetails(d: AuditLogEntry['details']): Record<string, unknown> | null {
  if (!d) return null;
  if (typeof d === 'object') return d as Record<string, unknown>;
  try { return JSON.parse(d); } catch { return null; }
}

export default function DashboardAuditLogPage() {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<P | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const params = useMemo(() => ({
    page,
    limit: LIMIT,
    action: action || undefined,
  }), [page, action]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.audit.list(params)
      .then((res) => {
        if (cancelled) return;
        setRows(res.log);
        setPagination(res.pagination);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params]);

  useEffect(() => {
    const id = setTimeout(() => { setAction(actionInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [actionInput]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.auditLog')}</h1>

      <div className="bg-white border rounded-lg p-3 flex items-center gap-2">
        <input
          value={actionInput}
          onChange={(e) => setActionInput(e.target.value)}
          placeholder={t('admin.action')}
          className="flex-1 min-w-[200px] text-sm border border-gray-300 rounded px-3 py-2"
        />
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
          {rows.map((e) => {
            const details = parseDetails(e.details);
            const isOpen = expanded === e.id;
            return (
              <div key={e.id}>
                <div
                  className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                >
                  <div className="mt-0.5 text-gray-400 shrink-0">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">
                        {e.action}
                      </code>
                      {e.targetType && (
                        <span className="text-xs text-gray-500">
                          → {e.targetType}
                          {e.targetId && <code className="ml-1 font-mono">{e.targetId}</code>}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 truncate">
                      {e.adminDisplayName || e.adminEmail || e.adminUserId}
                      {e.ipAddress && <span className="text-gray-400"> · {e.ipAddress}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 shrink-0">
                    {new Date(e.createdAt).toLocaleString(locale === 'el' ? 'el-GR' : 'en-GB')}
                  </div>
                </div>
                {isOpen && details && (
                  <div className="px-12 pb-3 pt-0">
                    <pre className="text-xs bg-gray-50 border rounded p-3 overflow-x-auto text-gray-700">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </div>
                )}
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
