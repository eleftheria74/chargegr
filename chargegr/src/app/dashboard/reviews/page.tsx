'use client';

import { useTranslation } from '@/lib/i18n';

export default function DashboardReviewsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.reviews')}</h1>
      <p className="text-sm text-gray-500">Coming soon.</p>
    </div>
  );
}
