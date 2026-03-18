import type { ConnectorType } from './types';

/** Human-readable connector type labels */
export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  Type2: 'Type 2',
  CCS2: 'CCS2',
  CHAdeMO: 'CHAdeMO',
  Type1: 'Type 1',
  TeslaNCAS: 'Tesla NACS',
  SchukoSocket: 'Schuko',
  Other: 'Other',
};

/**
 * Estimate charging time in minutes (10% → 80%).
 * Simplified linear model — good enough for MVP.
 */
export function estimateChargingTime(
  batteryKwh: number,
  chargerKw: number,
  vehicleMaxKw: number,
  fromPercent = 10,
  toPercent = 80,
): number {
  const energyNeeded = batteryKwh * (toPercent - fromPercent) / 100;
  const effectiveKw = Math.min(chargerKw, vehicleMaxKw);
  if (effectiveKw <= 0) return 0;
  const hours = energyNeeded / (effectiveKw * 0.9); // 90% efficiency
  return Math.round(hours * 60);
}
