'use client';

import { useState, useRef, useEffect } from 'react';
import { Car, Search, X, ChevronDown } from 'lucide-react';
import type { VehicleProfile } from '@/lib/types';
import { loadVehicleDatabase } from '@/lib/vehicles';
import { useTranslation } from '@/lib/i18n';

interface Props {
  selectedVehicle: VehicleProfile | null;
  onSelect: (vehicle: VehicleProfile | null) => void;
}

const STORAGE_KEY = 'chargegr_vehicle';

export default function VehicleSelector({ selectedVehicle, onSelect }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const filtered = search.trim()
    ? vehicles.filter(v => {
        const q = search.toLowerCase();
        return (
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          `${v.make} ${v.model}`.toLowerCase().includes(q)
        );
      })
    : vehicles;

  const handleSelect = (vehicle: VehicleProfile) => {
    onSelect(vehicle);
    localStorage.setItem(STORAGE_KEY, vehicle.id);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onSelect(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 min-h-[44px]
                   bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                   rounded-xl shadow-lg border border-gray-200 dark:border-gray-600
                   hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95
                   transition-all max-w-[220px]"
      >
        <Car size={16} className="text-[#1B7B4E] shrink-0" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {selectedVehicle
            ? `${selectedVehicle.make} ${selectedVehicle.model}`
            : t('vehicle.select')
          }
        </span>
        {selectedVehicle ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="shrink-0 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label={t('vehicle.remove')}
          >
            <X size={14} className="text-gray-400" />
          </button>
        ) : (
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72
                        bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                        border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('vehicle.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-900 dark:text-gray-100
                         placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <ul className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                {t('vehicle.notFound')}
              </li>
            )}
            {filtered.map(v => (
              <li key={v.id}>
                <button
                  onClick={() => handleSelect(v)}
                  className={`w-full text-left px-3 py-2 text-sm
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors flex items-center justify-between
                    ${selectedVehicle?.id === v.id ? 'bg-green-50 dark:bg-green-900/30' : ''}`}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{v.make}</span>
                    <span className="text-gray-600 dark:text-gray-300"> {v.model}</span>
                    {v.year && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({v.year})</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                    {v.batteryKwh} kWh
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
