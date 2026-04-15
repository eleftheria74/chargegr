const BASE_URL = '/api';

function getJwt(): string | null {
  try {
    return localStorage.getItem('chargegr_jwt');
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};

  // Only set Content-Type for requests with a body (POST/PUT/PATCH)
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const jwt = getJwt();
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  let url = `${BASE_URL}${path}`;
  if (method === 'GET') {
    url += (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token expired or invalid — clear auth
    try {
      localStorage.removeItem('chargegr_jwt');
    } catch { /* ignore */ }
    throw new Error('unauthorized');
  }

  if (res.status === 429) {
    throw new Error('rate_limit');
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body);
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PATCH', path, body);
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>('DELETE', path);
}
