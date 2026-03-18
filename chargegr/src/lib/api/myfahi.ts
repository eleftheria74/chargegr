import type { ChargingStation, Connector, ConnectorType, GreekNetwork } from '../types';
import {
  MYFAHI_LOCATIONS_URL,
  MYFAHI_LOCATION_DETAIL_URL,
  MYFAHI_TOKEN_PAGE_URL,
  CACHE_DURATION_MS,
  OCPI_CONNECTOR_MAP,
  PROVIDER_NETWORK_MAP,
  getPowerCategory,
} from '../constants';
import { getCachedData, setCachedData } from '../utils';

const CACHE_KEY_STATIONS = 'myfahi_stations';
const CACHE_KEY_TOKEN = 'myfahi_token';
// Token is refreshed more often — it may expire
const TOKEN_CACHE_MS = 2 * 60 * 60 * 1000; // 2 hours

// === ΜΥΦΑΗ API response types ===

interface MyfahiFeature {
  geometry: {
    type: string;
    coordinates: [number, number]; // [lat, lng] — NOTE: ΜΥΦΑΗ returns lat,lng (swapped!)
  };
  type: string;
  properties: {
    location_id: string;
    isActive: number;
    LocationLastUpdatedUTC: string;
    DateTimeStatus: string;
    LocationName: string;
    Provider: string;
    Logo: string;
  };
}

interface MyfahiLocationsResponse {
  type: string;
  status: string;
  statusDesc?: string;
  features: MyfahiFeature[];
}

interface MyfahiLocationDetail {
  Loc: {
    country_code: string;
    party_id: string;
    id: string;
    name: string;
    address: string;
    city: string;
    postal_code: string;
    coordinates: { latitude: string; longitude: string };
    parking_type: string;
    evses: MyfahiEvse[];
    opening_times?: { twentyfourseven?: boolean };
    last_updated?: string;
  };
}

interface MyfahiEvse {
  uid: string;
  evse_id: string;
  status: string;
  connectors: MyfahiConnector[];
  last_updated: string;
}

interface MyfahiConnector {
  id: string;
  standard: string;
  format: string;
  power_type: string;
  max_voltage: number;
  max_amperage: number;
  max_electric_power: number;
  last_updated: string;
}

// === Token fetching ===
// The ΜΥΦΑΗ API requires a token embedded in the public page HTML.

async function fetchToken(): Promise<string> {
  // Check cache first
  const cached = getCachedData<string>(CACHE_KEY_TOKEN, TOKEN_CACHE_MS);
  if (cached) return cached;

  try {
    const resp = await fetch(MYFAHI_TOKEN_PAGE_URL);
    const html = await resp.text();
    const match = html.match(/id="token"[^>]*value="([^"]+)"/);
    if (!match) throw new Error('Token not found in ΜΥΦΑΗ page');
    const token = match[1];
    setCachedData(CACHE_KEY_TOKEN, token);
    return token;
  } catch (err) {
    console.error('Failed to fetch ΜΥΦΑΗ token:', err);
    throw err;
  }
}

// === Map OCPI connector standard to our ConnectorType ===

function mapConnectorType(standard: string): ConnectorType {
  return OCPI_CONNECTOR_MAP[standard] || 'Other';
}

function mapCurrentType(powerType: string): 'AC' | 'DC' {
  return powerType.startsWith('DC') ? 'DC' : 'AC';
}

function mapProvider(providerName: string): GreekNetwork {
  return PROVIDER_NETWORK_MAP[providerName] || 'Unknown';
}

// === Convert ΜΥΦΑΗ basic feature to ChargingStation (without connector details) ===

function featureToBasicStation(feature: MyfahiFeature): ChargingStation {
  const props = feature.properties;
  // ΜΥΦΑΗ returns coordinates as [lat, lng] — we need lat, lng separately
  const lat = feature.geometry.coordinates[0];
  const lng = feature.geometry.coordinates[1];

  return {
    id: `myfahi-${props.location_id}`,
    source: 'myfahi',
    name: props.LocationName || 'Σταθμός Φόρτισης',
    operator: mapProvider(props.Provider) as string,
    address: '',
    city: '',
    lat,
    lng,
    connectors: [],
    isOperational: props.isActive === 1,
    isFreeCharging: false,
    is24h: false,
    maxPowerKw: 0,
    powerCategory: 'fast', // Default — will be updated when detail is fetched
    lastUpdated: props.LocationLastUpdatedUTC || new Date().toISOString(),
  };
}

