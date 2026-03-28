#!/usr/bin/env node

/**
 * Standalone station data refresh script.
 * Designed to run on the Contabo server via cron/n8n without dev dependencies.
 *
 * Usage:  node refresh-stations.js
 * Output: public/data/stations.json (relative to script location)
 *
 * Environment variables (optional):
 *   OUTPUT_PATH — override output path
 *   CACHE_PATH  — override cache path
 */

const fs = require('fs');
const path = require('path');

// === Configuration ===
const SCRIPT_DIR = __dirname;
const PROJECT_DIR = path.join(SCRIPT_DIR, '..');
const OUTPUT_PATH = process.env.OUTPUT_PATH || path.join(PROJECT_DIR, 'public', 'data', 'stations.json');
const CACHE_PATH = process.env.CACHE_PATH || path.join(SCRIPT_DIR, '.detail-cache.json');

const MYFAHI_BASE = 'https://electrokinisi.yme.gov.gr';
const MYFAHI_LOCATIONS_URL = `${MYFAHI_BASE}/myfah-api/openApi/GetPLocations`;
const MYFAHI_DETAIL_URL = `${MYFAHI_BASE}/myfah-api/openApi/GetLocation`;
const MYFAHI_TOKEN_PAGE = `${MYFAHI_BASE}/public/ChargingPoints/`;

const OCM_BASE = 'https://api.openchargemap.io/v3/poi/';
const OCM_API_KEY = 'a067d34c-0441-42db-9e48-8e5728d01afb';

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 200;
const MATCH_DISTANCE_M = 50;

// === Provider / network maps ===
const PROVIDER_NETWORK_MAP = {
  'ΔΕΗ blue': 'DEI Blue',
  'NRG SUPPLY AND TRADING ΜΟΝΟΠΡΟΣΩΠΗ ΕΝΕΡΓΕΙΑΚΗ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ': 'NRG incharge',
  'ElpeFuture': 'ElpeFuture',
  'BLINK CHARGING HELLAS MAE': 'Blink',
  'ΦΟΡΤΙΖΩ Μονοπρόσωπη ΙΚΕ': 'Fortizo',
  'ΗΡΩΝ ΜΟΝΟΠΡΟΣΩΠΗ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ ΕΝΕΡΓΕΙΑΚΩΝ ΥΠΗΡΕΣΙΩΝ': 'Protergia Charge',
  'JOLTIE  HELLAS  Μ Α Ε': 'Joltie Way',
  'JOULE ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ': 'Joule jCharge',
  'ELECTRIP HELLAS': 'Electrip',
  'Λίντλ Ελλάς και Σία Ομόρρυθμη εταιρία': 'Lidl',
  'Parity Platform ΙΚΕ': 'EVziiin',
  'ΓΡΕΦΙΛ ΗΛΕΚΤΡΟΚΙΝΗΣΗ': 'EV Loader',
  'ACROVOLT IKE': 'PlugQ',
  'TOTALENERGIES MARKETING HELLAS ΜΟΝΟΠΡΟΣΩΠΗ Α Ε': 'eVplus',
  'ΟΤΟ ΑΝΩΝΥΜΗΕΤΑΙΡΕΙΑ ΠΑΡΟΧΗΣ ΥΠΗΡΕΣΙΩΝ ΒΙΩΣΙΜΗΣ ΑΣΤΙΚΗΣ ΚΙΝΗΤΙΚΟΤΗΤΑΣ ΚΑΙ ΕΜΠΟΡΙΑΣ ΚΑΤΑΝΑΛΩΤΙΚΩΝ ΑΓΑΘΩΝ': 'EcoCharge',
  'ΕΤΑΙΡΕΙΑ ΠΑΡΟΧΗΣ ΑΕΡΙΟΥ ΑΤΤΙΚΗΣ ΕΛΛΗΝΙΚΗ ΜΟΝΟΠΡΟΣΩΠΗ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ ΕΝΕΡΓΕΙΑΣ': 'Protergia Charge',
  'ENERES HELLAS CPM ΙΚΕ': 'Unknown',
  'FUTURE ENTERPRISE SOLUTIONS TODAY ΙΔΙΩΤΙΚΗ ΚΕΦΑΛΑΙΟΥΧΙΚΗ ΕΤΑΙΡΕΙΑ': 'Unknown',
  'ΓΕΩΡΓΑΚΑΡΑΚΟΣ ΚΩΝΣΤΑΝΤΙΝΟΣ': 'Unknown',
};

