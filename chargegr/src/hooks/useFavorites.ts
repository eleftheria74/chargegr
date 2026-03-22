import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiGet, apiPost } from '@/lib/api';

const LOCAL_KEY = 'chargegr_favorites';

function getLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalFavorites(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

export function useFavorites() {
  const user = useAppStore(s => s.user);
  const favorites = useAppStore(s => s.favorites);
  const setFavorites = useAppStore(s => s.setFavorites);

  // Fetch favorites on mount / user change
  useEffect(() => {
    if (user) {
      apiGet<{ favorites: string[] }>('/user/favorites')
        .then(data => setFavorites(data.favorites))
        .catch(() => setFavorites(getLocalFavorites()));
    } else {
      setFavorites(getLocalFavorites());
    }
  }, [user, setFavorites]);

  const isFavorite = useCallback(
    (stationId: string) => favorites.includes(stationId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (stationId: string) => {
      // Optimistic update
      const wasFav = favorites.includes(stationId);
      const updated = wasFav
        ? favorites.filter(id => id !== stationId)
        : [...favorites, stationId];
      setFavorites(updated);
      setLocalFavorites(updated);

      if (user) {
        try {
          await apiPost(`/user/favorites/${stationId}`);
        } catch {
          // Revert on error
          setFavorites(favorites);
          setLocalFavorites(favorites);
        }
      }
    },
    [user, favorites, setFavorites],
  );

  return { favorites, isFavorite, toggleFavorite };
}
