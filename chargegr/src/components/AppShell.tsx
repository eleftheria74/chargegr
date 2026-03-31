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
import LegalLinks from '@/components/UI/LegalLinks';
import SplashScreen from '@/components/UI/SplashScreen';
import LoginButton from '@/components/Auth/LoginButton';
import UserMenu from '@/components/Auth/UserMenu';
import FavoritesList from '@/components/Favorites/FavoritesList';
import { validateSession } from '@/lib/auth';

export default function AppShell() {
  const { t, locale, setLocale } = useTranslation();

  const user = useAppStore(s => s.user);
  const setUser = useAppStore(s => s.setUser);
  const favoritesOpen = useAppStore(s => s.favoritesOpen);
  const setFavoritesOpen = useAppStore(s => s.setFavoritesOpen);
  const favorites = useAppStore(s => s.favorites);
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

  // Validate session on mount
  useEffect(() => {
    validateSession().then(u => {
      if (u) {
        let jwt: string | null = null;
        try { jwt = localStorage.getItem('chargegr_jwt'); } catch { /* WebView/incognito guard */ }
        setUser(u, jwt);
      }
    }).catch(() => { /* session validation failed — user stays anonymous */ });
  }, [setUser]);

  const hasActiveFilters =
    filters.connectorTypes.length > 0 ||
    filters.powerCategories.length > 0 ||
    filters.networks.length > 0 ||
    filters.onlyFree ||
    filters.only24h ||
    filters.onlyAvailable ||
    filters.onlyReliable;

  const toggleLocale = () => {
    setLocale(locale === 'el' ? 'en' : 'el');
  };

  return (
    <>
      <SplashScreen />

      <MapContainer
        stations={filteredStations}
        favoriteIds={favorites}
        onStationClick={selectStation}
        flyTo={flyTo}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30
                        bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2
                        flex items-center gap-2">
          <LoadingSpinner size={18} className="text-[#1B7B4E]" />
          <span className="text-sm text-gray-700 dark:text-gray-200">{t('common.loading')}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30
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
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30
                        bg-yellow-50 dark:bg-yellow-900/80 border border-yellow-200 dark:border-yellow-700 rounded-xl shadow-lg px-4 py-2
                        flex items-center gap-2">
          <span className="text-sm text-yellow-700 dark:text-yellow-200">{t('common.noStations')}</span>
        </div>
      )}

      {/* Top bar */}
      <div className="topbar absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-30
                      flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[40px] sm:min-h-[44px]
                     bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg
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

        {/* Vehicle + Language + Auth — always visible, icon-only on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <VehicleSelector
            selectedVehicle={selectedVehicle}
            onSelect={selectVehicle}
          />

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[40px] sm:min-h-[44px]
                       bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg
                       border border-gray-200 dark:border-gray-600
                       hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shrink-0"
            aria-label={locale === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
          >
            <Globe size={16} className="text-[#1B7B4E]" />
            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
              {locale === 'el' ? 'EN' : 'EL'}
            </span>
          </button>

          {user ? <UserMenu /> : <LoginButton />}
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

      {/* Desktop + landscape: sidebar | Mobile portrait: bottom sheet */}
      {selectedStation && (
        <>
          {/* Sidebar (desktop always, mobile landscape via CSS) */}
          <div className="station-sidebar fixed top-0 right-0 bottom-0
                          w-[350px] md:w-[380px] z-40
                          bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto
                          border-l border-gray-200 dark:border-gray-700">
            <div className="relative px-4 py-3 md:px-5 md:py-4">
              <button
                onClick={() => selectStation(null)}
                className="absolute top-2 right-3 z-10 p-2 rounded-full
                           hover:bg-gray-100 dark:hover:bg-gray-700
                           min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('common.close')}
              >
                <span className="text-xl text-gray-400 hover:text-gray-600">&times;</span>
              </button>
              <div className="pr-12">
                <StationCard
                  station={selectedStation}
                  vehicle={selectedVehicle}
                />
              </div>
            </div>
          </div>

          {/* Mobile portrait bottom sheet */}
          <div className="station-bottomsheet">
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

      {/* Favorites panel */}
      {favoritesOpen && (
        <FavoritesList onClose={() => setFavoritesOpen(false)} />
      )}

      <Legend />
      <LegalLinks />
    </>
  );
}
