'use client';

import { useTranslation } from '@/lib/i18n';

// Placeholder overview — the real stats page ships in the next milestone.
// Kept intentionally minimal so we can validate the layout + guard first.
export default function DashboardIndexPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.overview')}</h1>
      <p className="text-sm text-gray-500">
        Layout + auth guard ready. Overview stats will land in the next step.
      </p>
    </div>
  );
}
