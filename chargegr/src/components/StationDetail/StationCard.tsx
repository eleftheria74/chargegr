import { MapPin, Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import type { ChargingStation, VehicleProfile } from '@/lib/types';
import { estimateChargingTime } from '@/lib/charging';
import { formatDistance, haversineDistance } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import ConnectorInfo from './ConnectorInfo';
import NavigateButton from './NavigateButton';

interface Props {
  station: ChargingStation;
  userLocation?: { lat: number; lng: number } | null;
  vehicle?: VehicleProfile | null;
}

export default function StationCard({ station, userLocation, vehicle }: Props) {
  const { t } = useTranslation();

  const distance = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, station.lat, station.lng)
    : null;

  const isCompatible = vehicle
    ? station.connectors.some(c =>
        vehicle.compatibleConnectors.includes(c.type)
      )
    : null;

  let chargingTimeMin: number | null = null;
  if (vehicle && isCompatible) {
    const compatibleConnectors = station.connectors.filter(c =>
      vehicle.compatibleConnectors.includes(c.type)
    );
    const bestConnector = compatibleConnectors.reduce((best, c) =>
      c.powerKw > best.powerKw ? c : best
    , compatibleConnectors[0]);

    if (bestConnector) {
      const maxVehicleKw = bestConnector.currentType === 'DC'
        ? vehicle.maxDcKw
        : vehicle.maxAcKw;
      chargingTimeMin = estimateChargingTime(
        vehicle.batteryKwh,
        bestConnector.powerKw,
        maxVehicleKw,
      );
    }
  }

  return (
    <div className="max-w-full overflow-hidden">
      {/* Header: name + operator */}
      <div className="mt-1">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words">
          {station.name}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5 break-words">{station.operator}</p>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        {station.isOperational ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
            <CheckCircle size={12} />
            {t('station.available')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
            <XCircle size={12} />
            {t('station.unavailable')}
          </span>
        )}

        {station.isFreeCharging && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {t('station.free')}
          </span>
        )}

        {station.is24h && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
            <Clock size={12} />
            {t('station.24h')}
          </span>
        )}

        {station.maxPowerKw > 0 && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {station.maxPowerKw} {t('station.kwMax')}
          </span>
        )}
      </div>

      {/* Distance + address */}
      <div className="flex items-start gap-2 mt-3 text-sm text-gray-600">
        <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
        <div className="min-w-0 break-words">
          {distance !== null && (
            <span className="font-semibold text-[#1B7B4E]">
              {formatDistance(distance)}
              {' — '}
            </span>
          )}
          {station.address || station.city || t('station.noAddress')}
          {station.address && station.city && `, ${station.city}`}
        </div>
      </div>

      {/* Vehicle compatibility */}
      {isCompatible !== null && (
        <div className={`mt-3 text-sm font-semibold px-3 py-2 rounded-lg ${
          isCompatible
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {isCompatible
            ? `${t('station.compatible')} ${vehicle!.make} ${vehicle!.model}`
            : `${t('station.incompatible')} ${vehicle!.make} ${vehicle!.model}`
          }
        </div>
      )}

      {/* Charging time estimate */}
      {chargingTimeMin !== null && chargingTimeMin > 0 && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-lg">
          <Timer size={16} className="text-gray-400 shrink-0" />
          <span>
            10% → 80%: <strong className="text-gray-800">~{chargingTimeMin} {t('station.minutes')}</strong>
          </span>
        </div>
      )}

      {/* Connectors */}
      {station.connectors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t('station.connectors')}
          </h3>
          <div className="flex flex-col gap-1.5">
            {station.connectors.map((c, i) => (
              <ConnectorInfo key={i} connector={c} />
            ))}
          </div>
        </div>
      )}

      {/* Navigate + Share */}
      <NavigateButton
        lat={station.lat}
        lng={station.lng}
        stationName={station.name}
      />
    </div>
  );
}
