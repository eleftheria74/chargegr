# Phase 1: PWA MVP — Χάρτης + Φίλτρα + Vehicle Profiles

## Στόχος
Δημιουργία Progressive Web App στο `chargegr.viralev.gr` που δείχνει ΟΛΟΥΣ τους σταθμούς
φόρτισης στην Ελλάδα, με φίλτρα connector/power/network και vehicle compatibility.

## Προαπαιτούμενα στο μηχάνημα ανάπτυξης (Kubuntu)
- Node.js 20+ (`node -v`)
- npm ή pnpm
- Git

---

## Task 1.1: Project Setup

**Εντολή στο Claude Code:**
```
Δημιούργησε ένα νέο Next.js 14 project με App Router, TypeScript, Tailwind CSS.
Ρύθμισε static export (output: 'export') στο next.config.js.
Εγκατέστησε: maplibre-gl, zustand, lucide-react.
Δημιούργησε τη δομή φακέλων σύμφωνα με το README.md.
```

**next.config.js — ΚΡΙΣΙΜΟ:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Static HTML export — τρέχει χωρίς Node server
  trailingSlash: true,     // Σημαντικό για Plesk static hosting
  images: {
    unoptimized: true       // Δεν έχουμε Next.js server
  }
};
module.exports = nextConfig;
```

**Επαλήθευση:**
```bash
npm run build    # Πρέπει να δημιουργήσει φάκελο /out
npx serve out    # Τοπική δοκιμή στο http://localhost:3000
```

---

## Task 1.2: PWA Configuration

**Εντολή στο Claude Code:**
```
Δημιούργησε PWA manifest.json και basic service worker.
Το app θα λέγεται "ChargeGR" με description "Βρες σταθμό φόρτισης EV στην Ελλάδα".
Theme color: #1B7B4E (πράσινο). Background: #FFFFFF.
Δημιούργησε icons σε 192x192 και 512x512 (placeholder SVG αρχικά).
```

**public/manifest.json:**
```json
{
  "name": "ChargeGR - Σταθμοί Φόρτισης EV",
  "short_name": "ChargeGR",
  "description": "Βρες σταθμό φόρτισης ηλεκτρικού αυτοκινήτου στην Ελλάδα",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1B7B4E",
  "background_color": "#FFFFFF",
  "lang": "el",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Επαλήθευση:**
- Άνοιξε Chrome DevTools → Application → Manifest
- Πρέπει να βλέπεις install prompt

---

## Task 1.3: Map Component — MapLibre + OpenFreeMap

**Εντολή στο Claude Code:**
```
Δημιούργησε MapContainer component χρησιμοποιώντας maplibre-gl.
Χρησιμοποίησε OpenFreeMap tiles: https://tiles.openfreemap.org/styles/liberty
Default center: Αθήνα [23.7275, 37.9838], zoom 7 (βλέπεις όλη την Ελλάδα).
Πρόσθεσε GeolocateControl (κουμπί "βρες με").
Πρόσθεσε NavigationControl (zoom +/-).
Το map πρέπει να γεμίζει ολόκληρη την οθόνη (100vh) πλην header.
```

**Σημαντικά για MapLibre:**
```typescript
// src/components/Map/MapContainer.tsx
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ΚΡΙΣΙΜΟ: OpenFreeMap — χωρίς API key, χωρίς limits
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Ελλάδα center
const GREECE_CENTER: [number, number] = [23.7275, 37.9838];
const DEFAULT_ZOOM = 7;
```

**Επαλήθευση:**
- Βλέπεις χάρτη Ελλάδας full-screen
- Κουμπί geolocation λειτουργεί
- Zoom λειτουργεί

---

## Task 1.4: TypeScript Types — Data Models

**Εντολή στο Claude Code:**
```
Δημιούργησε τα TypeScript interfaces στο src/lib/types.ts
για σταθμούς φόρτισης, connectors, networks, vehicles.
Βασίσου στο OCPI data model.
```

**src/lib/types.ts:**
```typescript
// === Connector Types ===
export type ConnectorType =
  | 'Type2'          // Mennekes — πιο συνηθισμένο AC στην Ευρώπη
  | 'CCS2'           // Combined Charging System — DC fast
  | 'CHAdeMO'        // Ιαπωνικό DC standard (σταδιακά εξαφανίζεται)
  | 'Type1'          // J1772 — σπάνιο στην Ελλάδα
  | 'TeslaNCAS'      // Tesla NACS connector
  | 'SchukoSocket'   // Οικιακή πρίζα — αργή φόρτιση
  | 'Other';

// === Power Categories ===
export type PowerCategory = 'slow' | 'fast' | 'rapid' | 'ultrarapid';
// slow: ≤7.4 kW (οικιακό)
// fast: 7.5-22 kW (AC δημόσιο)
// rapid: 23-99 kW (DC)
// ultrarapid: ≥100 kW (DC highway)

// === Charging Station ===
export interface ChargingStation {
  id: string;                     // Unique ID (ΜΥΦΑΗ ή OCM)
  source: 'myfahi' | 'ocm';      // Προέλευση δεδομένων
  name: string;                   // Όνομα σταθμού
  operator: string;               // Πάροχος (NRG, DEI Blue, Protergia...)
  address: string;
  city: string;
  lat: number;
  lng: number;
  connectors: Connector[];
  isOperational: boolean;         // Λειτουργεί;
  isFreeCharging: boolean;        // Δωρεάν;
  is24h: boolean;                 // 24ωρο;
  maxPowerKw: number;             // Μέγιστη ισχύς σε kW
  powerCategory: PowerCategory;
  lastUpdated: string;            // ISO date
  // Μελλοντικά (Phase 3):
  // rating?: number;
  // reviewCount?: number;
  // photos?: string[];
}

export interface Connector {
  type: ConnectorType;
  powerKw: number;
  quantity: number;              // Πόσα βύσματα αυτού του τύπου
  currentType: 'AC' | 'DC';
}

// === Vehicle Profile ===
export interface VehicleProfile {
  id: string;
  make: string;                  // π.χ. "Tesla"
  model: string;                 // π.χ. "Model 3"
  year?: number;
  batteryKwh: number;            // Χωρητικότητα μπαταρίας
  maxAcKw: number;               // Μέγιστη AC φόρτιση που δέχεται
  maxDcKw: number;               // Μέγιστη DC φόρτιση
  compatibleConnectors: ConnectorType[];
  rangeKm: number;               // WLTP range
  imageUrl?: string;
}

// === Greek EV Networks ===
export type GreekNetwork =
  | 'NRG incharge'
  | 'DEI Blue'
  | 'Protergia Charge'
  | 'Fortizo'
  | 'ElpeFuture'
  | 'Blink'
  | 'EV Loader'
  | 'PlugQ'
  | 'Joltie Way'
  | 'EVziiin'
  | 'EcoCharge'
  | 'Electrip'
  | 'eVplus'
  | 'Joule jCharge'
  | 'Tesla Supercharger'
  | 'Lidl'
  | 'Unknown';

// === Filter State ===
export interface FilterState {
  connectorTypes: ConnectorType[];
  powerCategories: PowerCategory[];
  networks: GreekNetwork[];
  onlyFree: boolean;
  only24h: boolean;
  onlyAvailable: boolean;
  vehicleId: string | null;       // Αν έχει επιλεγεί όχημα
}
```

---

## Task 1.5: ΜΥΦΑΗ API Client

**Εντολή στο Claude Code:**
```
Δημιούργησε API client για το ΜΥΦΑΗ (Μητρώο Υποδομών Φόρτισης).
API endpoint: https://api.electrokinisi.yme.gov.gr
Πρωτόκολλο: OCPI-based REST API.
Φέρε όλα τα locations με τα EVSEs και connectors τους.
Μετάτρεψε τα δεδομένα σε ChargingStation interface.
Cache τα δεδομένα σε localStorage (ανανέωση κάθε 6 ώρες).
```

**ΣΗΜΑΝΤΙΚΟ — ΜΥΦΑΗ API details:**
```typescript
// src/lib/api/myfahi.ts

// Το ΜΥΦΑΗ API βασίζεται σε OCPI
// Swagger docs: https://api.electrokinisi.yme.gov.gr

// Βασικά endpoints:
// GET /ocpi/cpo/2.2/locations        → Λίστα locations
// GET /ocpi/cpo/2.2/locations/{id}   → Συγκεκριμένο location

// Κάθε location περιέχει:
// - coordinates (lat/lng)
// - address
// - evses[] → κάθε EVSE έχει connectors[]
// - operator info
// - opening_times

// EVSE status values (OCPI):
// AVAILABLE, BLOCKED, CHARGING, INOPERATIVE, OUTOFORDER, PLANNED, REMOVED, RESERVED, UNKNOWN

// Connector standard mapping:
// IEC_62196_T2        → Type2 (AC)
// IEC_62196_T2_COMBO  → CCS2 (DC)
// CHADEMO             → CHAdeMO
// DOMESTIC_F          → SchukoSocket

// ΣΗΜΕΙΩΣΗ: Αν το API απαιτεί authentication token,
// μπορεί να χρειαστεί εγγραφή. Ελέγξτε πρώτα αν
// το public endpoint δουλεύει χωρίς token.
// Fallback: χρησιμοποίησε τα JSON exports
// από https://electrokinisi.yme.gov.gr/public/ChargingPoints/

// CORS NOTE: Αν υπάρχει CORS πρόβλημα (πιθανό!),
// θα κάνουμε proxy μέσω ενός Cloudflare Worker (δωρεάν)
// ή θα αντλούμε δεδομένα σε build time.
```

**Fallback strategy αν το ΜΥΦΑΗ API δεν δουλεύει απευθείας:**
1. Κατέβασε JSON dump από τη δημόσια σελίδα
2. Μετάτρεψε σε static JSON στο `/public/data/myfahi-stations.json`
3. Ανανέωσε χειροκίνητα (ή με cron n8n workflow) κάθε εβδομάδα

---

## Task 1.6: OpenChargeMap API Client

**Εντολή στο Claude Code:**
```
Δημιούργησε API client για το OpenChargeMap.
API: https://api.openchargemap.io/v3/poi/
Φίλτρα: countrycode=GR, maxresults=5000
Χρειάζεται δωρεάν API key (εγγραφή στο openchargemap.org/site/develop/api).
Μετάτρεψε τα δεδομένα σε ChargingStation interface.
```

**src/lib/api/ocm.ts:**
```typescript
// OpenChargeMap API
// Docs: https://openchargemap.org/site/develop/api

const OCM_BASE = 'https://api.openchargemap.io/v3/poi/';

// Παράμετροι:
// key=YOUR_API_KEY         (δωρεάν, πάρε ένα)
// countrycode=GR           (Ελλάδα)
// output=json
// maxresults=5000          (αρκετό για Ελλάδα)
// compact=true             (μικρότερο payload)
// verbose=false

// OCM Connection Type IDs → ConnectorType mapping:
// 25 = Type 2 (Mennekes)     → 'Type2'
// 33 = CCS (Type 2)          → 'CCS2'
// 2  = CHAdeMO               → 'CHAdeMO'
// 1  = Type 1 (J1772)        → 'Type1'
// 30 = Tesla Supercharger     → 'TeslaNCAS'
// 13 = Schuko                → 'SchukoSocket'

// OCM Status Type IDs:
// 50 = Operational
// 0  = Unknown
// 30 = Temporarily Unavailable
// 100 = Not Operational

// OCM Operator IDs for Greece (κοίτα responses):
// Αντιστοίχισε operator.Title → GreekNetwork
```

---

## Task 1.7: Data Merge & Deduplication

**Εντολή στο Claude Code:**
```
Δημιούργησε merge function που συνδυάζει ΜΥΦΑΗ + OCM δεδομένα.
Αποφυγή διπλοεγγραφών: αν δύο σταθμοί είναι σε απόσταση <50m
και έχουν ίδιο operator, κράτα αυτόν με τα πιο πρόσφατα δεδομένα.
Προτεραιότητα: ΜΥΦΑΗ > OCM (πιο αξιόπιστα τα επίσημα δεδομένα).
```

**src/lib/api/merge.ts:**
```typescript
// Deduplication logic:
// 1. Φέρε δεδομένα από ΜΥΦΑΗ
// 2. Φέρε δεδομένα από OCM
// 3. Για κάθε OCM σταθμό, ψάξε αν υπάρχει ΜΥΦΑΗ σταθμός
//    σε ακτίνα 50m (haversine distance)
//    ΚΑΙ ίδιο operator name (fuzzy match)
// 4. Αν βρεθεί duplicate: κράτα ΜΥΦΑΗ, εμπλούτισε με OCM data
//    (π.χ. τιμές, φωτογραφίες, σχόλια)
// 5. Αν δεν βρεθεί: πρόσθεσε ως νέο σταθμό

function haversineDistance(lat1: number, lng1: number,
                           lat2: number, lng2: number): number {
  // Returns distance in meters
  // Implement haversine formula
}
```

---

## Task 1.8: Markers & Clustering

**Εντολή στο Claude Code:**
```
Πρόσθεσε markers στο χάρτη για κάθε σταθμό φόρτισης.
Color coding:
- Πράσινο (#22C55E): AC ≤22kW
- Πορτοκαλί (#F97316): DC 23-99kW
- Κόκκινο (#EF4444): DC ≥100kW (ultrarapid)
- Γκρι (#9CA3AF): εκτός λειτουργίας

Χρησιμοποίησε MapLibre GeoJSON source + circle layer.
Πρόσθεσε clustering: σε zoom <12 ομαδοποίησε κοντινούς σταθμούς.
Οι clusters δείχνουν αριθμό (π.χ. "23" σε κύκλο).
Click σε cluster → zoom in.
Click σε marker → εμφάνιση popup/bottom sheet.
```

**Marker rendering approach (MapLibre native — γρήγορο):**
```typescript
// Χρησιμοποίησε GeoJSON source + layers — ΟΧΙ HTML markers (αργά)
map.addSource('chargers', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,
  clusterMaxZoom: 12,
  clusterRadius: 50
});

// Layer: clusters
map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'chargers',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#1B7B4E',
    'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40]
  }
});

// Layer: individual points — color by power category
map.addLayer({
  id: 'charger-points',
  type: 'circle',
  source: 'chargers',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match', ['get', 'powerCategory'],
      'slow', '#9CA3AF',
      'fast', '#22C55E',
      'rapid', '#F97316',
      'ultrarapid', '#EF4444',
      '#22C55E'  // default
    ],
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
});
```

---

## Task 1.9: Station Detail Card (Bottom Sheet)

**Εντολή στο Claude Code:**
```
Δημιούργησε BottomSheet component που εμφανίζεται όταν πατάς
ένα σταθμό. Mobile-first σχεδιασμός (swipe up/down).
Περιέχει:
- Όνομα σταθμού + operator
- Απόσταση από τον χρήστη (αν έχει δώσει location)
- Κατάσταση (λειτουργεί / εκτός λειτουργίας)
- Λίστα connectors με εικονίδια τύπου + ισχύς kW
- Αν ο χρήστης έχει επιλέξει όχημα: ✅ Compatible / ❌ Incompatible
- Εκτίμηση χρόνου φόρτισης (10%→80% βάσει kW + μπαταρία οχήματος)
- Κουμπί "Πλοήγηση" → ανοίγει Google Maps directions
- Κουμπί "Κοινοποίηση" → Web Share API
- Badge "ΔΩΡΕΑΝ" αν isFreeCharging
```

**Εκτίμηση χρόνου φόρτισης (απλοποιημένη):**
```typescript
function estimateChargingTime(
  batteryKwh: number,     // Χωρητικότητα μπαταρίας (π.χ. 60)
  chargerKw: number,      // Ισχύς φορτιστή (π.χ. 50)
  fromPercent: number,     // Αρχικό % (π.χ. 10)
  toPercent: number        // Τελικό % (π.χ. 80)
): number {
  // Απλοποιημένος υπολογισμός
  // Πραγματικά η καμπύλη φόρτισης δεν είναι γραμμική
  // αλλά για MVP αρκεί:
  const energyNeeded = batteryKwh * (toPercent - fromPercent) / 100;
  const effectiveKw = Math.min(chargerKw, /* vehicle maxKw */);
  const hours = energyNeeded / (effectiveKw * 0.9); // 90% efficiency
  return Math.round(hours * 60); // σε λεπτά
}
```

---

## Task 1.10: Filter Panel

**Εντολή στο Claude Code:**
```
Δημιούργησε FilterPanel component — slide-in panel από αριστερά
ή bottom sheet σε mobile.
Φίλτρα (chips/toggles):
1. Connector Type: Type 2, CCS2, CHAdeMO (multi-select chips)
2. Power: Αργή (<7kW), Κανονική (7-22kW), Ταχεία (23-99kW), Ultra (100kW+)
3. Network: Multi-select dropdown με τα ελληνικά δίκτυα
4. Toggle: Μόνο δωρεάν / Μόνο 24ωρο / Μόνο διαθέσιμα
5. Αν υπάρχει vehicle profile: "Μόνο συμβατοί" toggle
Τα φίλτρα εφαρμόζονται real-time στο χάρτη.
```

---

## Task 1.11: Vehicle Selector & Profile Database

**Εντολή στο Claude Code:**
```
Δημιούργησε VehicleSelector component + vehicles database.
Searchable dropdown: "Επιλέξτε το όχημά σας"
Αρχικά βάλε τα 30 πιο δημοφιλή EV στην Ελλάδα.
Αποθήκευση επιλογής σε localStorage.
Όταν επιλεγεί όχημα, τα φίλτρα αυτόματα κρύβουν
incompatible connectors.
```

**src/lib/vehicles.ts — Top 30 EV στην Ελλάδα:**
```typescript
export const vehicleDatabase: VehicleProfile[] = [
  { id: 'tesla-model3-lr', make: 'Tesla', model: 'Model 3 Long Range',
    batteryKwh: 75, maxAcKw: 11, maxDcKw: 250,
    compatibleConnectors: ['CCS2', 'Type2'], rangeKm: 602 },
  { id: 'tesla-modely-lr', make: 'Tesla', model: 'Model Y Long Range',
    batteryKwh: 75, maxAcKw: 11, maxDcKw: 250,
    compatibleConnectors: ['CCS2', 'Type2'], rangeKm: 533 },
  { id: 'vw-id4-pro', make: 'Volkswagen', model: 'ID.4 Pro',
    batteryKwh: 77, maxAcKw: 11, maxDcKw: 135,
    compatibleConnectors: ['CCS2', 'Type2'], rangeKm: 520 },
  { id: 'hyundai-ioniq5-lr', make: 'Hyundai', model: 'IONIQ 5 Long Range',
    batteryKwh: 77.4, maxAcKw: 11, maxDcKw: 233,
    compatibleConnectors: ['CCS2', 'Type2'], rangeKm: 507 },
  { id: 'byd-atto3', make: 'BYD', model: 'ATTO 3',
    batteryKwh: 60.48, maxAcKw: 7, maxDcKw: 88,
    compatibleConnectors: ['CCS2', 'Type2'], rangeKm: 420 },
  // ... Πρόσθεσε ακόμα 25 δημοφιλή μοντέλα
  // (MG4, Kia EV6, Peugeot e-208, Renault Megane E-Tech,
  //  BMW iX1, Mercedes EQA, Volvo EX30, Skoda Enyaq,
  //  Fiat 500e, Opel Corsa-e, Citroen e-C4, Nissan Leaf,
  //  Dacia Spring, Smart #1, Cupra Born, Audi Q4 e-tron,
  //  Porsche Taycan, BMW i4, Mercedes EQB, Toyota bZ4X,
  //  Lexus UX300e, Mini Electric, MG5, Polestar 2,
  //  Jeep Avenger EV)
];
```

---

## Task 1.12: Search Bar + Geocoding

**Εντολή στο Claude Code:**
```
Πρόσθεσε SearchBar component στο πάνω μέρος.
Χρησιμοποίησε Nominatim geocoding (δωρεάν OpenStreetMap):
https://nominatim.openstreetmap.org/search?q=...&format=json&countrycodes=gr
Debounce input (300ms).
Αποτελέσματα: dropdown λίστα τοποθεσιών.
Επιλογή τοποθεσίας → fly-to εκείνο το σημείο στο χάρτη.
Σεβάσου rate limit: max 1 request/second, User-Agent header.
```

---

## Task 1.13: i18n — Ελληνικά + Αγγλικά

**Εντολή στο Claude Code:**
```
Πρόσθεσε i18n με next-intl ή απλό context-based approach.
Default: Ελληνικά. Toggle button: 🇬🇷/🇬🇧
Μετάφρασε ΟΛΟ το UI: κουμπιά, φίλτρα, labels, μηνύματα.
Αποθήκευση γλώσσας σε localStorage.
```

**public/locales/el.json (δομή):**
```json
{
  "app": { "name": "ChargeGR", "tagline": "Βρες σταθμό φόρτισης EV" },
  "map": { "findMe": "Η τοποθεσία μου", "loading": "Φόρτωση χάρτη..." },
  "filters": {
    "title": "Φίλτρα",
    "connector": "Τύπος βύσματος",
    "power": "Ισχύς",
    "network": "Δίκτυο",
    "freeOnly": "Μόνο δωρεάν",
    "24hOnly": "Μόνο 24ωρο",
    "compatibleOnly": "Μόνο συμβατοί"
  },
  "station": {
    "available": "Διαθέσιμος",
    "unavailable": "Εκτός λειτουργίας",
    "free": "ΔΩΡΕΑΝ",
    "navigate": "Πλοήγηση",
    "share": "Κοινοποίηση",
    "chargingTime": "Εκτιμώμενος χρόνος",
    "minutes": "λεπτά",
    "connectors": "Βύσματα"
  },
  "vehicle": {
    "select": "Επιλέξτε όχημα",
    "search": "Αναζήτηση μοντέλου...",
    "battery": "Μπαταρία",
    "range": "Αυτονομία"
  },
  "search": { "placeholder": "Αναζήτηση τοποθεσίας..." }
}
```

---

## Task 1.14: Zustand Store

**Εντολή στο Claude Code:**
```
Δημιούργησε Zustand store στο src/store/appStore.ts
που διαχειρίζεται:
- stations[]: ChargingStation[]
- filteredStations[]: τα φιλτραρισμένα
- filters: FilterState
- selectedStation: ChargingStation | null
- selectedVehicle: VehicleProfile | null
- isLoading: boolean
- language: 'el' | 'en'
- mapCenter / mapZoom

Actions: setFilters, selectStation, selectVehicle,
         fetchStations, applyFilters
```

---

## Task 1.15: UI Polish & Responsive Design

**Εντολή στο Claude Code:**
```
Κάνε τελικό polish:
1. Mobile-first: bottom sheet, touch-friendly buttons (min 44px)
2. Desktop: sidebar αντί bottom sheet
3. Loading states: skeleton screen κατά τη φόρτωση δεδομένων
4. Error states: "Δεν βρέθηκαν σταθμοί" / "Σφάλμα δικτύου"
5. Legend: μικρό legend κάτω-δεξιά με color coding
6. Splash screen: λογότυπο ChargeGR κατά την αρχική φόρτωση
7. Dark mode support (follows system preference)
8. Meta tags: OG tags, description, favicon
```

---

## Task 1.16: Build & Deploy στο Plesk

**Εντολή στο Claude Code:**
```
Δημιούργησε deployment script:
1. npm run build → δημιουργεί /out folder
2. Δώσε οδηγίες πώς να ανεβάσω τα αρχεία στο Plesk
   ως static site στο subdomain chargegr.viralev.gr
```

**Deploy στο Plesk:**
```bash
# 1. Build
npm run build

# 2. Ανέβασε τα περιεχόμενα του /out στο Plesk:
# - Δημιούργησε subdomain chargegr.viralev.gr στο Plesk
# - Ανέβασε μέσω FTP/SSH τα αρχεία /out/* στο document root
# - Ή χρησιμοποίησε rsync:
rsync -avz ./out/ user@server:/var/www/chargegr.viralev.gr/

# 3. SSL: ενεργοποίησε Let's Encrypt στο Plesk για το subdomain
# (απαραίτητο για PWA + geolocation)

# 4. CORS proxy (αν χρειάζεται):
# Πρόσθεσε .htaccess ή nginx rule για proxy
# στα API endpoints που έχουν CORS θέματα
```

---

## Checklist τελικής δοκιμής Phase 1

- [ ] Ο χάρτης φορτώνει σε <3 δεύτερα
- [ ] Βλέπω 1000+ σταθμούς στην Ελλάδα
- [ ] Clustering δουλεύει (zoom out = clusters, zoom in = markers)
- [ ] Geolocation: βρίσκει τη θέση μου
- [ ] Φίλτρα: κρύβουν/δείχνουν σωστά τους σταθμούς
- [ ] Vehicle selection: κρύβει incompatible connectors
- [ ] Station detail: δείχνει σωστές πληροφορίες
- [ ] Εκτίμηση χρόνου φόρτισης λειτουργεί
- [ ] Κουμπί πλοήγησης ανοίγει Google Maps
- [ ] EL/EN toggle δουλεύει
- [ ] Mobile: responsive, touch-friendly
- [ ] Desktop: sidebar layout
- [ ] PWA install prompt εμφανίζεται
- [ ] Offline: δείχνει cached δεδομένα
- [ ] Lighthouse PWA score ≥80
- [ ] Lighthouse Performance score ≥70
