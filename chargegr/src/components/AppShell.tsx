'use client';

import { useEffect } from 'react';
import { SlidersHorizontal, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';
import MapContainer from '@/components/Map/MapContainer';
import BottomSheet from '@/components/UI/BottomSheet';
import StationCard from '@/components/StationDetail/StationCard';
import FilterPanel from '@/components/Filters/FilterPanel';
import VehicleSelector from '@/components/Vehicle/VehicleSelector';
import SearchBar from '@/components/Search/SearchBar';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Legend from '@/components/UI/Legend';
import SplashScreen from '@/components/UI/SplashScreen';

export default function AppShell() {
  const { t, locale, setLocale } = useTranslation();

  const filteredStations = useAppStore(s => s.filteredStations);
  const selectedStation = useAppStore(s => s.selectedStation);
  const selectStation = useAppStore(s => s.selectStation);
  const filters = useAppStore(s => s.filters);
  const setFilters = useAppStore(s => s.setFilters);
  const filterOpen = useAppStore(s => s.filterOpen);
  const setFilterOpen = useAppStore(s => s.setFilterOpen);
  const selectedVehicle = useAppStore(s => s.selectedVehicle);
  const selectVehicle = useAppStore(s => s.selectVehicle);
  const flyTo = useAppStore(s => s.flyTo);
  const setFlyTo = useAppStore(s => s.setFlyTo);
  const fetchStations = useAppStore(s => s.fetchStations);
  const isLoading = useAppStore(s => s.isLoading);
  const error = useAppStore(s => s.error);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const hasActiveFilters =
    filters.connectorTypes.length > 0 ||
    filters.powerCategories.length > 0 ||
    filters.networks.length > 0 ||
    filters.onlyFree ||
    filters.only24h ||
    filters.onlyAvailable;

  const toggleLocale = () => {
    setLocale(locale === 'el' ? 'en' : 'el');
  };

  return (
    <>
      <SplashScreen />

      <MapContainer
        stations={filteredStations}
        onStationClick={selectStation}
        flyTo={flyTo}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30
                        bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2
                        flex items-center gap-2">
          <LoadingSpinner size={18} className="text-[#1B7B4E]" />
          <span className="text-sm text-gray-700 dark:text-gray-200">{t('common.loading')}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30
                        bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-700 rounded-xl shadow-lg px-4 py-2
                        flex items-center gap-2 max-w-xs">
          <AlertTriangle size={16} className="text-red-500 dark:text-red-400 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-200">{t('common.error')}</span>
          <button
            onClick={fetchStations}
            className="shrink-0 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800"
          >
            <RefreshCw size={14} className="text-red-500 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* No results message */}
      {!isLoading && !error && filteredStations.length === 0 && hasActiveFilters && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30
                        bg-yellow-50 dark:bg-yellow-900/80 border border-yellow-200 dark:border-yellow-700 rounded-xl shadow-lg px-4 py-2
                        flex items-center gap-2">
          <span className="text-sm text-yellow-700 dark:text-yellow-200">{t('common.noStations')}</span>
        </div>
      )}

      {/* Top bar: mobile = Filter + Search only | desktop = all controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 min-h-[44px]
                     bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg
                     border border-gray-200 dark:border-gray-600
                     hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shrink-0"
        >
          <SlidersHorizontal size={16} className="text-[#1B7B4E]" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">{t('filters.title')}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#1B7B4E]" />
          )}
        </button>

        <SearchBar onSelectLocation={(lat, lng) => setFlyTo({ lat, lng })} />

        {/* Desktop only: Vehicle + Language */}
        <div className="hidden sm:flex items-center gap-2">
          <VehicleSelector
            selectedVehicle={selectedVehicle}
            onSelect={selectVehicle}
          />

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px]
                       bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg
                       border border-gray-200 dark:border-gray-600
                       hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shrink-0"
            aria-label={locale === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
          >
            <Globe size={16} className="text-[#1B7B4E]" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {locale === 'el' ? 'EN' : 'EL'}
            </span>
          </button>
        </div>
      </div>

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        stationCount={filteredStations.length}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={selectVehicle}
        locale={locale}
        onToggleLocale={toggleLocale}
      />

      {/* Desktop: sidebar | Mobile: bottom sheet */}
      {selectedStation && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden md:block fixed top-0 right-0 bottom-0 w-[380px] z-40
                          bg-white shadow-2xl overflow-y-auto
                          border-l border-gray-200">
            <div className="px-5 py-4">
              <button
                onClick={() => selectStation(null)}
                className="mb-3 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                &times; {t('common.close')}
              </button>
              <StationCard
                station={selectedStation}
                vehicle={selectedVehicle}
              />
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="md:hidden">
            <BottomSheet
              isOpen={true}
              onClose={() => selectStation(null)}
            >
              <StationCard
                station={selectedStation}
                vehicle={selectedVehicle}
              />
            </BottomSheet>
          </div>
        </>
      )}

      <Legend />
    </>
  );
}
