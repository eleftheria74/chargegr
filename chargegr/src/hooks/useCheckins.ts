import { useState, useCallback } from 'react';
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
  const [loaded, setLoaded] = useState(false);

  const fetchCheckins = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const data = await apiGet<{ checkins: Checkin[] }>(`/stations/${stationId}/checkins`);
      setCheckins(data.checkins);
      setLoaded(true);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, [stationId, loaded]);

  const submitCheckin = useCallback(async (data: SubmitData) => {
    const result = await apiPost<{ checkin: Checkin }>(`/stations/${stationId}/checkins`, data);
    setLoaded(false);
    return result.checkin;
  }, [stationId]);

  const lastCheckin = checkins.length > 0 ? checkins[0] : null;

  return { checkins, lastCheckin, loading, loaded, fetchCheckins, submitCheckin };
}
