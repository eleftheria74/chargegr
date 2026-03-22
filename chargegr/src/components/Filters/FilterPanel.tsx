'use client';

import { SlidersHorizontal, X, Globe } from 'lucide-react';
import type { ConnectorType, PowerCategory, GreekNetwork, FilterState, VehicleProfile } from '@/lib/types';
import type { Locale } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import Chip from '@/components/UI/Chip';
import { CONNECTOR_LABELS } from '@/lib/charging';
import VehicleSelector from '@/components/Vehicle/VehicleSelector';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  stationCount: number;
  selectedVehicle: VehicleProfile | null;
  onSelectVehicle: (vehicle: VehicleProfile | null) => void;
  locale: Locale;
  onToggleLocale: () => void;
}

const CONNECTOR_OPTIONS: { value: ConnectorType; label: string }[] = [
  { value: 'Type2', label: CONNECTOR_LABELS.Type2 },
  { value: 'CCS2', label: CONNECTOR_LABELS.CCS2 },
  { value: 'CHAdeMO', label: CONNECTOR_LABELS.CHAdeMO },
  { value: 'Type1', label: CONNECTOR_LABELS.Type1 },
  { value: 'TeslaNCAS', label: CONNECTOR_LABELS.TeslaNCAS },
  { value: 'SchukoSocket', label: CONNECTOR_LABELS.SchukoSocket },
];

const POWER_KEYS: { value: PowerCategory; key: string }[] = [
  { value: 'slow', key: 'filters.powerSlow' },
  { value: 'fast', key: 'filters.powerFast' },
  { value: 'rapid', key: 'filters.powerRapid' },
  { value: 'ultrarapid', key: 'filters.powerUltra' },
];

const NETWORK_OPTIONS: GreekNetwork[] = [
  'DEI Blue',
  'NRG incharge',
  'ElpeFuture',
  'Blink',
  'Fortizo',
  'Protergia Charge',
  'Joltie Way',
  'Joule jCharge',
  'Electrip',
  'Lidl',
  'EVziiin',
  'EV Loader',
  'PlugQ',
  'eVplus',
  'EcoCharge',
  'Tesla Supercharger',
];

function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item)
    ? arr.filter(x => x !== item)
    : [...arr, item];
}

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  stationCount,
  selectedVehicle,
  onSelectVehicle,
  locale,
  onToggleLocale,
}: Props) {
  const { t } = useTranslation();

  const update = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onFiltersChange({
      connectorTypes: [],
      powerCategories: [],
      networks: [],
      onlyFree: false,
      only24h: false,
      onlyAvailable: false,
      onlyReliable: false,
      vehicleId: null,
    });
  };

  const hasActiveFilters =
    filters.connectorTypes.length > 0 ||
    filters.powerCategories.length > 0 ||
    filters.networks.length > 0 ||
    filters.onlyFree ||
    filters.only24h ||
    filters.onlyAvailable ||
    filters.onlyReliable;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-[300px] max-w-[85vw]
                      bg-white dark:bg-gray-800 shadow-2xl
                      overflow-y-auto transition-transform duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#1B7B4E]" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{t('filters.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('common.close')}>
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">
          {/* Mobile only: Vehicle selector + Language toggle */}
          <section className="sm:hidden space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('vehicle.select')} &amp; {t('filters.title')}
            </h3>
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onSelect={onSelectVehicle}
            />
            <button
              onClick={onToggleLocale}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] w-full
                         bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                         hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <Globe size={16} className="text-[#1B7B4E]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {locale === 'el' ? 'English' : 'Ελληνικά'}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {locale === 'el' ? 'EL → EN' : 'EN → EL'}
              </span>
            </button>
          </section>

          {/* Connector Type */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('filters.connector')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {CONNECTOR_OPTIONS.map(opt => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={filters.connectorTypes.includes(opt.value)}
                  onClick={() => update({
                    connectorTypes: toggleInArray(filters.connectorTypes, opt.value),
                  })}
                />
              ))}
            </div>
          </section>

          {/* Power */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('filters.power')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {POWER_KEYS.map(opt => (
                <Chip
                  key={opt.value}
                  label={t(opt.key)}
                  selected={filters.powerCategories.includes(opt.value)}
                  onClick={() => update({
                    powerCategories: toggleInArray(filters.powerCategories, opt.value),
                  })}
                />
              ))}
            </div>
          </section>

          {/* Network */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('filters.network')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {NETWORK_OPTIONS.map(net => (
                <Chip
                  key={net}
                  label={net}
                  selected={filters.networks.includes(net)}
                  onClick={() => update({
                    networks: toggleInArray(filters.networks, net),
                  })}
                />
              ))}
            </div>
          </section>

          {/* Toggles */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('filters.options')}
            </h3>
            <Toggle
              label={t('filters.onlyAvailable')}
              checked={filters.onlyAvailable}
              onChange={v => update({ onlyAvailable: v })}
            />
            <Toggle
              label={t('filters.freeOnly')}
              checked={filters.onlyFree}
              onChange={v => update({ onlyFree: v })}
            />
            <Toggle
              label={t('filters.24hOnly')}
              checked={filters.only24h}
              onChange={v => update({ only24h: v })}
            />
            <Toggle
              label={t('reliability.onlyReliable')}
              checked={filters.onlyReliable}
              onChange={v => update({ onlyReliable: v })}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-700 font-medium min-h-[44px] flex items-center"
            >
              {t('filters.clear')}
            </button>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            {stationCount} {t('filters.stations')}
          </span>
        </div>
      </div>
    </>
  );
}

// Simple toggle switch
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1 min-h-[44px]">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${
          checked ? 'bg-[#1B7B4E]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}
