'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import AuthModal from './AuthModal';

export default function LoginButton() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-2 min-h-[44px]
                   bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg
                   border border-gray-200 dark:border-gray-600
                   hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shrink-0"
        aria-label={t('auth.signIn')}
      >
        <LogIn size={16} className="text-[#1B7B4E]" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">
          {t('auth.signIn')}
        </span>
      </button>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
