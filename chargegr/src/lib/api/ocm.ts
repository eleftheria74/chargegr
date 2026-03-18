import type { ChargingStation, Connector, ConnectorType, GreekNetwork } from '../types';
import { CACHE_DURATION_MS, getPowerCategory } from '../constants';
import { getCachedData, setCachedData } from '../utils';

const OCM_BASE = 'https://api.openchargemap.io/v3/poi/';
const CACHE_KEY = 'ocm_stations';

// Free API key — register at https://openchargemap.org/site/develop/api
// Set via environment variable or replace this placeholder
const OCM_API_KEY = process.env.NEXT_PUBLIC_OCM_API_KEY || '';

// === OCM Connection Type ID → ConnectorType ===
const OCM_CONNECTOR_MAP: Record<number, ConnectorType> = {
  25: 'Type2',          // Type 2 (Mennekes)
  1036: 'Type2',        // Type 2 (Socket Only)
  33: 'CCS2',           // CCS (Type 2)
  2: 'CHAdeMO',         // CHAdeMO
  1: 'Type1',           // Type 1 (J1772)
  30: 'TeslaNCAS',      // Tesla Supercharger
  27: 'TeslaNCAS',      // Tesla (Model S/X)
  13: 'SchukoSocket',   // Europlug / Schuko (CEE 7/4)
  28: 'SchukoSocket',   // Schuko (CEE 7/4)
  0: 'Other',           // Unknown
};

// === OCM Status Type ID → operational boolean ===
const OPERATIONAL_STATUS_IDS = new Set([50, 75]); // 50=Operational, 75=Partly Operational

// === OCM Operator Title → GreekNetwork ===
const OCM_OPERATOR_MAP: Record<string, GreekNetwork> = {
  'DEI Blue': 'DEI Blue',
  'ΔΕΗ blue': 'DEI Blue',
  'NRG': 'NRG incharge',
  'NRG incharge': 'NRG incharge',
  'Protergia': 'Protergia Charge',
  'Protergia Charge': 'Protergia Charge',
  'Fortizo': 'Fortizo',
  'ElpeFuture': 'ElpeFuture',
  'Blink': 'Blink',
  'Blink Charging': 'Blink',
  'EV Loader': 'EV Loader',
  'PlugQ': 'PlugQ',
  'Joltie Way': 'Joltie Way',
  'EVziiin': 'EVziiin',
  'EcoCharge': 'EcoCharge',
  'Electrip': 'Electrip',
  'eVplus': 'eVplus',
  'Joule jCharge': 'Joule jCharge',
  'Tesla Supercharger': 'Tesla Supercharger',
  'Tesla': 'Tesla Supercharger',
  'Lidl': 'Lidl',
};

// === OCM API response types ===

interface OcmPoi {
  ID: number;
  UUID: string;
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    CountryID: number;
    Latitude: number;
    Longitude: number;
    Distance?: number;
    DistanceUnit?: number;
  };
  OperatorInfo?: {
    ID: number;
    Title: string;
  };
  UsageCost?: string;
  StatusTypeID?: number;
  StatusType?: {
    ID: number;
    Title: string;
    IsOperational: boolean;
  };
  DateLastStatusUpdate?: string;
  Connections: OcmConnection[];
  NumberOfPoints?: number;
  IsRecentlyVerified?: boolean;
  DateLastVerified?: string;
  UsageTypeID?: number;
}

interface OcmConnection {
  ID: number;
  ConnectionTypeID: number;
  ConnectionType?: {
    ID: number;
    Title: string;
  };
  StatusTypeID?: number;
  LevelID?: number;
  PowerKW?: number;
  CurrentTypeID?: number;
  Quantity?: number;
}

// === Conversion helpers ===

function mapOcmConnectorType(connectionTypeId: number): ConnectorType {
  return OCM_CONNECTOR_MAP[connectionTypeId] || 'Other';
}

