# ChargeGR - Εφαρμογή Εύρεσης Σταθμών Φόρτισης EV

## Σύνοψη Project

Ελληνική cross-network εφαρμογή εύρεσης σταθμών φόρτισης ηλεκτρικών αυτοκινήτων.
PWA-first, deployed στο `chargegr.viralev.gr`, με μετατροπή σε Android app μέσω TWA.

## Tech Stack

| Layer | Τεχνολογία | Λόγος |
|-------|-----------|-------|
| Framework | Next.js 14 (static export) | SSG, γρήγορο, Claude Code friendly |
| Maps | MapLibre GL JS + OpenFreeMap tiles | 100% δωρεάν, χωρίς API keys |
| Data | ΜΥΦΑΗ API + OpenChargeMap API | Δωρεάν, ανοιχτά δεδομένα |
| Styling | Tailwind CSS | Utility-first, responsive |
| Icons | Lucide React | Ελαφρύ, consistent |
| State | Zustand | Minimal, απλό, χωρίς boilerplate |
| i18n | next-intl | EL/EN support |
| Hosting | Plesk (static files) | Ήδη υπάρχει για viralev.gr |
| Android | Bubblewrap (TWA) | Ίδιο PWA → Play Store |
| Backend (Phase 3) | Supabase | Free tier, auth, PostgreSQL, storage |

## Φάσεις Ανάπτυξης

| Φάση | Αρχείο | Χρόνος | Κόστος |
|------|--------|--------|--------|
| Phase 1 | [PHASE-1-MVP.md](./PHASE-1-MVP.md) | 4-6 εβδομάδες | 0€ |
| Phase 2 | [PHASE-2-ANDROID.md](./PHASE-2-ANDROID.md) | 1-2 εβδομάδες | 25$ |
| Phase 3 | [PHASE-3-COMMUNITY.md](./PHASE-3-COMMUNITY.md) | 4-6 εβδομάδες | 10-20€/μήνα |
| Phase 4 | [PHASE-4-SCALE.md](./PHASE-4-SCALE.md) | Ongoing | Variable |

## Οδηγίες χρήσης με Claude Code

Κάθε φάση περιέχει tasks σε σειρά. Δώσε στο Claude Code ένα task τη φορά:

```bash
# Παράδειγμα: ξεκινάς Phase 1, Task 1
claude "Read the file PHASE-1-MVP.md and execute Task 1.1: Project Setup"
```

Μην τρέχεις πολλά tasks μαζί. Κάθε task πρέπει να ολοκληρωθεί και να δοκιμαστεί
πριν προχωρήσεις στο επόμενο.

## Δομή φακέλων (τελικό αποτέλεσμα Phase 1)

```
chargegr/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── icons/                 # App icons (192, 512)
│   └── locales/
│       ├── el.json            # Ελληνικά
│       └── en.json            # English
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Main map page
│   │   └── globals.css
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── ChargerMarker.tsx
│   │   │   ├── ChargerPopup.tsx
│   │   │   ├── ClusterLayer.tsx
│   │   │   └── UserLocation.tsx
│   │   ├── Filters/
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ConnectorFilter.tsx
│   │   │   ├── PowerFilter.tsx
│   │   │   └── NetworkFilter.tsx
│   │   ├── Vehicle/
│   │   │   ├── VehicleSelector.tsx
│   │   │   └── VehicleProfiles.ts
│   │   ├── Search/
│   │   │   └── SearchBar.tsx
│   │   ├── StationDetail/
│   │   │   ├── StationCard.tsx
│   │   │   ├── ConnectorInfo.tsx
│   │   │   └── NavigateButton.tsx
│   │   └── UI/
│   │       ├── BottomSheet.tsx
│   │       ├── Chip.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useChargers.ts
│   │   ├── useGeolocation.ts
│   │   ├── useVehicle.ts
│   │   └── useFilters.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── myfahi.ts      # ΜΥΦΑΗ API client
│   │   │   ├── ocm.ts         # OpenChargeMap API client
│   │   │   └── merge.ts       # Merge & deduplicate data
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── constants.ts       # Connector types, networks etc
│   │   ├── vehicles.ts        # Vehicle database
│   │   └── utils.ts           # Distance calc, formatting
│   └── store/
│       └── appStore.ts        # Zustand store
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```
