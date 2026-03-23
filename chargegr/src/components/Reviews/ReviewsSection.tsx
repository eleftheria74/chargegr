'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import { useReviews } from '@/hooks/useReviews';
import StarRating from '@/components/UI/StarRating';
import ReviewForm from './ReviewForm';

interface Props {
  stationId: string;
}

export default function ReviewsSection({ stationId }: Props) {
  const { t } = useTranslation();
  const user = useAppStore(s => s.user);
  const { reviews, avgRating, count, loading, fetchReviews, submitReview } = useReviews(stationId);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const displayed = showAll ? (reviews ?? []) : (reviews ?? []).slice(0, 3);

  const handleSubmit = async (data: { rating: number; comment: string; wasWorking: boolean; waitTimeMinutes?: number }) => {
    await submitReview(data);
    setShowForm(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('reviews.title')}
        </h3>
        {count > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {avgRating.toFixed(1)} ({count} {t('reviews.reviewsCount')})
            </span>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-sm text-gray-400 py-2">{t('common.loading')}</p>
      )}

      {!loading && count === 0 && (
        <p className="text-sm text-gray-400 py-2">{t('reviews.noReviews')}</p>
      )}

      {/* Review list */}
      {displayed.map(review => (
        <div key={review.id} className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div className="flex items-center gap-2">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                {(review.userName ?? '?')[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{review.userName ?? '?'}</span>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-8">{review.comment}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5 ml-8">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}

      {/* Show all / less */}
      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-[#1B7B4E] font-medium mt-1"
        >
          {showAll ? t('reviews.showLess') : t('reviews.showAll')}
        </button>
      )}

      {/* Write review */}
      {user ? (
        showForm ? (
          <div className="mt-3">
            <ReviewForm onSubmit={handleSubmit} />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm text-[#1B7B4E] font-medium"
          >
            {t('reviews.write')}
          </button>
        )
      ) : (
        <p className="text-xs text-gray-400 mt-2">{t('auth.loginToReview')}</p>
      )}
    </div>
  );
}
