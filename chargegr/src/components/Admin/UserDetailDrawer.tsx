'use client';

import { useEffect, useState } from 'react';
import { X, Shield, UserIcon, Ban, LogOut, Trash2, AlertTriangle, Star, Camera, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  adminApi,
  type AdminUserDetail,
  type UserStats,
  type UserActivity,
} from '@/lib/api/admin';

interface Props {
  userId: string;
  currentAdminId: string | null;
  onClose: () => void;
  onChanged: () => void;
}

const activityIcon = { review: Star, photo: Camera, checkin: CheckCircle2 } as const;

export default function UserDetailDrawer({ userId, currentAdminId, onClose, onChanged }: Props) {
  const { t, locale } = useTranslation();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Ban modal
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Delete modal
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState('');

  const isSelf = currentAdminId === userId;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.users.get(userId);
      setUser(res.user);
      setStats(res.stats);
      setActivity(res.recentActivity);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleRole = () => {
    if (!user) return;
    if (!confirm(t('admin.confirmRoleChange'))) return;
    run(() => adminApi.users.update(userId, { role: user.role === 'admin' ? 'user' : 'admin' }));
  };

  const doBan = () => {
    run(() => adminApi.users.update(userId, { isBanned: true, bannedReason: banReason || undefined }))
      .then(() => { setBanOpen(false); setBanReason(''); });
  };

  const doUnban = () => {
    if (!confirm(t('admin.confirmUnban'))) return;
    run(() => adminApi.users.update(userId, { isBanned: false }));
  };

  const doForceLogout = () => {
    if (!confirm(t('admin.confirmForceLogout'))) return;
    run(() => adminApi.users.forceLogout(userId));
  };

  const doDelete = () => {
    run(() => adminApi.users.delete(userId)).then(() => { setDelOpen(false); onClose(); });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b">
          <h2 className="font-semibold text-gray-900">{t('admin.details')}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-[#1B7B4E]/20 border-t-[#1B7B4E] animate-spin" />
              {t('admin.loading')}
            </div>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {user && stats && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" className="w-14 h-14 rounded-full" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <UserIcon size={22} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{user.email}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {user.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#1B7B4E]/10 text-[#1B7B4E]">
                        <Shield size={10} /> {t('admin.admin')}
                      </span>
                    )}
                    {user.isBanned && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                        <Ban size={10} /> {t('admin.banned')}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {user.provider}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">{t('admin.joined')}</div>
                  <div className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('admin.lastLogin')}</div>
                  <div className="text-gray-900">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')
                      : '—'}
                  </div>
                </div>
              </div>

              {user.isBanned && user.bannedReason && (
                <div className="text-sm bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-xs text-red-700 font-semibold">{t('admin.banReason')}</div>
                  <div className="text-red-800">{user.bannedReason}</div>
                </div>
              )}

              {/* Stats */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-2">{t('admin.stats')}</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: t('admin.reviews'), value: stats.reviews },
                    { label: t('admin.photos'), value: stats.photos },
                    { label: t('admin.checkins'), value: stats.checkins },
                    { label: 'Favs', value: stats.favorites },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded p-2 text-center">
                      <div className="text-lg font-semibold text-gray-900">{s.value}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-2">{t('admin.recentActivity')}</div>
                {activity.length === 0 ? (
                  <div className="text-sm text-gray-500">{t('admin.noResults')}</div>
                ) : (
                  <div className="border rounded divide-y">
                    {activity.map((a) => {
                      const Icon = activityIcon[a.type];
                      return (
                        <div key={`${a.type}-${a.id}`} className="flex items-center gap-2 px-3 py-2 text-sm">
                          <Icon size={14} className="text-gray-500 shrink-0" />
                          <span className="truncate flex-1 text-gray-700">{a.stationId}</span>
                          <span className="text-xs text-gray-500 shrink-0">
                            {new Date(a.createdAt).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-2">{t('admin.actions')}</div>
                {isSelf ? (
                  <div className="text-sm text-gray-500 bg-gray-50 border rounded p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{locale === 'el' ? 'Δεν επιτρέπονται ενέργειες στον εαυτό σου.' : 'Actions on your own account are disabled.'}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={toggleRole}
                      disabled={busy}
                      className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {user.role === 'admin'
                        ? (locale === 'el' ? 'Αφαίρεση admin' : 'Demote to user')
                        : (locale === 'el' ? 'Προαγωγή σε admin' : 'Promote to admin')}
                    </button>
                    {user.isBanned ? (
                      <button
                        onClick={doUnban}
                        disabled={busy}
                        className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {t('admin.unban')}
                      </button>
                    ) : (
                      <button
                        onClick={() => setBanOpen(true)}
                        disabled={busy}
                        className="text-sm px-3 py-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
                      >
                        <Ban size={13} className="inline mr-1" />
                        {t('admin.ban')}
                      </button>
                    )}
                    <button
                      onClick={doForceLogout}
                      disabled={busy}
                      className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <LogOut size={13} className="inline mr-1" />
                      {t('admin.forceLogout')}
                    </button>
                    <button
                      onClick={() => setDelOpen(true)}
                      disabled={busy}
                      className="text-sm px-3 py-1.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={13} className="inline mr-1" />
                      {t('admin.delete')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Ban modal */}
      {banOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">{t('admin.confirmBan')}</h3>
            <label className="block text-sm">
              <div className="text-gray-600 mb-1">{t('admin.banReason')}</div>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setBanOpen(false); setBanReason(''); }}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={doBan}
                disabled={busy}
                className="px-3 py-1.5 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {t('admin.ban')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {delOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4">
            <h3 className="font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={18} /> {t('admin.confirmDelete')}
            </h3>
            <label className="block text-sm">
              <div className="text-gray-600 mb-1">
                {t('admin.typeToConfirm')} <code className="px-1 bg-gray-100 rounded">DELETE</code> {t('admin.toConfirm')}
              </div>
              <input
                value={delText}
                onChange={(e) => setDelText(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDelOpen(false); setDelText(''); }}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={doDelete}
                disabled={busy || delText !== 'DELETE'}
                className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
