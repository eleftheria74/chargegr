import { create } from 'zustand';
import type { ChargingStation, FilterState, VehicleProfile } from '@/lib/types';
import type { AuthUser } from '@/lib/auth';

interface AppState {
  // Data
  stations: ChargingStation[];
  filteredStations: ChargingStation[];
  isLoading: boolean;
  error: string | null;

  // Auth
  user: AuthUser | null;
  jwt: string | null;

  // Selection
  selectedStation: ChargingStation | null;
  selectedVehicle: VehicleProfile | null;

  // Favorites
  favorites: string[];

  // Station scores cache
  stationScores: Record<string, { reliabilityPct: number; totalCheckins: number; avgRating: number; totalReviews: number; fetchedAt: number }>;

  // Filters
  filters: FilterState;

  // Map
  flyTo: { lat: number; lng: number } | null;

  // UI
  filterOpen: boolean;
  favoritesOpen: boolean;

  // Actions
  setStations: (stations: ChargingStation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: AuthUser | null, jwt: string | null) => void;
  logout: () => void;
  selectStation: (station: ChargingStation | null) => void;
  selectVehicle: (vehicle: VehicleProfile | null) => void;
  setFavorites: (favorites: string[]) => void;
  setStationScore: (stationId: string, score: { reliabilityPct: number; totalCheckins: number; avgRating: number; totalReviews: number }) => void;
  setFilters: (filters: FilterState) => void;
  setFlyTo: (flyTo: { lat: number; lng: number } | null) => void;
  setFilterOpen: (open: boolean) => void;
  setFavoritesOpen: (open: boolean) => void;
  fetchStations: () => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  connectorTypes: [],
  powerCategories: [],
  networks: [],
  onlyFree: false,
  only24h: false,
  onlyAvailable: false,
  onlyReliable: false,
  vehicleId: null,
};

function applyFilters(
  stations: ChargingStation[],
  filters: FilterState,
  vehicle: VehicleProfile | null,
  stationScores?: Record<string, { reliabilityPct: number; totalCheckins: number; avgRating: number; totalReviews: number; fetchedAt: number }>,
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

    // Reliability filter: show stations with score >80% OR those without score data
    if (filters.onlyReliable && stationScores) {
      const score = stationScores[s.id];
      if (score && score.totalCheckins >= 3 && score.reliabilityPct <= 80) {
        return false;
      }
    }

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
  user: null,
  jwt: null,
  selectedStation: null,
  selectedVehicle: null,
  favorites: [],
  stationScores: {},
  filters: DEFAULT_FILTERS,
  flyTo: null,
  filterOpen: false,
  favoritesOpen: false,

  // Actions
  setStations: (stations) => {
    const { filters, selectedVehicle, stationScores } = get();
    set({
      stations,
      filteredStations: applyFilters(stations, filters, selectedVehicle, stationScores),
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setUser: (user, jwt) => set({ user, jwt }),
  logout: () => {
    try { localStorage.removeItem('chargegr_jwt'); } catch { /* ignore */ }
    set({ user: null, jwt: null, favorites: [] });
  },

  selectStation: (selectedStation) => set({ selectedStation }),

  selectVehicle: (selectedVehicle) => {
    const { stations, filters, stationScores } = get();
    const newFilters = { ...filters, vehicleId: selectedVehicle?.id ?? null };
    set({
      selectedVehicle,
      filters: newFilters,
      filteredStations: applyFilters(stations, newFilters, selectedVehicle, stationScores),
    });
  },

  setFilters: (filters) => {
    const { stations, selectedVehicle, stationScores } = get();
    set({
      filters,
      filteredStations: applyFilters(stations, filters, selectedVehicle, stationScores),
    });
  },

  setFavorites: (favorites) => set({ favorites }),
  setStationScore: (stationId, score) => {
    const { stationScores } = get();
    set({ stationScores: { ...stationScores, [stationId]: { ...score, fetchedAt: Date.now() } } });
  },

  setFlyTo: (flyTo) => set({ flyTo }),
  setFilterOpen: (filterOpen) => set({ filterOpen }),
  setFavoritesOpen: (favoritesOpen) => set({ favoritesOpen }),

  fetchStations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/data/stations.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const stations: ChargingStation[] = await res.json();
      const { filters, selectedVehicle, stationScores } = get();
      set({
        stations,
        filteredStations: applyFilters(stations, filters, selectedVehicle, stationScores),
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
