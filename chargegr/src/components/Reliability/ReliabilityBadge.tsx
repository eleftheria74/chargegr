'use client';

import { Shield } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useStationScore } from '@/hooks/useStationScore';
import StarRating from '@/components/UI/StarRating';

interface Props {
  stationId: string;
}

export default function ReliabilityBadge({ stationId }: Props) {
  const { t } = useTranslation();
  const { score, loading } = useStationScore(stationId);

  if (loading || !score) return null;

  let colorClass: string;
  let label: string;

  if (score.totalCheckins < 3) {
    colorClass = 'bg-gray-100 text-gray-600';
    label = t('reliability.noData');
  } else if (score.reliabilityPct > 80) {
    colorClass = 'bg-green-100 text-green-700';
    label = t('reliability.reliable');
  } else if (score.reliabilityPct >= 50) {
    colorClass = 'bg-yellow-100 text-yellow-700';
    label = t('reliability.moderate');
  } else {
    colorClass = 'bg-red-100 text-red-700';
    label = t('reliability.unreliable');
  }

  return (
    <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${colorClass}`}>
      <Shield size={16} />
      <span className="text-sm font-medium">{label}</span>
      {score.totalCheckins >= 3 && (
        <span className="text-sm">({score.reliabilityPct}%)</span>
      )}
      <span className="text-xs ml-auto">
        {score.totalCheckins} {t('reliability.checkins')}
      </span>
      {score.totalReviews > 0 && (
        <StarRating rating={score.avgRating} size="sm" />
      )}
    </div>
  );
}
