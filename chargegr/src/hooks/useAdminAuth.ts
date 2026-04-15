'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';

export interface AdminMe {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: 'user' | 'admin';
  isBanned: boolean;
  createdAt: string;
}

interface State {
  user: AdminMe | null;
  isLoading: boolean;
  isAdmin: boolean;
}

// Guards /dashboard/* pages. Redirects to "/" if the user is not an admin.
// Returns { user, isLoading, isAdmin }. While isLoading=true the caller
// should render a loader / skeleton. While isLoading=false && !isAdmin the
// redirect has already been scheduled.
export function useAdminAuth(): State {
  const router = useRouter();
  const [state, setState] = useState<State>({ user: null, isLoading: true, isAdmin: false });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let jwt: string | null = null;
      try { jwt = localStorage.getItem('chargegr_jwt'); } catch { /* ignore */ }
      if (!jwt) {
        if (!cancelled) router.replace('/');
        return;
      }

      try {
        const me = await apiGet<AdminMe>('/auth/me');
        if (cancelled) return;
        if (me.role !== 'admin' || me.isBanned) {
          router.replace('/');
          setState({ user: me, isLoading: false, isAdmin: false });
          return;
        }
        setState({ user: me, isLoading: false, isAdmin: true });
      } catch {
        if (cancelled) return;
        // api.ts already cleared the JWT on 401
        router.replace('/');
        setState({ user: null, isLoading: false, isAdmin: false });
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  return state;
}
