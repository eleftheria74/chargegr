'use client';

import { useEffect, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
      </div>

      {loading && (
        <p className="text-sm text-gray-400 py-2">{t('common.loading')}</p>
      )}

      {!loading && count === 0 && (
        <p className="text-sm text-gray-400 py-2">{t('reviews.noReviews')}</p>
      )}

      {/* Summary: avg rating + "see reviews" button */}
      {!loading && count > 0 && (
        <button
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                     bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700
                     transition-colors min-h-[44px]"
        >
          <div className="flex items-center gap-2">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({count} {t('reviews.reviewsCount')})
            </span>
          </div>
          <span className="text-sm text-[#1B7B4E] font-medium">
            {t('reviews.showAll')} →
          </span>
        </button>
      )}

      {/* Write review (logged in only) */}
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

      {/* Reviews modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
              className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl
                         shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-[#1B7B4E]" />
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {t('reviews.title')}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarRating rating={avgRating} size="sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {avgRating.toFixed(1)} ({count})
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Reviews list */}
              <div className="overflow-y-auto flex-1 px-5 py-3">
                {reviews.map(review => (
                  <div key={review.id} className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-2">
                      {review.userAvatar ? (
                        <img src={review.userAvatar} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          {(review.userName ?? '?')[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{review.userName ?? '?'}</span>
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{review.comment}</p>
                    )}
                    {review.wasWorking !== null && (
                      <p className="text-xs mt-1.5 text-gray-400">
                        {t('reviews.wasWorking')}: {review.wasWorking ? '✅ ' + t('reviews.yes') : '❌ ' + t('reviews.no')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