const OCM_OPERATOR_MAP = {
  'DEI Blue': 'DEI Blue', 'ΔΕΗ blue': 'DEI Blue',
  'NRG': 'NRG incharge', 'NRG incharge': 'NRG incharge', 'NRGincharge': 'NRG incharge',
  'Protergia': 'Protergia Charge', 'Protergia Charge': 'Protergia Charge',
  'Fortizo': 'Fortizo', 'ElpeFuture': 'ElpeFuture',
  'Blink': 'Blink', 'Blink Charging': 'Blink',
  'EV Loader': 'EV Loader', 'PlugQ': 'PlugQ',
  'Joltie Way': 'Joltie Way', 'EVziiin': 'EVziiin',
  'EcoCharge': 'EcoCharge', 'Electrip': 'Electrip',
  'eVplus': 'eVplus', 'Joule jCharge': 'Joule jCharge',
  'Tesla Supercharger': 'Tesla Supercharger', 'Tesla': 'Tesla Supercharger',
  'Lidl': 'Lidl',
};

const OCM_CONNECTOR_MAP = {
  25: 'Type2', 1036: 'Type2', 33: 'CCS2', 2: 'CHAdeMO',
  1: 'Type1', 30: 'TeslaNCAS', 27: 'TeslaNCAS',
  13: 'SchukoSocket', 28: 'SchukoSocket',
};

const OCPI_CONNECTOR_MAP = {
  'IEC_62196_T2': 'Type2', 'IEC_62196_T2_COMBO': 'CCS2',
  'CHADEMO': 'CHAdeMO', 'IEC_62196_T1': 'Type1',
  'IEC_62196_T1_COMBO': 'CCS2', 'DOMESTIC_F': 'SchukoSocket',
  'TESLA_S': 'TeslaNCAS', 'TESLA_R': 'TeslaNCAS',
};

