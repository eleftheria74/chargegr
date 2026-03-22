import type { Locale } from './i18n';

export function timeAgo(dateStr: string, locale: Locale): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'el') {
    if (diffMin < 60) return `πριν ${diffMin} λεπτά`;
    if (diffHours < 24) return `πριν ${diffHours} ώρες`;
    return `πριν ${diffDays} μέρες`;
  } else {
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }
}