function mapOcmCurrentType(currentTypeId?: number): 'AC' | 'DC' {
  // OCM CurrentType: 10=AC (Single Phase), 20=AC (Three Phase), 30=DC
  return currentTypeId === 30 ? 'DC' : 'AC';
}

function mapOcmOperator(operatorTitle?: string): GreekNetwork {
  if (!operatorTitle) return 'Unknown';
  // Try exact match first
  if (OCM_OPERATOR_MAP[operatorTitle]) return OCM_OPERATOR_MAP[operatorTitle];
  // Try partial match
  for (const [key, network] of Object.entries(OCM_OPERATOR_MAP)) {
    if (operatorTitle.toLowerCase().includes(key.toLowerCase())) {
      return network;
    }
  }
  return 'Unknown';
}

function ocmPoiToStation(poi: OcmPoi): ChargingStation {
  const connectors: Connector[] = (poi.Connections || []).map(conn => ({
    type: mapOcmConnectorType(conn.ConnectionTypeID),
    powerKw: conn.PowerKW || 0,
    quantity: conn.Quantity || 1,
    currentType: mapOcmCurrentType(conn.CurrentTypeID),
  }));

  const maxPowerKw = connectors.length > 0
    ? Math.max(...connectors.map(c => c.powerKw))
    : 0;

  const isOperational = poi.StatusTypeID
    ? OPERATIONAL_STATUS_IDS.has(poi.StatusTypeID)
    : (poi.StatusType?.IsOperational ?? true);

  // UsageCost: check if free
  const isFreeCharging = poi.UsageCost
    ? /free|δωρεάν|gratis/i.test(poi.UsageCost)
    : (poi.UsageTypeID === 4); // 4 = Free

  return {
    id: `ocm-${poi.ID}`,
    source: 'ocm',
    name: poi.AddressInfo?.Title || 'Charging Station',
    operator: mapOcmOperator(poi.OperatorInfo?.Title),
    address: poi.AddressInfo?.AddressLine1 || '',
    city: poi.AddressInfo?.Town || '',
    lat: poi.AddressInfo?.Latitude,
    lng: poi.AddressInfo?.Longitude,
    connectors,
    isOperational,
    isFreeCharging,
    is24h: false, // OCM doesn't reliably expose 24h info
    maxPowerKw,
    powerCategory: getPowerCategory(maxPowerKw),
    lastUpdated: poi.DateLastStatusUpdate || poi.DateLastVerified || new Date().toISOString(),
  };
}

// === Public API ===

/**
 * Fetch all Greek EV stations from OpenChargeMap.
 * Requires a free API key set via NEXT_PUBLIC_OCM_API_KEY env var.
 * Uses localStorage cache (6 hours).
 */
export async function fetchOcmStations(): Promise<ChargingStation[]> {
  // If no API key configured, skip OCM
  if (!OCM_API_KEY) {
    console.warn('OCM API key not configured — skipping OpenChargeMap data');
    return [];
  }

  // Check cache
  const cached = getCachedData<ChargingStation[]>(CACHE_KEY, CACHE_DURATION_MS);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      key: OCM_API_KEY,
      output: 'json',
      countrycode: 'GR',
      maxresults: '5000',
      compact: 'true',
      verbose: 'false',
    });

    const resp = await fetch(`${OCM_BASE}?${params}`);

    if (!resp.ok) {
      throw new Error(`OCM API HTTP ${resp.status}`);
    }

    const data: OcmPoi[] = await resp.json();

    const stations = data
      .filter(poi => poi.AddressInfo?.Latitude && poi.AddressInfo?.Longitude)
      .map(ocmPoiToStation);

    setCachedData(CACHE_KEY, stations);
    return stations;
  } catch (err) {
    console.error('Failed to fetch OCM stations:', err);
    return fetchOcmStatic();
  }
}

/**
 * Fallback: load stations from static JSON file.
 */
async function fetchOcmStatic(): Promise<ChargingStation[]> {
  try {
    const resp = await fetch('/data/ocm-stations.json');
    if (!resp.ok) return [];
    return resp.json();
  } catch {
    return [];
  }
}
