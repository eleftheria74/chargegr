import type { VehicleProfile, ConnectorType } from './types';

/** Raw shape coming from vehicles.json (new 1321-model format) */
interface RawVehicle {
  id: string;
  brand: string;
  model: string;
  batteryCapacity: number;
  maxChargingPower: number;
  connectors: string[];
}

/** Map connector labels from JSON to internal ConnectorType */
const CONNECTOR_MAP: Record<string, ConnectorType> = {
  'Type 2': 'Type2',
  'CCS2': 'CCS2',
  'CHAdeMO': 'CHAdeMO',
  'Type 1': 'Type1',
};

function mapRawToProfile(raw: RawVehicle): VehicleProfile {
  const compatibleConnectors = raw.connectors
    .map(c => CONNECTOR_MAP[c])
    .filter((c): c is ConnectorType => !!c);

  return {
    id: raw.id,
    make: raw.brand,
    model: raw.model,
    batteryKwh: raw.batteryCapacity,
    maxDcKw: raw.maxChargingPower,
    maxAcKw: compatibleConnectors.includes('Type2') ? 11 : 0,
    compatibleConnectors,
    rangeKm: 0,
  };
}

let cachedVehicles: VehicleProfile[] | null = null;

export async function loadVehicleDatabase(): Promise<VehicleProfile[]> {
  if (cachedVehicles) return cachedVehicles;

  const res = await fetch('/data/vehicles.json');
  if (!res.ok) {
    console.error('Failed to load vehicles:', res.status);
    return [];
  }

  const raw: RawVehicle[] = await res.json();
  cachedVehicles = raw.map(mapRawToProfile);
  return cachedVehicles;
}

export function getCachedVehicles(): VehicleProfile[] {
  return cachedVehicles ?? [];
}
