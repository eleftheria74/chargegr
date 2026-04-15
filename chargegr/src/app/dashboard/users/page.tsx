'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, Shield, Ban, Download, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  adminApi, type AdminUserSummary, type Pagination, type UserRole, type UserProvider,
} from '@/lib/api/admin';
import UserDetailDrawer from '@/components/Admin/UserDetailDrawer';

interface Filters {
  search: string;
  role: '' | UserRole;
  status: '' | 'banned' | 'active';
  provider: '' | UserProvider;
}

const LIMIT = 25;

export default function DashboardUsersPage() {
  const { t, locale } = useTranslation();
  const { user: currentAdmin } = useAdminAuth();

  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ search: '', role: '', status: '', provider: '' });
  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const params = useMemo(() => ({
    page,
    limit: LIMIT,
    search: filters.search || undefined,
    role: filters.role || undefined,
    is_banned: filters.status === 'banned' ? true : filters.status === 'active' ? false : undefined,
    provider: filters.provider || undefined,
  }), [page, filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.users.list(params)
      .then((res) => {
        if (cancelled) return;
        setRows(res.users);
        setPagination(res.pagination);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params, tick]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput.trim() }));
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const exportCsv = async () => {
    try {
      const jwt = localStorage.getItem('chargegr_jwt');
      const res = await fetch('/api/admin/users/export', {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.users')}</h1>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
        >
          <Download size={14} /> {t('admin.exportCsv')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('admin.search')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => { setFilters((f) => ({ ...f, role: e.target.value as Filters['role'] })); setPage(1); }}
          className="text-sm border border-gray-300 rounded px-2 py-2"
        >
          <option value="">{t('admin.role')}: {t('admin.all')}</option>
          <option value="admin">{t('admin.admin')}</option>
          <option value="user">{t('admin.user')}</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as Filters['status'] })); setPage(1); }}
          className="text-sm border border-gray-300 rounded px-2 py-2"
        >
          <option value="">{t('admin.status')}: {t('admin.all')}</option>
          <option value="active">{t('admin.active')}</option>
          <option value="banned">{t('admin.banned')}</option>
        </select>
        <select
          value={filters.provider}
          onChange={(e) => { setFilters((f) => ({ ...f, provider: e.target.value as Filters['provider'] })); setPage(1); }}
          className="text-sm border border-gray-300 rounded px-2 py-2"
        >
          <option value="">{t('admin.provider')}: {t('admin.all')}</option>
          <option value="google">Google</option>
          <option value="email">Email</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {error && (
          <div className="p-4 text-red-700 bg-red-50 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2 font-medium">{locale === 'el' ? 'Χρήστης' : 'User'}</th>
                <th className="text-left px-4 py-2 font-medium">{t('admin.provider')}</th>
                <th className="text-left px-4 py-2 font-medium">{t('admin.status')}</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">{t('admin.joined')}</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">{t('admin.lastLogin')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t('admin.loading')}</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t('admin.noResults')}</td></tr>
              )}
              {rows.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {u.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate flex items-center gap-1">
                          {u.displayName || u.email}
                          {u.role === 'admin' && <Shield size={12} className="text-[#1B7B4E]" />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{u.provider}</td>
                  <td className="px-4 py-2">
                    {u.isBanned ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                        <Ban size={10} /> {t('admin.banned')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                        {t('admin.active')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600 hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')}
                  </td>
                  <td className="px-4 py-2 text-gray-600 hidden md:table-cell">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t text-sm text-gray-600">
            <div>
              {t('admin.page')} {pagination.page} {t('admin.of')} {pagination.totalPages}
              <span className="text-gray-400"> · {pagination.total}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                aria-label={t('admin.previous')}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                aria-label={t('admin.next')}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <UserDetailDrawer
          userId={selectedId}
          currentAdminId={currentAdmin?.id ?? null}
          onClose={() => setSelectedId(null)}
          onChanged={() => setTick((x) => x + 1)}
        />
      )}
    </div>
  );
}