// === Convert ΜΥΦΑΗ detail response to full ChargingStation ===

function detailToStation(detail: MyfahiLocationDetail, basicStation: ChargingStation): ChargingStation {
  const loc = detail.Loc;

  // Aggregate connectors from all EVSEs
  const connectorMap = new Map<string, Connector>();

  for (const evse of loc.evses || []) {
    for (const conn of evse.connectors || []) {
      const type = mapConnectorType(conn.standard);
      const powerKw = conn.max_electric_power / 1000;
      const key = `${type}-${powerKw}`;

      if (connectorMap.has(key)) {
        connectorMap.get(key)!.quantity += 1;
      } else {
        connectorMap.set(key, {
          type,
          powerKw,
          quantity: 1,
          currentType: mapCurrentType(conn.power_type),
        });
      }
    }
  }

  const connectors = Array.from(connectorMap.values());
  const maxPowerKw = connectors.length > 0
    ? Math.max(...connectors.map(c => c.powerKw))
    : 0;

  // Check if any EVSE is operational
  const hasOperational = (loc.evses || []).some(
    e => e.status === 'AVAILABLE' || e.status === 'CHARGING' || e.status === 'RESERVED'
  );

  return {
    ...basicStation,
    name: loc.name || basicStation.name,
    address: loc.address || '',
    city: loc.city || '',
    lat: parseFloat(loc.coordinates.latitude) || basicStation.lat,
    lng: parseFloat(loc.coordinates.longitude) || basicStation.lng,
    connectors,
    isOperational: hasOperational,
    is24h: loc.opening_times?.twentyfourseven ?? false,
    maxPowerKw,
    powerCategory: getPowerCategory(maxPowerKw),
    lastUpdated: loc.last_updated || basicStation.lastUpdated,
  };
}

// === Public API ===

/**
 * Fetch all ΜΥΦΑΗ stations (basic info: location, name, provider, active status).
 * Uses localStorage cache (6 hours).
 */
export async function fetchMyfahiStations(): Promise<ChargingStation[]> {
  // Check cache
  const cached = getCachedData<ChargingStation[]>(CACHE_KEY_STATIONS, CACHE_DURATION_MS);
  if (cached) return cached;

  try {
    const token = await fetchToken();

    const resp = await fetch(MYFAHI_LOCATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, PartyIds: null }),
    });

    const data: MyfahiLocationsResponse = await resp.json();

    if (data.status !== 'ok' || !data.features) {
      throw new Error(`ΜΥΦΑΗ API error: ${data.statusDesc || data.status}`);
    }

    const stations = data.features
      .filter(f => f.geometry?.coordinates?.length === 2)
      .map(featureToBasicStation);

    setCachedData(CACHE_KEY_STATIONS, stations);
    return stations;
  } catch (err) {
    console.error('Failed to fetch ΜΥΦΑΗ stations:', err);
    // Fallback: try to load from static JSON
    return fetchMyfahiStatic();
  }
}

/**
 * Fetch detail for a specific station (connectors, opening times, etc.).
 * Called on-demand when user clicks a station marker.
 */
export async function fetchMyfahiStationDetail(station: ChargingStation): Promise<ChargingStation> {
  // Extract the original ΜΥΦΑΗ location_id from our ID
  const locationId = station.id.replace('myfahi-', '');

  try {
    const token = await fetchToken();

    const resp = await fetch(MYFAHI_LOCATION_DETAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, location_id: locationId }),
    });

    const data: MyfahiLocationDetail = await resp.json();

    if (!data.Loc) {
      throw new Error('No location data in response');
    }

    return detailToStation(data, station);
  } catch (err) {
    console.error(`Failed to fetch detail for ${station.id}:`, err);
    return station; // Return basic data on failure
  }
}

/**
 * Fallback: load stations from static JSON file.
 */
async function fetchMyfahiStatic(): Promise<ChargingStation[]> {
  try {
    const resp = await fetch('/data/myfahi-stations.json');
    if (!resp.ok) return [];
    const stations: ChargingStation[] = await resp.json();
    return stations;
  } catch {
    return [];
  }
}
