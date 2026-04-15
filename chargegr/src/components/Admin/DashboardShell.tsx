'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Star, Image as ImageIcon, CheckCircle2, Heart,
  ScrollText, LogOut, ArrowLeft, Menu, X,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { logout } from '@/lib/auth';

// Shell for all /dashboard/* pages: sidebar + header + content area.
// Applies the admin auth guard (via useAdminAuth) and blocks rendering of
// children until the guard resolves to isAdmin=true.
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useTranslation();
  const { user, isLoading, isAdmin } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#1B7B4E]/20 border-t-[#1B7B4E] animate-spin" />
          <p className="text-sm text-gray-500">{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // The hook has already scheduled a redirect to "/". Render a minimal
    // message so the brief flash before navigation is not jarring.
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">{t('admin.accessDenied')}</p>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: t('admin.overview'), icon: LayoutDashboard, exact: true },
    { href: '/dashboard/users', label: t('admin.users'), icon: Users },
    { href: '/dashboard/reviews', label: t('admin.reviews'), icon: Star },
    { href: '/dashboard/photos', label: t('admin.photos'), icon: ImageIcon },
    { href: '/dashboard/checkins', label: t('admin.checkins'), icon: CheckCircle2 },
    { href: '/dashboard/favorites', label: locale === 'el' ? 'Αγαπημένα' : 'Favorites', icon: Heart },
    { href: '/dashboard/audit-log', label: t('admin.auditLog'), icon: ScrollText },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === href + '/';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const onLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-900">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b px-4 h-14">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-semibold text-[#1B7B4E]">
          PlugMeNow {t('admin.dashboard')}
        </span>
        <div className="w-8" />
      </header>

      <div className="lg:flex">
        {/* Sidebar (desktop) + drawer (mobile) */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform
            flex flex-col
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:w-60 lg:shrink-0 lg:h-[100dvh]
          `}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b">
            <Link
              href="/dashboard"
              className="font-bold text-[#1B7B4E] tracking-tight"
              onClick={() => setMobileOpen(false)}
            >
              PlugMeNow
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-gray-500"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                    ${active
                      ? 'bg-[#1B7B4E]/10 text-[#1B7B4E]'
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
              <span>{t('admin.backToApp')}</span>
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogOut size={16} />
              <span>{t('admin.logout')}</span>
            </button>
          </div>
        </aside>

        {/* Backdrop when drawer open */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="hidden lg:flex items-center justify-between px-6 h-16 bg-white border-b">
            <div className="text-sm text-gray-500">
              {/* Breadcrumb-ish current area label */}
              {navItems.find(n => isActive(n.href, n.exact))?.label || t('admin.dashboard')}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setLocale('el')}
                  className={`px-2 py-1 rounded ${locale === 'el' ? 'bg-gray-100 font-semibold' : 'text-gray-500'}`}
                >EL</button>
                <button
                  onClick={() => setLocale('en')}
                  className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-gray-100 font-semibold' : 'text-gray-500'}`}
                >EN</button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {user?.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-gray-700">
                  {user?.displayName || user?.email}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
