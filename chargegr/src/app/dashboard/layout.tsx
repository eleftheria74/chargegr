'use client';

import { I18nProvider } from '@/lib/i18n';
import DashboardShell from '@/components/Admin/DashboardShell';

// The dashboard lives inside the same Next.js app as the public map.
// I18nProvider is scoped per top-level route (public map sets its own in
// src/app/page.tsx) so we need to wrap here too.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <DashboardShell>{children}</DashboardShell>
    </I18nProvider>
  );
}
