import { apiPost, apiGet } from './api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
}

interface GoogleAuthResponse {
  jwt: string;
  user: AuthUser;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

let scriptLoaded = false;

export function loadGoogleScript(): Promise<void> {
  if (scriptLoaded && window.google?.accounts) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export async function loginWithGoogle(): Promise<{ jwt: string; user: AuthUser }> {
  await loadGoogleScript();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Google Client ID not configured');
  }

  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error));
          return;
        }

        try {
          // Get user info from Google using access token
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          if (!userInfoRes.ok) throw new Error('Failed to get user info');
          const userInfo = await userInfoRes.json();

          // Send to our API
          const result = await apiPost<GoogleAuthResponse>('/auth/google', {
            token: tokenResponse.access_token,
            userInfo: {
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              sub: userInfo.sub,
            },
          });

          // Save JWT
          try {
            localStorage.setItem('chargegr_jwt', result.jwt);
          } catch { /* ignore */ }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
    });

    tokenClient.requestAccessToken();
  });
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<{ jwt: string; user: AuthUser }> {
  const result = await apiPost<GoogleAuthResponse>('/auth/register', {
    email,
    password,
    displayName,
  });
  try {
    localStorage.setItem('chargegr_jwt', result.jwt);
  } catch { /* ignore */ }
  return result;
}

export async function loginWithEmail(email: string, password: string): Promise<{ jwt: string; user: AuthUser }> {
  const result = await apiPost<GoogleAuthResponse>('/auth/login', {
    email,
    password,
  });
  try {
    localStorage.setItem('chargegr_jwt', result.jwt);
  } catch { /* ignore */ }
  return result;
}

export function logout(): void {
  try {
    localStorage.removeItem('chargegr_jwt');
  } catch { /* ignore */ }
}

export async function validateSession(): Promise<AuthUser | null> {
  try {
    let jwt: string | null = null;
    try { jwt = localStorage.getItem('chargegr_jwt'); } catch { /* WebView/incognito guard */ }
    if (!jwt) return null;
    // /auth/me returns user fields directly (not wrapped in {user: ...})
    const data = await apiGet<AuthUser & Record<string, unknown>>('/auth/me');
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      avatar: data.avatar ?? null,
    };
  } catch (err) {
    // Only clear JWT on auth errors (401 is already handled by api.ts)
    if (err instanceof Error && err.message === 'unauthorized') {
      logout();
    }
    return null;
  }
}
