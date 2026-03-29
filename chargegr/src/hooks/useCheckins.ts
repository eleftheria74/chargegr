import { useState, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api';

export interface Checkin {
  id: string;
  userId: string;
  userName: string;
  wasWorking: boolean;
  connectorUsed: string | null;
  chargingSpeedKw: number | null;
  comment: string;
  createdAt: string;
}

interface SubmitData {
  wasWorking: boolean;
  connectorUsed?: string;
  chargingSpeedKw?: number;
  comment?: string;
}

export function useCheckins(stationId: string) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);
  // Track which stationId has been loaded (ref avoids useCallback dep issues)
  const loadedForRef = useRef<string | null>(null);

  const fetchCheckins = useCallback(async (force = false) => {
    if (loadedForRef.current === stationId && !force) return;

    // Clear stale data only when station changed (not on force refetch after submit)
    if (loadedForRef.current !== stationId) {
      setCheckins([]);
    }

    setLoading(true);
    try {
      const data = await apiGet<{ checkins: Checkin[] }>(`/stations/${stationId}/checkins`);
      setCheckins(data.checkins ?? []);
      loadedForRef.current = stationId;
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  const submitCheckin = useCallback(async (data: SubmitData) => {
    await apiPost(`/stations/${stationId}/checkins`, data);
    // Force refetch checkins from server
    await fetchCheckins(true);
  }, [stationId, fetchCheckins]);

  const lastCheckin = checkins.length > 0 ? checkins[0] : null;

  return { checkins, lastCheckin, loading, loaded: loadedForRef.current === stationId, fetchCheckins, submitCheckin };
}
