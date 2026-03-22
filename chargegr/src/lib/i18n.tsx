'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Locale = 'el' | 'en';

const STORAGE_KEY = 'chargegr_lang';

const translations: Record<Locale, Record<string, Record<string, string>>> = {
  el: {
    app: { name: 'PlugMeNow', tagline: 'Βρες φορτιστή, τώρα!' },
    map: { findMe: 'Η τοποθεσία μου', loading: 'Φόρτωση χάρτη...' },
    filters: {
      title: 'Φίλτρα',
      connector: 'Τύπος βύσματος',
      power: 'Ισχύς',
      network: 'Δίκτυο',
      options: 'Επιλογές',
      onlyAvailable: 'Μόνο διαθέσιμοι',
      freeOnly: 'Μόνο δωρεάν',
      '24hOnly': 'Μόνο 24ωρο',
      compatibleOnly: 'Μόνο συμβατοί',
      clear: 'Καθαρισμός',
      stations: 'σταθμοί',
      close: 'Κλείσιμο',
      powerSlow: 'Αργή (<7 kW)',
      powerFast: 'Κανονική (7-22 kW)',
      powerRapid: 'Ταχεία (23-99 kW)',
      powerUltra: 'Ultra (100+ kW)',
    },
    station: {
      available: 'Διαθέσιμος',
      unavailable: 'Εκτός λειτουργίας',
      free: 'ΔΩΡΕΑΝ',
      '24h': '24ωρο',
      kwMax: 'kW max',
      noAddress: 'Χωρίς διεύθυνση',
      compatible: 'Συμβατός με',
      incompatible: 'Μη συμβατός με',
      chargingTime: 'Εκτιμώμενος χρόνος',
      minutes: 'λεπτά',
      connectors: 'Βύσματα',
      navigate: 'Πλοήγηση',
      share: 'Κοινοποίηση σταθμού',
      shareApp: 'Κοινοποίηση εφαρμογής',
      shareText: 'Σταθμός φόρτισης EV:',
      shareAppText: 'Βρες φορτιστή, τώρα! — PlugMeNow',
      linkCopied: 'Ο σύνδεσμος αντιγράφηκε',
    },
    vehicle: {
      select: 'Όχημα',
      search: 'Αναζήτηση μοντέλου...',
      notFound: 'Δεν βρέθηκε μοντέλο',
      remove: 'Αφαίρεση οχήματος',
      battery: 'Μπαταρία',
      range: 'Αυτονομία',
    },
    search: { placeholder: 'Αναζήτηση τοποθεσίας...' },
    common: {
      close: 'Κλείσιμο',
      loading: 'Φόρτωση...',
      error: 'Σφάλμα δικτύου',
      noStations: 'Δεν βρέθηκαν σταθμοί',
      retry: 'Δοκιμή ξανά',
    },
    auth: {
      signIn: 'Σύνδεση',
      signOut: 'Αποσύνδεση',
      loginToFavorite: 'Συνδεθείτε για αγαπημένα',
      loginToReview: 'Συνδεθείτε για κριτική',
      loginToCheckin: 'Συνδεθείτε για check-in',
    },
    favorites: {
      myFavorites: 'Τα αγαπημένα μου',
      add: 'Προσθήκη',
      remove: 'Αφαίρεση',
      empty: 'Δεν έχετε αγαπημένα ακόμα',
      title: 'Αγαπημένα',
    },
    reviews: {
      title: 'Κριτικές',
      write: 'Γράψε κριτική',
      update: 'Ενημέρωσε την κριτική σου',
      wasWorking: 'Λειτουργούσε;',
      submit: 'Υποβολή',
      noReviews: 'Καμία κριτική ακόμα',
      showAll: 'Δες όλες',
      showLess: 'Λιγότερες',
      reviewsCount: 'κριτικές',
      waitTime: 'Χρόνος αναμονής',
      waitMinutes: 'λεπτά',
      comment: 'Σχόλιο',
      yes: 'Ναι',
      no: 'Όχι',
    },
    checkin: {
      title: 'Check-in',
      button: 'Φόρτιζα εδώ!',
      wasWorking: 'Λειτουργούσε;',
      working: 'Λειτουργούσε',
      notWorking: 'Εκτός λειτουργίας',
      connector: 'Βύσμα',
      speed: 'Ταχύτητα (kW)',
      comment: 'Σχόλιο',
      submit: 'Υποβολή',
      success: 'Ευχαριστούμε!',
      ago: 'πριν',
      minutesAgo: 'λεπτά',
      hoursAgo: 'ώρες',
      daysAgo: 'μέρες',
    },
    reliability: {
      reliable: 'Αξιόπιστος',
      moderate: 'Μέτριος',
      unreliable: 'Προβληματικός',
      noData: 'Χωρίς δεδομένα',
      checkins: 'check-ins',
      onlyReliable: 'Μόνο αξιόπιστοι (>80%)',
    },
    legend: {
      title: 'Υπόμνημα',
      slow: 'Αργή (<7 kW)',
      fast: 'Κανονική (7-22 kW)',
      rapid: 'Ταχεία (23-99 kW)',
      ultra: 'Ultra (100+ kW)',
      offline: 'Εκτός λειτουργίας',
    },
  },
  en: {
    app: { name: 'PlugMeNow', tagline: 'Find a charger, now!' },
    map: { findMe: 'My location', loading: 'Loading map...' },
    filters: {
      title: 'Filters',
      connector: 'Connector type',
      power: 'Power',
      network: 'Network',
      options: 'Options',
      onlyAvailable: 'Only available',
      freeOnly: 'Only free',
      '24hOnly': 'Only 24h',
      compatibleOnly: 'Only compatible',
      clear: 'Clear',
      stations: 'stations',
      close: 'Close',
      powerSlow: 'Slow (<7 kW)',
      powerFast: 'Normal (7-22 kW)',
      powerRapid: 'Fast (23-99 kW)',
      powerUltra: 'Ultra (100+ kW)',
    },
    station: {
      available: 'Available',
      unavailable: 'Out of service',
      free: 'FREE',
      '24h': '24h',
      kwMax: 'kW max',
      noAddress: 'No address',
      compatible: 'Compatible with',
      incompatible: 'Not compatible with',
      chargingTime: 'Estimated time',
      minutes: 'minutes',
      connectors: 'Connectors',
      navigate: 'Navigate',
      share: 'Share station',
      shareApp: 'Share app',
      shareText: 'EV charging station:',
      shareAppText: 'Find a charger, now! — PlugMeNow',
      linkCopied: 'Link copied to clipboard',
    },
    vehicle: {
      select: 'Vehicle',
      search: 'Search model...',
      notFound: 'No model found',
      remove: 'Remove vehicle',
      battery: 'Battery',
      range: 'Range',
    },
    search: { placeholder: 'Search location...' },
    common: {
      close: 'Close',
      loading: 'Loading...',
      error: 'Network error',
      noStations: 'No stations found',
      retry: 'Try again',
    },
    auth: {
      signIn: 'Sign in',
      signOut: 'Sign out',
      loginToFavorite: 'Sign in to add favorites',
      loginToReview: 'Sign in to write a review',
      loginToCheckin: 'Sign in to check in',
    },
    favorites: {
      myFavorites: 'My favorites',
      add: 'Add',
      remove: 'Remove',
      empty: 'No favorites yet',
      title: 'Favorites',
    },
    reviews: {
      title: 'Reviews',
      write: 'Write review',
      update: 'Update your review',
      wasWorking: 'Was it working?',
      submit: 'Submit',
      noReviews: 'No reviews yet',
      showAll: 'Show all',
      showLess: 'Show less',
      reviewsCount: 'reviews',
      waitTime: 'Wait time',
      waitMinutes: 'minutes',
      comment: 'Comment',
      yes: 'Yes',
      no: 'No',
    },
    checkin: {
      title: 'Check-in',
      button: 'I charged here!',
      wasWorking: 'Was it working?',
      working: 'Working',
      notWorking: 'Not working',
      connector: 'Connector',
      speed: 'Speed (kW)',
      comment: 'Comment',
      submit: 'Submit',
      success: 'Thank you!',
      ago: 'ago',
      minutesAgo: 'minutes',
      hoursAgo: 'hours',
      daysAgo: 'days',
    },
    reliability: {
      reliable: 'Reliable',
      moderate: 'Moderate',
      unreliable: 'Unreliable',
      noData: 'No data',
      checkins: 'check-ins',
      onlyReliable: 'Only reliable (>80%)',
    },
    legend: {
      title: 'Legend',
      slow: 'Slow (<7 kW)',
      fast: 'Normal (7-22 kW)',
      rapid: 'Fast (23-99 kW)',
      ultra: 'Ultra (100+ kW)',
      offline: 'Out of service',
    },
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('el');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'el' || saved === 'en') {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch { /* ignore */ }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch { /* ignore */ }
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string): string => {
    const [section, field] = key.split('.');
    return translations[locale]?.[section]?.[field] ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
