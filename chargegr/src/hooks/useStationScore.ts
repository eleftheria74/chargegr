import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiGet } from '@/lib/api';

const SCORE_TTL = 5 * 60 * 1000; // 5 minutes

interface StationScore {
  reliabilityPct: number;
  totalCheckins: number;
  avgRating: number;
  totalReviews: number;
}

export function useStationScore(stationId: string) {
  const cached = useAppStore(s => s.stationScores[stationId]);
  const setStationScore = useAppStore(s => s.setStationScore);
  const [loading, setLoading] = useState(false);

  const fetchScore = useCallback(async () => {
    // Check cache TTL
    if (cached && Date.now() - cached.fetchedAt < SCORE_TTL) return;

    setLoading(true);
    try {
      const data = await apiGet<StationScore>(`/stations/${stationId}/score`);
      setStationScore(stationId, {
        reliabilityPct: data.reliabilityPct ?? 0,
        totalCheckins: data.totalCheckins ?? 0,
        avgRating: data.avgRating ?? 0,
        totalReviews: data.totalReviews ?? 0,
      });
    } catch (err) {
      console.warn('[useStationScore] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [stationId, cached, setStationScore]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score: cached ? {
      reliabilityPct: cached.reliabilityPct,
      totalCheckins: cached.totalCheckins,
      avgRating: cached.avgRating,
      totalReviews: cached.totalReviews,
    } : null,
    loading,
  };
}
