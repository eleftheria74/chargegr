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
 * Estimate charging time in minutes (default 10% → 80%).
 * Takes into account vehicle max AC/DC charging speed —
 * the effective speed is the MINIMUM of charger power and vehicle max.
 * DC charging uses 75% average efficiency (tapering above ~60%),
 * AC uses 90%.
 */
export function estimateChargingTime(
  batteryKwh: number,
  chargerKw: number,
  chargerType: 'AC' | 'DC',
  vehicleMaxAcKw: number,
  vehicleMaxDcKw: number,
  fromPercent = 10,
  toPercent = 80,
): { minutes: number; effectiveKw: number } {
  const vehicleMax = chargerType === 'AC' ? vehicleMaxAcKw : vehicleMaxDcKw;
  const effectiveKw = Math.min(chargerKw, vehicleMax);
  if (effectiveKw <= 0) return { minutes: 0, effectiveKw: 0 };

  const energyNeeded = batteryKwh * (toPercent - fromPercent) / 100;
  const averageEfficiency = chargerType === 'DC' ? 0.75 : 0.90;
  const hours = energyNeeded / (effectiveKw * averageEfficiency);

  return { minutes: Math.round(hours * 60), effectiveKw };
}
