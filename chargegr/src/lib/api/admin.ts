// Typed client for the /admin/* API surface.
// Reuses the shared request() helper from src/lib/api.ts so 401 handling,
// JWT injection, and cache-busting are consistent with the rest of the app.

import { apiGet, apiPost, apiDelete, apiPatch } from '../api';

// ── Shared types ────────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type UserRole = 'user' | 'admin';
export type UserProvider = 'google' | 'email';

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  provider: UserProvider;
  role: UserRole;
  isBanned: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  selectedVehicleId: string | null;
  preferredLanguage: 'el' | 'en' | null;
  consentGivenAt: string | null;
}

export interface UserStats {
  reviews: number;
  photos: number;
  checkins: number;
  favorites: number;
}

export interface UserActivity {
  type: 'review' | 'photo' | 'checkin';
  id: string;
  stationId: string;
  createdAt: string;
  extra: unknown;
}

export interface Overview {
  users: { total: number; newThisMonth: number; banned: number; admins: number };
  content: {
    reviews: number;
    avgRating: number | null;
    photos: number;
    checkins: number;
    favorites: number;
  };
  vehicles: { total: number; suggestionsPending: number; suggestionsTotal: number };
  recentActivity: Array<{
    type: 'review' | 'photo' | 'checkin';
    id: string;
    createdAt: string;
    userDisplayName: string | null;
    userEmail: string;
    stationId: string;
  }>;
}

export interface ReviewItem {
  id: string;
  stationId: string;
  userId: string;
  userDisplayName: string | null;
  userEmail: string;
  userAvatar: string | null;
  rating: number;
  comment: string | null;
  wasWorking: boolean | null;
  waitTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  stationId: string;
  userId: string;
  userDisplayName: string | null;
  userEmail: string;
  filename: string;
  thumbnailFilename: string | null;
  caption: string | null;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface FavoriteItem {
  userId: string;
  stationId: string;
  userDisplayName: string | null;
  userEmail: string;
  userAvatar: string | null;
  createdAt: string;
}

export interface CheckinItem {
  id: string;
  stationId: string;
  userId: string;
  userDisplayName: string | null;
  userEmail: string;
  wasWorking: boolean;
  connectorUsed: string | null;
  chargingSpeedKw: string | null;
  comment: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  adminEmail: string | null;
  adminDisplayName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | string | null;
  ipAddress: string | null;
  createdAt: string;
}

// ── Query-string helper ────────────────────────────────────────────────
function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ── API namespace ──────────────────────────────────────────────────────
export const adminApi = {
  overview: () => apiGet<Overview>('/admin/overview'),

  users: {
    list: (params: {
      page?: number; limit?: number; search?: string;
      role?: UserRole; is_banned?: boolean; provider?: UserProvider;
      sort?: 'created_at' | 'last_login' | 'email' | 'display_name';
      dir?: 'asc' | 'desc';
    } = {}) =>
      apiGet<{ users: AdminUserSummary[]; pagination: Pagination }>(
        `/admin/users${qs(params)}`
      ),

    get: (id: string) =>
      apiGet<{ user: AdminUserDetail; stats: UserStats; recentActivity: UserActivity[] }>(
        `/admin/users/${encodeURIComponent(id)}`
      ),

    update: (id: string, body: {
      displayName?: string;
      role?: UserRole;
      isBanned?: boolean;
      bannedReason?: string;
    }) => apiPatch<{ success: boolean }>(`/admin/users/${encodeURIComponent(id)}`, body),

    forceLogout: (id: string) =>
      apiPost<{ success: boolean }>(`/admin/users/${encodeURIComponent(id)}/force-logout`),

    delete: (id: string) =>
      apiDelete<{ success: boolean; deletedRecords: Record<string, number> }>(
        `/admin/users/${encodeURIComponent(id)}`
      ),

    exportUrl: () => `/admin/users/export`,
  },

  reviews: {
    list: (params: {
      page?: number; limit?: number; search?: string;
      user_id?: string; station_id?: string;
      min_rating?: number; max_rating?: number; dir?: 'asc' | 'desc';
    } = {}) =>
      apiGet<{ reviews: ReviewItem[]; pagination: Pagination }>(
        `/admin/reviews${qs(params)}`
      ),
    delete: (id: string) =>
      apiDelete<{ success: boolean }>(`/admin/reviews/${encodeURIComponent(id)}`),
  },

  photos: {
    list: (params: {
      page?: number; limit?: number;
      user_id?: string; station_id?: string; dir?: 'asc' | 'desc';
    } = {}) =>
      apiGet<{ photos: PhotoItem[]; pagination: Pagination }>(
        `/admin/photos${qs(params)}`
      ),
    delete: (id: string) =>
      apiDelete<{ success: boolean }>(`/admin/photos/${encodeURIComponent(id)}`),
  },

  checkins: {
    list: (params: {
      page?: number; limit?: number;
      user_id?: string; station_id?: string;
      was_working?: boolean; dir?: 'asc' | 'desc';
    } = {}) =>
      apiGet<{ checkins: CheckinItem[]; pagination: Pagination }>(
        `/admin/checkins${qs(params)}`
      ),
    delete: (id: string) =>
      apiDelete<{ success: boolean }>(`/admin/checkins/${encodeURIComponent(id)}`),
  },

  favorites: {
    list: (params: {
      page?: number; limit?: number;
      user_id?: string; station_id?: string; dir?: 'asc' | 'desc';
    } = {}) =>
      apiGet<{ favorites: FavoriteItem[]; pagination: Pagination }>(
        `/admin/favorites${qs(params)}`
      ),
    delete: (userId: string, stationId: string) =>
      apiDelete<{ success: boolean }>(`/admin/favorites`, { userId, stationId }),
  },

  audit: {
    list: (params: {
      page?: number; limit?: number;
      admin_user_id?: string; action?: string;
      date_from?: string; date_to?: string;
    } = {}) =>
      apiGet<{ log: AuditLogEntry[]; pagination: Pagination }>(
        `/admin/audit-log${qs(params)}`
      ),
  },
};
