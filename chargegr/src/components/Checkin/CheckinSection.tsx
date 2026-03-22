'use client';

import { useEffect, useState } from 'react';
import { Zap, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { useCheckins } from '@/hooks/useCheckins';
import { timeAgo } from '@/lib/timeAgo';
import type { Connector } from '@/lib/types';
import CheckinForm from './CheckinForm';

interface Props {
  stationId: string;
  connectors: Connector[];
}

export default function CheckinSection({ stationId, connectors }: Props) {
  const { t, locale } = useTranslation();
  const user = useAppStore(s => s.user);
  const { lastCheckin, loading, fetchCheckins, submitCheckin } = useCheckins(stationId);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const handleSubmit = async (data: { wasWorking: boolean; connectorUsed?: string; chargingSpeedKw?: number; comment?: string }) => {
    await submitCheckin(data);
    setShowForm(false);
    await fetchCheckins();
  };

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {t('checkin.title')}
      </h3>

      {loading && (
        <p className="text-sm text-gray-400 py-1">{t('common.loading')}</p>
      )}

      {/* Last check-in */}
      {lastCheckin && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1">
          <span className="text-xs text-gray-400">{timeAgo(lastCheckin.createdAt, locale)}</span>
          <span>—</span>
          {lastCheckin.wasWorking ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={14} /> {t('checkin.working')}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle size={14} /> {t('checkin.notWorking')}
            </span>
          )}
          {lastCheckin.connectorUsed && (
            <span className="text-gray-400">({lastCheckin.connectorUsed})</span>
          )}
        </div>
      )}

      {/* Check-in button or form */}
      {user ? (
        showForm ? (
          <CheckinForm connectors={connectors} onSubmit={handleSubmit} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1B7B4E] hover:bg-[#166640] transition-colors"
          >
            <Zap size={16} />
            {t('checkin.button')}
          </button>
        )
      ) : (
        <p className="text-xs text-gray-400 mt-1">{t('auth.loginToCheckin')}</p>
      )}
    </div>
  );
}
