import { useState, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string;
  wasWorking: boolean;
  waitTimeMinutes: number | null;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  avgRating: number;
  count: number;
}

interface SubmitData {
  rating: number;
  comment: string;
  wasWorking: boolean;
  waitTimeMinutes?: number;
}

export function useReviews(stationId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchReviews = useCallback(async (force = false) => {
    if (loaded && !force) return;
    setLoading(true);
    try {
      const data = await apiGet<ReviewsData>(`/stations/${stationId}/reviews`);
      setReviews(data.reviews ?? []);
      setAvgRating(data.avgRating ?? 0);
      setCount(data.count ?? 0);
      setLoaded(true);
    } catch {
      // API not available — no reviews to show
    } finally {
      setLoading(false);
    }
  }, [stationId, loaded]);

  const submitReview = useCallback(async (data: SubmitData) => {
    await apiPost(`/stations/${stationId}/reviews`, data);
    // Force refetch reviews from server
    await fetchReviews(true);
  }, [stationId, fetchReviews]);

  return { reviews, avgRating, count, loading, loaded, fetchReviews, submitReview };
}
