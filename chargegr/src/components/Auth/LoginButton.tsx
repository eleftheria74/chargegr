'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { loginWithGoogle } from '@/lib/auth';

export default function LoginButton() {
  const { t } = useTranslation();
  const setUser = useAppStore(s => s.setUser);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { jwt, user } = await loginWithGoogle();
      setUser(user, jwt);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 min-h-[44px]
                 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg
                 border border-gray-200 dark:border-gray-600
                 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shrink-0
                 disabled:opacity-50"
      aria-label={t('auth.signIn')}
    >
      <LogIn size={16} className="text-[#1B7B4E]" />
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">
        {loading ? t('common.loading') : t('auth.signIn')}
      </span>
    </button>
  );
}
