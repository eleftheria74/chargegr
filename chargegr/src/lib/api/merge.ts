import type { ChargingStation } from '../types';
import { fetchMyfahiStations } from './myfahi';
import { fetchOcmStations } from './ocm';
import { haversineDistance } from '../utils';

const DUPLICATE_RADIUS_M = 50; // meters

/**
 * Fuzzy match two operator names.
 * Returns true if they likely refer to the same network.
 */
function isSameOperator(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-zα-ω0-9]/g, '');
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  // Check if one contains the other (handles "DEI Blue" vs "ΔΕΗ blue" after mapping)
  return na.includes(nb) || nb.includes(na);
}

/**
 * Enrich a ΜΥΦΑΗ station with supplementary OCM data.
 * ΜΥΦΑΗ data takes priority; OCM fills in blanks.
 */
function enrichStation(myfahi: ChargingStation, ocm: ChargingStation): ChargingStation {
  return {
    ...myfahi,
    // Fill missing address/city from OCM
    address: myfahi.address || ocm.address,
    city: myfahi.city || ocm.city,
    // If ΜΥΦΑΗ has no connectors yet (basic data), use OCM's
    connectors: myfahi.connectors.length > 0 ? myfahi.connectors : ocm.connectors,
    maxPowerKw: myfahi.maxPowerKw || ocm.maxPowerKw,
    powerCategory: myfahi.maxPowerKw ? myfahi.powerCategory : ocm.powerCategory,
    // OCM may have free charging info
    isFreeCharging: myfahi.isFreeCharging || ocm.isFreeCharging,
  };
}

/**
 * Fetch and merge stations from ΜΥΦΑΗ + OCM.
 * Deduplication: if an OCM station is within 50m of a ΜΥΦΑΗ station
 * with the same operator, keep ΜΥΦΑΗ and enrich with OCM data.
 * Priority: ΜΥΦΑΗ > OCM.
 */
export async function fetchAllStations(): Promise<ChargingStation[]> {
  // Fetch both sources in parallel
  const [myfahiStations, ocmStations] = await Promise.all([
    fetchMyfahiStations(),
    fetchOcmStations(),
  ]);

  // Start with all ΜΥΦΑΗ stations as the base
  const merged = new Map<string, ChargingStation>();
  for (const station of myfahiStations) {
    merged.set(station.id, station);
  }

  // For each OCM station, check for ΜΥΦΑΗ duplicate
  const myfahiList = Array.from(merged.values());

  for (const ocmStation of ocmStations) {
    let isDuplicate = false;

    for (const mStation of myfahiList) {
      const dist = haversineDistance(
        ocmStation.lat, ocmStation.lng,
        mStation.lat, mStation.lng
      );

      if (dist < DUPLICATE_RADIUS_M && isSameOperator(ocmStation.operator, mStation.operator)) {
        // Duplicate found — enrich ΜΥΦΑΗ station with OCM data
        merged.set(mStation.id, enrichStation(mStation, ocmStation));
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      // New station from OCM — add it
      merged.set(ocmStation.id, ocmStation);
    }
  }

  return Array.from(merged.values());
}
