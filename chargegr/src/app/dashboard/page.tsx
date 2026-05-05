'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, UserX, Shield, Star, Camera, CheckCircle2, Heart,
  Car, Lightbulb, AlertCircle, Clock, MapPin, RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { adminApi, type Overview } from '@/lib/api/admin';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-md bg-[#1B7B4E]/10 text-[#1B7B4E] flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function formatRelative(iso: string, locale: 'el' | 'en'): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((now - then) / 1000));
  const mins = Math.floor(s / 60);
  const hours = Math.floor(s / 3600);
  const days = Math.floor(s / 86400);
  if (s < 60) return locale === 'el' ? 'μόλις τώρα' : 'just now';
  if (mins < 60) return locale === 'el' ? `πριν ${mins}'` : `${mins}m ago`;
  if (hours < 24) return locale === 'el' ? `πριν ${hours}h` : `${hours}h ago`;
  if (days < 30) return locale === 'el' ? `πριν ${days}d` : `${days}d ago`;
  return new Date(iso).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-GB');
}

const activityIcon = {
  review: Star,
  photo: Camera,
  checkin: CheckCircle2,
} as const;

export default function DashboardIndexPage() {
  const { t, locale } = useTranslation();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.overview();
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 rounded-full border-2 border-[#1B7B4E]/20 border-t-[#1B7B4E] animate-spin" />
        <span className="text-sm">{t('admin.loading')}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <div className="font-medium">{t('admin.error')}</div>
          <div className="text-sm">{error || 'no data'}</div>
        </div>
      </div>
    );
  }

  const { users, content, stations, vehicles, recentActivity, system } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.overview')}</h1>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {t('admin.users')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label={t('admin.total')} value={users.total} />
          <StatCard icon={UserCheck} label={t('admin.newThisMonth')} value={users.newThisMonth} />
          <StatCard icon={Shield} label={t('admin.admins')} value={users.admins} />
          <StatCard icon={UserX} label={t('admin.banned')} value={users.banned} />
        </div>
      </section>

      {/* Content */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {t('admin.details')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Star}
            label={t('admin.reviews')}
            value={content.reviews}
            sub={content.avgRating != null
              ? `${t('admin.avgRating')}: ${content.avgRating.toFixed(2)}`
              : undefined}
          />
          <StatCard icon={Camera} label={t('admin.photos')} value={content.photos} />
          <StatCard icon={CheckCircle2} label={t('admin.checkins')} value={content.checkins} />
          <StatCard icon={Heart} label="Favorites" value={content.favorites} />
        </div>
      </section>

      {/* Stations + system health */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {t('admin.stations')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            icon={MapPin}
            label={t('admin.total')}
            value={stations.total != null ? stations.total : '—'}
          />
          <StatCard
            icon={RefreshCw}
            label={t('admin.lastStationRefresh')}
            value={
              system.lastStationRefresh
                ? formatRelative(system.lastStationRefresh, locale)
                : t('admin.unknown')
            }
            sub={
              system.lastStationRefresh
                ? new Date(system.lastStationRefresh).toLocaleString(
                    locale === 'el' ? 'el-GR' : 'en-GB'
                  )
                : undefined
            }
          />
        </div>
      </section>

      {/* Vehicles */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {locale === 'el' ? 'Οχήματα' : 'Vehicles'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard icon={Car} label={t('admin.total')} value={vehicles.total} />
          <StatCard
            icon={Lightbulb}
            label={t('admin.pendingSuggestions')}
            value={vehicles.suggestionsPending}
            sub={`${t('admin.total')}: ${vehicles.suggestionsTotal}`}
          />
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {t('admin.recentActivity')}
        </h2>
        {recentActivity.length === 0 ? (
          <div className="text-sm text-gray-500">{t('admin.noResults')}</div>
        ) : (
          <div className="bg-white rounded-lg border divide-y">
            {recentActivity.slice(0, 15).map((a) => {
              const Icon = activityIcon[a.type];
              return (
                <div key={`${a.type}-${a.id}`} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-900 truncate">
                      <span className="font-medium">{a.userDisplayName || a.userEmail}</span>
                      <span className="text-gray-500"> — {t(`admin.${a.type === 'review' ? 'reviews' : a.type === 'photo' ? 'photos' : 'checkins'}`)}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {t('admin.station')}: {a.stationId}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
                    <Clock size={12} />
                    {formatRelative(a.createdAt, locale)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="text-right">
          <Link
            href="/dashboard/audit-log"
            className="text-xs text-[#1B7B4E] hover:underline"
          >
            {t('admin.auditLog')} →
          </Link>
        </div>
      </section>
    </div>
  );
}
