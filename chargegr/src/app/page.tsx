'use client';

import dynamic from 'next/dynamic';
import { I18nProvider } from '@/lib/i18n';

const AppShell = dynamic(() => import('@/components/AppShell'), {
  ssr: false,
});

export default function Home() {
  return (
    <I18nProvider>
      <main className="h-[100dvh] w-screen overflow-hidden relative">
        <AppShell />
      </main>
    </I18nProvider>
  );
}