const NETWORK_CONNECTOR_DEFAULTS = {
  'DEI Blue':          [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'NRG incharge':      [{ type: 'CCS2', powerKw: 150, quantity: 2, currentType: 'DC' }],
  'ElpeFuture':        [{ type: 'CCS2', powerKw: 50, quantity: 1, currentType: 'DC' }, { type: 'Type2', powerKw: 22, quantity: 1, currentType: 'AC' }],
  'Blink':             [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'Fortizo':           [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'Protergia Charge':  [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'Joltie Way':        [{ type: 'CCS2', powerKw: 60, quantity: 1, currentType: 'DC' }, { type: 'Type2', powerKw: 22, quantity: 1, currentType: 'AC' }],
  'Joule jCharge':     [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'Electrip':          [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'Lidl':              [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'EVziiin':           [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'EV Loader':         [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'PlugQ':             [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'eVplus':            [{ type: 'CCS2', powerKw: 50, quantity: 1, currentType: 'DC' }, { type: 'Type2', powerKw: 22, quantity: 1, currentType: 'AC' }],
  'EcoCharge':         [{ type: 'Type2', powerKw: 22, quantity: 2, currentType: 'AC' }],
  'Tesla Supercharger':[{ type: 'TeslaNCAS', powerKw: 250, quantity: 4, currentType: 'DC' }],
  'Unknown':           [{ type: 'Type2', powerKw: 22, quantity: 1, currentType: 'AC' }],
};

// === Helpers ===

function normalizePowerKw(rawKw) {
  const standardPowers = [3.7, 7.4, 11, 22, 43, 24, 50, 60, 75, 100, 120, 150, 175, 200, 250, 300, 350];
  for (const standard of standardPowers) {
    if (Math.abs(rawKw - standard) / standard < 0.05) return standard;
  }
  return Math.round(rawKw * 10) / 10;
}

function getPowerCategory(kw) {
  if (kw <= 7.4) return 'slow';
  if (kw <= 22) return 'fast';
  if (kw <= 99) return 'rapid';
  return 'ultrarapid';
}

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function featureCoordKey(f) {
  const [lat, lng] = f.geometry.coordinates;
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

// === Cache ===

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  } catch { /* ignore */ }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
}

// === ΜΥΦΑΗ fetch ===

async function fetchToken() {
  const resp = await fetch(MYFAHI_TOKEN_PAGE);
  const html = await resp.text();
  const match = html.match(/id="token"[^>]*value="([^"]+)"/);
  if (!match) throw new Error('Token not found in ΜΥΦΑΗ page');
  return match[1];
}

async function fetchLocations(token) {
  console.log('Fetching ΜΥΦΑΗ locations...');
  const resp = await fetch(MYFAHI_LOCATIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, PartyIds: null }),
  });
  const data = await resp.json();
  if (data.status !== 'ok' || !data.features) throw new Error(`ΜΥΦΑΗ API error: ${data.statusDesc || data.status}`);
  console.log(`  ${data.features.length} locations.`);
  return data.features;
}

async function fetchDetail(token, locationId) {
  const resp = await fetch(MYFAHI_DETAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, location_id: locationId }),
  });
  const data = await resp.json();
  if (data.status !== 'ok' || !data.Loc) return null;
  return data.Loc;
}

async function fetchDetailsWithCache(features) {
  const rawCache = loadCache();
  let migrated = 0;
  const cache = {};
  for (const [key, val] of Object.entries(rawCache)) {
    if (key.includes(',')) {
      cache[key] = val;
    } else if (val.coordinates?.latitude && val.coordinates?.longitude) {
      const ck = `${parseFloat(val.coordinates.latitude).toFixed(5)},${parseFloat(val.coordinates.longitude).toFixed(5)}`;
      if (!cache[ck]) { cache[ck] = val; migrated++; }
    }
  }
  if (migrated > 0) console.log(`  Migrated ${migrated} cache entries to coord keys.`);

  const uncached = features.filter(f => !cache[featureCoordKey(f)]);
  console.log(`  Cache: ${Object.keys(cache).length}. Uncached: ${uncached.length}`);
  if (uncached.length === 0) { saveCache(cache); return cache; }

  const token = await fetchToken();
  let fetched = 0;
  let consecutiveFails = 0;

  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(
      batch.map(f => fetchDetail(token, f.properties.location_id).catch(() => null))
    );
    for (let j = 0; j < batch.length; j++) {
      if (details[j]) { cache[featureCoordKey(batch[j])] = details[j]; fetched++; consecutiveFails = 0; }
      else { consecutiveFails++; }
    }
    process.stdout.write(`\r  ${Math.min(i + BATCH_SIZE, uncached.length)}/${uncached.length} (+${fetched} new)`);
    if (consecutiveFails >= 30) { console.log('\n  API throttled — saving cache. Run again to continue.'); break; }
    if (i + BATCH_SIZE < uncached.length) await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log('');
  saveCache(cache);
  console.log(`  Cache now: ${Object.keys(cache).length} entries.`);
  return cache;
}

// === OCM fetch ===

async function fetchOcmStations() {
  console.log('Fetching OCM stations...');
  const params = new URLSearchParams({
    key: OCM_API_KEY, output: 'json', countrycode: 'GR', maxresults: '10000',
  });
  const resp = await fetch(`${OCM_BASE}?${params}`);
  if (!resp.ok) { console.warn(`  OCM API HTTP ${resp.status} — skipping enrichment.`); return null; }
  const data = await resp.json();
  console.log(`  ${data.length} POIs from OCM.`);
  return data.filter(p => p.AddressInfo?.Latitude && p.AddressInfo?.Longitude);
}

// === Connectors ===

function parseConnectors(evses) {
  const map = new Map();
  for (const evse of evses || []) {
    for (const conn of evse.connectors || []) {
      const type = OCPI_CONNECTOR_MAP[conn.standard] || 'Other';
      const powerKw = conn.max_electric_power ? normalizePowerKw(conn.max_electric_power / 1000) : 0;
      const key = `${type}-${powerKw}`;
      if (map.has(key)) map.get(key).quantity += 1;
      else map.set(key, { type, powerKw, quantity: 1, currentType: conn.power_type?.startsWith('DC') ? 'DC' : 'AC' });
    }
  }
  return Array.from(map.values());
}

// === Converters ===

function convertMyfahi(feature, detail) {
  const props = feature.properties;
  const lat = feature.geometry.coordinates[0];
  const lng = feature.geometry.coordinates[1];
  const network = PROVIDER_NETWORK_MAP[props.Provider] || 'Unknown';

  let address = '', city = '', connectors, is24h = false;
  let isOperational = props.isActive !== 0;
  let name = (props.LocationName || 'Σταθμός Φόρτισης').trim();

  if (detail) {
    address = (detail.address || '').trim();
    city = (detail.city || '').trim();
    name = detail.name || name;
    is24h = detail.opening_times?.twentyfourseven === true;
    const parsed = parseConnectors(detail.evses);
    if (parsed.length > 0) connectors = parsed;
    if (detail.evses?.length > 0) {
      const NON_OPERATIONAL = ['INOPERATIVE', 'OUTOFORDER'];
      isOperational = !detail.evses.every(e => NON_OPERATIONAL.includes(e.status));
    }
  }

  if (!connectors || connectors.length === 0) {
    connectors = NETWORK_CONNECTOR_DEFAULTS[network] || NETWORK_CONNECTOR_DEFAULTS['Unknown'];
  }

  const maxPowerKw = Math.max(...connectors.map(c => c.powerKw));

  return {
    id: `myfahi-${props.location_id}`, source: 'myfahi',
    name, operator: network, address, city, lat, lng, connectors,
    isOperational, isFreeCharging: false, is24h, maxPowerKw,
    powerCategory: getPowerCategory(maxPowerKw),
    lastUpdated: props.LocationLastUpdatedUTC || new Date().toISOString(),
  };
}

function convertOcm(poi) {
  const addr = poi.AddressInfo || {};
  const connectors = (poi.Connections || []).map(conn => ({
    type: OCM_CONNECTOR_MAP[conn.ConnectionTypeID] || 'Other',
    powerKw: conn.PowerKW ? normalizePowerKw(conn.PowerKW) : 0,
    quantity: conn.Quantity || 1,
    currentType: conn.CurrentTypeID === 30 ? 'DC' : 'AC',
  }));
  const maxPowerKw = connectors.length > 0 ? Math.max(...connectors.map(c => c.powerKw)) : 0;
  const isOperational = poi.StatusTypeID ? (poi.StatusTypeID === 50 || poi.StatusTypeID === 75) : true;
  const isFreeCharging = poi.UsageCost ? /free|δωρεάν|gratis/i.test(poi.UsageCost) : (poi.UsageTypeID === 4);

  let operator = 'Unknown';
  const opTitle = poi.OperatorInfo?.Title;
  if (opTitle) {
    operator = OCM_OPERATOR_MAP[opTitle] || 'Unknown';
    if (operator === 'Unknown') {
      for (const [key, net] of Object.entries(OCM_OPERATOR_MAP)) {
        if (opTitle.toLowerCase().includes(key.toLowerCase())) { operator = net; break; }
      }
    }
  }

  return {
    id: `ocm-${poi.ID}`, source: 'ocm',
    name: (addr.Title || 'Charging Station').trim(), operator,
    address: (addr.AddressLine1 || addr.Title || '').trim(),
    city: (addr.Town || '').trim(),
    lat: addr.Latitude, lng: addr.Longitude,
    connectors, isOperational, isFreeCharging,
    is24h: false, maxPowerKw,
    powerCategory: getPowerCategory(maxPowerKw),
    lastUpdated: poi.DateLastStatusUpdate || poi.DateLastVerified || new Date().toISOString(),
  };
}

// === Merge ===

function mergeStations(myfahi, ocmPois) {
  const ocmData = ocmPois.map(poi => ({
    poi, lat: poi.AddressInfo.Latitude, lng: poi.AddressInfo.Longitude, matched: false,
  }));

  let enriched = 0;
  for (const station of myfahi) {
    let bestDist = Infinity, bestIdx = -1;
    for (let i = 0; i < ocmData.length; i++) {
      if (ocmData[i].matched) continue;
      const d = haversineM(station.lat, station.lng, ocmData[i].lat, ocmData[i].lng);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestDist < MATCH_DISTANCE_M) {
      const ocm = ocmData[bestIdx];
      ocm.matched = true;
      const addr = ocm.poi.AddressInfo;
      if (!station.address) station.address = (addr.AddressLine1 || addr.Title || '').trim();
      if (!station.city) station.city = (addr.Town || '').trim();
      if (station.operator === 'Unknown' && ocm.poi.OperatorInfo?.Title) {
        const mapped = OCM_OPERATOR_MAP[ocm.poi.OperatorInfo.Title];
        if (mapped) station.operator = mapped;
      }
      if (ocm.poi.UsageCost && /free|δωρεάν|gratis/i.test(ocm.poi.UsageCost)) station.isFreeCharging = true;
      enriched++;
    }
  }

  const ocmOnly = ocmData.filter(o => !o.matched).map(o => convertOcm(o.poi));
  console.log(`  OCM enrichment: ${enriched} ΜΥΦΑΗ enriched, ${ocmOnly.length} OCM-only added.`);
  return [...myfahi, ...ocmOnly];
}

// === Main ===

async function main() {
  const startTime = Date.now();
  console.log(`[refresh-stations] ${new Date().toISOString()}`);
  console.log(`Output: ${OUTPUT_PATH}`);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 1. ΜΥΦΑΗ
  const token = await fetchToken();
  const features = await fetchLocations(token);
  const valid = features.filter(f => f.geometry?.coordinates?.length === 2);
  const cache = await fetchDetailsWithCache(valid);
  const myfahi = valid.map(f => convertMyfahi(f, cache[featureCoordKey(f)] || null));

  // 2. OCM
  const ocmPois = await fetchOcmStations();

  // 3. Merge
  console.log('Merging...');
  const stations = mergeStations(myfahi, ocmPois || []);

  // Preserve OCM-only from previous run if OCM failed
  if (!ocmPois) {
    try {
      if (fs.existsSync(OUTPUT_PATH)) {
        const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
        const coordKey = (s) => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`;
        const currentCoords = new Set(stations.map(coordKey));
        const retained = existing.filter(s => s.source === 'ocm' && !currentCoords.has(coordKey(s)));
        if (retained.length > 0) {
          stations.push(...retained);
          console.log(`  Retained ${retained.length} OCM-only from previous run.`);
        }
      }
    } catch {}
  }

  // Preserve addresses from previous run
  try {
    if (fs.existsSync(OUTPUT_PATH)) {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      const coordKey = (s) => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`;
      const oldMap = new Map();
      for (const s of existing) { if (s.address || s.city) oldMap.set(coordKey(s), s); }
      let preserved = 0;
      for (const station of stations) {
        const old = oldMap.get(coordKey(station));
        if (!old) continue;
        if (!station.address && old.address) { station.address = old.address; preserved++; }
        if (!station.city && old.city) { station.city = old.city; }
      }
      if (preserved > 0) console.log(`Preserved ${preserved} addresses.`);
    }
  } catch {}

  // Stats & save
  const operational = stations.filter(s => s.isOperational).length;
  console.log(`\nTotal: ${stations.length}, Operational: ${operational}`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stations));
  const sizeMb = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`Saved ${OUTPUT_PATH} (${sizeMb} MB)`);
  console.log(`Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
