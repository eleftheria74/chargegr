import type { ConnectorType, PowerCategory, GreekNetwork } from './types';

// === ΜΥΦΑΗ API ===
export const MYFAHI_BASE_URL = 'https://electrokinisi.yme.gov.gr';
export const MYFAHI_LOCATIONS_URL = `${MYFAHI_BASE_URL}/myfah-api/openApi/GetPLocations`;
export const MYFAHI_LOCATION_DETAIL_URL = `${MYFAHI_BASE_URL}/myfah-api/openApi/GetLocation`;
export const MYFAHI_TOKEN_PAGE_URL = `${MYFAHI_BASE_URL}/public/ChargingPoints/`;

// Cache duration: 6 hours
export const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

// === OCPI Connector Standard → ConnectorType mapping ===
export const OCPI_CONNECTOR_MAP: Record<string, ConnectorType> = {
  'IEC_62196_T2': 'Type2',
  'IEC_62196_T2_COMBO': 'CCS2',
  'CHADEMO': 'CHAdeMO',
  'IEC_62196_T1': 'Type1',
  'IEC_62196_T1_COMBO': 'Type1',
  'DOMESTIC_F': 'SchukoSocket',
  'DOMESTIC_E': 'SchukoSocket',
  'TESLA_S': 'TeslaNCAS',
  'NACS': 'TeslaNCAS',
};

// === Provider name → GreekNetwork mapping ===
export const PROVIDER_NETWORK_MAP: Record<string, GreekNetwork> = {
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
};

// === Power category thresholds ===
export function getPowerCategory(kw: number): PowerCategory {
  if (kw <= 7.4) return 'slow';
  if (kw <= 22) return 'fast';
  if (kw <= 99) return 'rapid';
  return 'ultrarapid';
}
