'use client';

import { useState } from 'react';
import { X, Download, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { logout as authLogout } from '@/lib/auth';
import { apiDelete } from '@/lib/api';

interface Props {
  onClose: () => void;
}

export default function AccountSettings({ onClose }: Props) {
  const { t } = useTranslation();
  const user = useAppStore(s => s.user);
  const logoutStore = useAppStore(s => s.logout);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  // createdAt may exist on the user object from /auth/me even though not in AuthUser type
  const createdAt = (user as unknown as { createdAt?: string }).createdAt;
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : '';

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      let jwt: string | null = null;
      try { jwt = localStorage.getItem('chargegr_jwt'); } catch { /* WebView guard */ }

      const res = await fetch('/api/auth/export', {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();

      if (typeof URL.createObjectURL === 'function') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plugmenow-data-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Fallback: open as data URL for WebViews without createObjectURL
        const text = await blob.text();
        const w = window.open('', '_blank');
        if (w) { w.document.write('<pre>' + text + '</pre>'); }
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    setError('');
    try {
      await apiDelete('/auth/account');
      authLogout();
      logoutStore();
      onClose();
    } catch {
      setError(t('common.error'));
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Error */}
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* User info */}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">{t('settings.email')}</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">{t('settings.displayName')}</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{user.displayName}</p>
              </div>
              {memberSince && (
                <div>
                  <label className="text-xs text-gray-500">{t('settings.memberSince')}</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{memberSince}</p>
                </div>
              )}
            </div>

            {/* Export data */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 mb-2">{t('settings.exportDesc')}</p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                           border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                           disabled:opacity-50 min-h-[44px]"
              >
                {exporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {exporting ? t('settings.exporting') : t('settings.exportData')}
              </button>
            </div>

            {/* Delete account */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 mb-2">{t('settings.deleteDesc')}</p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                             text-red-600 border border-red-300 dark:border-red-700
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                >
                  <Trash2 size={16} />
                  {t('settings.deleteAccount')}
                </button>
              ) : (
                <div className="space-y-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {t('settings.deleteConfirm')}
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    placeholder={t('settings.deleteType')}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[44px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                    >
                      {t('consent.cancel')}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteInput !== 'DELETE' || deleting}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors min-h-[44px]"
                    >
                      {deleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {deleting ? t('settings.deleting') : t('settings.deleteAccount')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
