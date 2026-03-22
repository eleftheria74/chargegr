'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Connector } from '@/lib/types';

interface Props {
  connectors: Connector[];
  onSubmit: (data: {
    wasWorking: boolean;
    connectorUsed?: string;
    chargingSpeedKw?: number;
    comment?: string;
  }) => Promise<void>;
}

export default function CheckinForm({ connectors, onSubmit }: Props) {
  const { t } = useTranslation();
  const [wasWorking, setWasWorking] = useState<boolean | null>(null);
  const [connector, setConnector] = useState('');
  const [speed, setSpeed] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const connectorTypes = Array.from(new Set(connectors.map(c => c.type)));

  const handleSubmit = async () => {
    if (wasWorking === null) return;
    setSubmitting(true);
    try {
      await onSubmit({
        wasWorking,
        connectorUsed: connector || undefined,
        chargingSpeedKw: speed ? Number(speed) : undefined,
        comment: comment || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
        <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">{t('checkin.success')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      {/* Was working? - big buttons */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('checkin.wasWorking')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWasWorking(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
              wasWorking === true
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'border-gray-300 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <CheckCircle size={20} />
            {t('checkin.working')}
          </button>
          <button
            type="button"
            onClick={() => setWasWorking(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
              wasWorking === false
                ? 'bg-red-100 border-red-400 text-red-700'
                : 'border-gray-300 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <XCircle size={20} />
            {t('checkin.notWorking')}
          </button>
        </div>
      </div>

      {/* Connector type */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">{t('checkin.connector')}</label>
        <select
          value={connector}
          onChange={e => setConnector(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="">—</option>
          {connectorTypes.map(ct => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
      </div>

      {/* Charging speed */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">{t('checkin.speed')}</label>
        <input
          type="number"
          value={speed}
          onChange={e => setSpeed(e.target.value)}
          min="0"
          max="500"
          placeholder="kW"
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Comment */}
      <div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value.slice(0, 200))}
          placeholder={t('checkin.comment')}
          rows={2}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/200</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={wasWorking === null || submitting}
        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-[#1B7B4E] hover:bg-[#166640] disabled:opacity-50 transition-colors"
      >
        {submitting ? t('common.loading') : t('checkin.submit')}
      </button>
    </div>
  );
}
