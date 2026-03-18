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
