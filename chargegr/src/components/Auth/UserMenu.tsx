'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, LogOut, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { logout as authLogout } from '@/lib/auth';

export default function UserMenu() {
  const { t } = useTranslation();
  const user = useAppStore(s => s.user);
  const logoutStore = useAppStore(s => s.logout);
  const setFavoritesOpen = useAppStore(s => s.setFavoritesOpen);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  const initials = (user.displayName ?? '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const handleLogout = () => {
    authLogout();
    logoutStore();
    setOpen(false);
  };

  const handleFavorites = () => {
    setFavoritesOpen(true);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 min-h-[44px]
                   bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg
                   border border-gray-200 dark:border-gray-600
                   hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.displayName ?? ''}
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#1B7B4E] text-white flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
        )}
        <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.displayName ?? user.email}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleFavorites}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
          >
            <Heart size={16} className="text-red-500" />
            {t('favorites.myFavorites')}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px] border-t border-gray-100 dark:border-gray-700"
          >
            <LogOut size={16} />
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
