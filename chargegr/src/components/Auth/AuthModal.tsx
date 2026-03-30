'use client';

import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '@/lib/auth';

interface Props {
  onClose: () => void;
}

type Tab = 'google' | 'email';
type EmailMode = 'login' | 'register';

export default function AuthModal({ onClose }: Props) {
  const { t } = useTranslation();
  const setUser = useAppStore(s => s.setUser);
  const [tab, setTab] = useState<Tab>('google');
  const [emailMode, setEmailMode] = useState<EmailMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [showGoogleConsent, setShowGoogleConsent] = useState(false);

  const handleGoogleLogin = async () => {
    setShowGoogleConsent(true);
  };

  const handleGoogleConsentAccept = async () => {
    setShowGoogleConsent(false);
    setLoading(true);
    setError('');
    try {
      const { jwt, user } = await loginWithGoogle();
      setUser(user, jwt);
      onClose();
    } catch (err) {
      setError(t('auth.errorGeneric'));
      console.error('Google login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailSubmit = async () => {
    setError('');

    if (!validateEmail(email)) {
      setError(t('auth.errorEmail'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.errorPassword'));
      return;
    }
    if (emailMode === 'register') {
      if (!displayName.trim()) {
        setError(t('auth.errorName'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('auth.errorMatch'));
        return;
      }
      if (!consentChecked) {
        setError(t('consent.required'));
        return;
      }
    }

    setLoading(true);
    try {
      const result = emailMode === 'register'
        ? await registerWithEmail(email, password, displayName)
        : await loginWithEmail(email, password);
      setUser(result.user, result.jwt);
      onClose();
    } catch (err) {
      setError(t('auth.errorGeneric'));
      console.error('Email auth failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
             onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('auth.signIn')}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { setTab('google'); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                tab === 'google'
                  ? 'text-[#1B7B4E] border-b-2 border-[#1B7B4E]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => { setTab('email'); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                tab === 'email'
                  ? 'text-[#1B7B4E] border-b-2 border-[#1B7B4E]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            {/* Error message */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {tab === 'google' ? (
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                           border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                           disabled:opacity-50 min-h-[48px]"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {loading ? t('common.loading') : t('auth.continueGoogle')}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Email mode toggle */}
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => { setEmailMode('login'); setError(''); }}
                    className={`text-sm font-medium ${
                      emailMode === 'login' ? 'text-[#1B7B4E]' : 'text-gray-400'
                    }`}
                  >
                    {t('auth.login')}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => { setEmailMode('register'); setError(''); }}
                    className={`text-sm font-medium ${
                      emailMode === 'register' ? 'text-[#1B7B4E]' : 'text-gray-400'
                    }`}
                  >
                    {t('auth.register')}
                  </button>
                </div>

                {/* Display name (register only) */}
                {emailMode === 'register' && (
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder={t('auth.displayName')}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[44px]"
                  />
                )}

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[44px]"
                />

                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[44px]"
                />

                {/* Confirm password (register only) */}
                {emailMode === 'register' && (
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPassword')}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[44px]"
                  />
                )}

                {/* Consent checkbox (register only) */}
                {emailMode === 'register' && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={e => setConsentChecked(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#1B7B4E] shrink-0"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {t('consent.agreeTerms')}{' '}
                      <a href="/privacy/" target="_blank" className="text-[#1B7B4E] underline">{t('consent.privacyPolicy')}</a>
                      {' '}{t('consent.and')}{' '}
                      <a href="/terms/" target="_blank" className="text-[#1B7B4E] underline">{t('consent.termsOfService')}</a>
                    </span>
                  </label>
                )}

                <button
                  onClick={handleEmailSubmit}
                  disabled={loading || (emailMode === 'register' && !consentChecked)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium
                             text-white bg-[#1B7B4E] hover:bg-[#166640] disabled:opacity-50 transition-colors min-h-[48px]"
                >
                  <Mail size={16} />
                  {loading
                    ? t('common.loading')
                    : emailMode === 'register'
                      ? t('auth.register')
                      : t('auth.login')
                  }
                </button>
              </div>
            )}
          </div>

          {/* Google consent dialog */}
          {showGoogleConsent && (
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {t('consent.googleConsent')}{' '}
                <a href="/privacy/" target="_blank" className="text-[#1B7B4E] underline">{t('consent.privacyPolicy')}</a>
                {' '}{t('consent.and')}{' '}
                <a href="/terms/" target="_blank" className="text-[#1B7B4E] underline">{t('consent.termsOfService')}</a>.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGoogleConsent(false)}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px]"
                >
                  {t('consent.cancel')}
                </button>
                <button
                  onClick={handleGoogleConsentAccept}
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-[#1B7B4E] hover:bg-[#166640] disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? t('common.loading') : t('consent.accept')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
