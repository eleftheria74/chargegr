'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  onSelectLocation: (lat: number, lng: number) => void;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export default function SearchBar({ onSelectLocation }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        format: 'json',
        countrycodes: 'gr',
        limit: '5',
        addressdetails: '0',
      });
      const resp = await fetch(`${NOMINATIM_URL}?${params}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'PlugMeNow-App' },
      });
      const data: NominatimResult[] = await resp.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    clearTimeout(timerRef.current);

    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timerRef.current = setTimeout(() => search(value.trim()), DEBOUNCE_MS);
  };

  const handleSelect = (result: NominatimResult) => {
    onSelectLocation(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name.split(',')[0]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs">
      <div className="flex items-center gap-2 px-3 py-2 min-h-[44px]
                      bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                      rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
        <Search size={16} className={loading ? 'text-[#1B7B4E] animate-pulse' : 'text-gray-400'} />
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="flex-1 text-sm outline-none bg-transparent text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0"
        />
        {query && (
          <button onClick={handleClear} className="shrink-0 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1
                       bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                       border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
          {results.map(r => (
            <li key={r.place_id}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 text-sm
                           hover:bg-gray-50 dark:hover:bg-gray-700
                           transition-colors flex items-start gap-2"
              >
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-700 dark:text-gray-200 line-clamp-2">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
