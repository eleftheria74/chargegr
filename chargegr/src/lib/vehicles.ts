import type { VehicleProfile } from './types';

let cachedVehicles: VehicleProfile[] | null = null;

export async function loadVehicleDatabase(): Promise<VehicleProfile[]> {
  if (cachedVehicles) return cachedVehicles;

  const res = await fetch('/data/vehicles.json');
  if (!res.ok) {
    console.error('Failed to load vehicles:', res.status);
    return [];
  }

  cachedVehicles = await res.json();
  return cachedVehicles!;
}

export function getCachedVehicles(): VehicleProfile[] {
  return cachedVehicles ?? [];
}
