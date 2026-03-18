import { create } from 'zustand';
import type { ChargingStation, FilterState, VehicleProfile } from '@/lib/types';

interface AppState {
  // Data
  stations: ChargingStation[];
  filteredStations: ChargingStation[];
  isLoading: boolean;
  error: string | null;

  // Selection
  selectedStation: ChargingStation | null;
  selectedVehicle: VehicleProfile | null;

  // Filters
  filters: FilterState;

  // Map
  flyTo: { lat: number; lng: number } | null;

  // UI
  filterOpen: boolean;

  // Actions
  setStations: (stations: ChargingStation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectStation: (station: ChargingStation | null) => void;
  selectVehicle: (vehicle: VehicleProfile | null) => void;
  setFilters: (filters: FilterState) => void;
  setFlyTo: (flyTo: { lat: number; lng: number } | null) => void;
  setFilterOpen: (open: boolean) => void;
  fetchStations: () => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  connectorTypes: [],
  powerCategories: [],
  networks: [],
  onlyFree: false,
  only24h: false,
  onlyAvailable: false,
  vehicleId: null,
};

function applyFilters(
  stations: ChargingStation[],
  filters: FilterState,
  vehicle: VehicleProfile | null,
): ChargingStation[] {
  return stations.filter(s => {
    if (filters.connectorTypes.length > 0) {
      const hasMatch = s.connectors.some(c => filters.connectorTypes.includes(c.type));
      if (!hasMatch) return false;
    }

    if (filters.powerCategories.length > 0) {
      if (!filters.powerCategories.includes(s.powerCategory)) return false;
    }

    if (filters.networks.length > 0) {
      if (!filters.networks.includes(s.operator as typeof filters.networks[number])) return false;
    }

    if (filters.onlyAvailable && !s.isOperational) return false;
    if (filters.onlyFree && !s.isFreeCharging) return false;
    if (filters.only24h && !s.is24h) return false;

    if (vehicle && filters.vehicleId) {
      const compatible = s.connectors.some(c =>
        vehicle.compatibleConnectors.includes(c.type)
      );
      if (!compatible) return false;
    }

    return true;
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  stations: [],
  filteredStations: [],
  isLoading: false,
  error: null,
  selectedStation: null,
  selectedVehicle: null,
  filters: DEFAULT_FILTERS,
  flyTo: null,
  filterOpen: false,

  // Actions
  setStations: (stations) => {
    const { filters, selectedVehicle } = get();
    set({
      stations,
      filteredStations: applyFilters(stations, filters, selectedVehicle),
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  selectStation: (selectedStation) => set({ selectedStation }),

  selectVehicle: (selectedVehicle) => {
    const { stations, filters } = get();
    const newFilters = { ...filters, vehicleId: selectedVehicle?.id ?? null };
    set({
      selectedVehicle,
      filters: newFilters,
      filteredStations: applyFilters(stations, newFilters, selectedVehicle),
    });
  },

  setFilters: (filters) => {
    const { stations, selectedVehicle } = get();
    set({
      filters,
      filteredStations: applyFilters(stations, filters, selectedVehicle),
    });
  },

  setFlyTo: (flyTo) => set({ flyTo }),
  setFilterOpen: (filterOpen) => set({ filterOpen }),

  fetchStations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/data/stations.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const stations: ChargingStation[] = await res.json();
      const { filters, selectedVehicle } = get();
      set({
        stations,
        filteredStations: applyFilters(stations, filters, selectedVehicle),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      });
    }
  },
}));
