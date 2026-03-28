'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Car, Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import type { VehicleProfile } from '@/lib/types';
import { loadVehicleDatabase } from '@/lib/vehicles';
import { useTranslation } from '@/lib/i18n';
import VehicleSuggest from './VehicleSuggest';

interface Props {
  selectedVehicle: VehicleProfile | null;
  onSelect: (vehicle: VehicleProfile | null) => void;
}

const STORAGE_KEY = 'chargegr_vehicle';

export default function VehicleSelector({ selectedVehicle, onSelect }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load vehicles on mount + restore from localStorage
  useEffect(() => {
    loadVehicleDatabase().then((db) => {
      setVehicles(db);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const vehicle = db.find(v => v.id === saved);
          if (vehicle) onSelect(vehicle);
        }
      } catch { /* ignore */ }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedBrand(null);
        setBrandSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Focus search input when panel opens
  useEffect(() => {
    if (isOpen && !selectedBrand) brandInputRef.current?.focus();
  }, [isOpen, selectedBrand]);

  // Build brand list with model counts
  const brands = useMemo(() => {
    const map = new Map<string, number>();
    vehicles.forEach(v => map.set(v.make, (map.get(v.make) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [vehicles]);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter(b => b.name.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  // Models for selected brand
  const brandModels = useMemo(() => {
    if (!selectedBrand) return [];
    return vehicles
      .filter(v => v.make === selectedBrand)
      .sort((a, b) => a.model.localeCompare(b.model));
  }, [vehicles, selectedBrand]);

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setBrandSearch('');
  };

  const handleSelectModel = (vehicle: VehicleProfile) => {
    onSelect(vehicle);
    localStorage.setItem(STORAGE_KEY, vehicle.id);
    setIsOpen(false);
    setSelectedBrand(null);
    setBrandSearch('');
  };

  const handleClear = () => {
    onSelect(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsOpen(false);
    setSelectedBrand(null);
    setBrandSearch('');
  };

  const handleBack = () => {
    setSelectedBrand(null);
    setBrandSearch('');
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 min-h-[44px]
                   bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                   rounded-xl shadow-lg border border-gray-200 dark:border-gray-600
                   hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95
                   transition-all max-w-[260px]"
      >
        <Car size={16} className="text-[#1B7B4E] shrink-0" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate hidden sm:inline">
          {selectedVehicle
            ? `${selectedVehicle.make} ${selectedVehicle.model}`
            : t('vehicle.select')
          }
        </span>
        {selectedVehicle ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="shrink-0 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hidden sm:block"
            aria-label={t('vehicle.remove')}
          >
            <X size={14} className="text-gray-400" />
          </button>
        ) : (
          <ChevronDown size={14} className="text-gray-400 shrink-0 hidden sm:block" />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80
                        bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                        border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">

          {!selectedBrand ? (
            /* ── Step 1: Brand selection ── */
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  ref={brandInputRef}
                  type="text"
                  placeholder={t('vehicle.searchBrand')}
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-900 dark:text-gray-100
                             placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                {t('vehicle.brand')} ({brands.length})
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {filteredBrands.length === 0 && (
                  <li className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                    {t('vehicle.notFound')}
                  </li>
                )}
                {filteredBrands.map(b => (
                  <li key={b.name}>
                    <button
                      onClick={() => handleSelectBrand(b.name)}
                      className="w-full text-left px-3 py-2.5 text-sm
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        transition-colors flex items-center justify-between
                        active:bg-gray-100 dark:active:bg-gray-600"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{b.name}</span>
                      <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                        <span className="text-xs">({b.count})</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
                <button
                  onClick={() => { setIsOpen(false); setSuggestOpen(true); }}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('vehicle.suggestLink')}
                </button>
              </div>
            </>
          ) : (
            /* ── Step 2: Model selection ── */
            <>
              <button
                onClick={handleBack}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm
                           border-b border-gray-200 dark:border-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronDown size={14} className="rotate-90 text-gray-400" />
                <span className="font-semibold text-[#1B7B4E]">{selectedBrand}</span>
              </button>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                {t('vehicle.model')} ({brandModels.length})
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {brandModels.map(v => (
                  <li key={v.id}>
                    <button
                      onClick={() => handleSelectModel(v)}
                      className={`w-full text-left px-3 py-2.5 text-sm
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        transition-colors active:bg-gray-100 dark:active:bg-gray-600
                        ${selectedVehicle?.id === v.id ? 'bg-green-50 dark:bg-green-900/30' : ''}`}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {v.model}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {v.batteryKwh} kWh · {v.maxDcKw} kW DC
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <VehicleSuggest open={suggestOpen} onClose={() => setSuggestOpen(false)} />
    </div>
  );
}
