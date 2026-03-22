'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import StarRating from '@/components/UI/StarRating';

interface Props {
  onSubmit: (data: {
    rating: number;
    comment: string;
    wasWorking: boolean;
    waitTimeMinutes?: number;
  }) => Promise<void>;
  isUpdate?: boolean;
}

const WAIT_OPTIONS = [0, 5, 10, 15, 30];

export default function ReviewForm({ onSubmit, isUpdate }: Props) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wasWorking, setWasWorking] = useState(true);
  const [waitTime, setWaitTime] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment, wasWorking, waitTimeMinutes: waitTime });
      setRating(0);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {isUpdate ? t('reviews.update') : t('reviews.write')}
      </p>

      {/* Stars */}
      <StarRating rating={rating} size="lg" interactive onChange={setRating} />

      {/* Was working? */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('reviews.wasWorking')}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWasWorking(true)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              wasWorking
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'border-gray-300 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t('reviews.yes')}
          </button>
          <button
            type="button"
            onClick={() => setWasWorking(false)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              !wasWorking
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'border-gray-300 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t('reviews.no')}
          </button>
        </div>
      </div>

      {/* Wait time */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">{t('reviews.waitTime')}</label>
        <select
          value={waitTime ?? ''}
          onChange={e => setWaitTime(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="">—</option>
          {WAIT_OPTIONS.map(m => (
            <option key={m} value={m}>{m === 30 ? '30+' : m} {t('reviews.waitMinutes')}</option>
          ))}
        </select>
      </div>

      {/* Comment */}
      <div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value.slice(0, 500))}
          placeholder={t('reviews.comment')}
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-[#1B7B4E] hover:bg-[#166640] disabled:opacity-50 transition-colors"
      >
        {submitting ? t('common.loading') : t('reviews.submit')}
      </button>
    </div>
  );
}
