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

// API response shape (differs from frontend Review interface)
interface ApiReview {
  id: string;
  rating: number;
  comment: string;
  wasWorking: boolean;
  waitTimeMinutes: number | null;
  createdAt: string;
  user: { displayName: string; avatar: string | null };
}

interface ReviewsData {
  reviews: ApiReview[];
  avgRating: number;
  totalReviews: number;
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
      // Map API response (user object) to flat Review fields
      setReviews((data.reviews ?? []).map(r => ({
        id: r.id,
        userId: '',
        userName: r.user?.displayName ?? '?',
        userAvatar: r.user?.avatar ?? null,
        rating: r.rating,
        comment: r.comment,
        wasWorking: r.wasWorking,
        waitTimeMinutes: r.waitTimeMinutes,
        createdAt: r.createdAt,
      })));
      setAvgRating(data.avgRating ?? 0);
      setCount(data.totalReviews ?? 0);
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
