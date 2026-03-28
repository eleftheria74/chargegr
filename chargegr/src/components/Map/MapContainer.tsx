'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ChargingStation } from '@/lib/types';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const GREECE_CENTER: [number, number] = [23.7275, 37.9838];
const DEFAULT_ZOOM = 7;

const SOURCE_ID = 'chargers';
const LAYER_CLUSTERS = 'clusters';
const LAYER_CLUSTER_COUNT = 'cluster-count';
const LAYER_POINTS = 'charger-points';
const SOURCE_FAVORITES = 'favorites';
const LAYER_FAVORITES = 'favorite-points';

interface Props {
  stations: ChargingStation[];
  favoriteIds?: string[];
  onStationClick?: (station: ChargingStation) => void;
  flyTo?: { lat: number; lng: number } | null;
}

function stationsToGeoJSON(stations: ChargingStation[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stations.map(s => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [s.lng, s.lat],
      },
      properties: {
        id: s.id,
        name: s.name,
        operator: s.operator,
        powerCategory: s.isOperational ? s.powerCategory : 'offline',
        maxPowerKw: s.maxPowerKw,
        isOperational: s.isOperational,
      },
    })),
  };
}

export default function MapContainer({ stations, favoriteIds = [], onStationClick, flyTo }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const allStationsRef = useRef<ChargingStation[]>([]);

  // Keep full station objects for click lookups
  allStationsRef.current = stations;

  const handleStationClick = useCallback((stationId: string) => {
    const station = allStationsRef.current.find(s => s.id === stationId);
    if (station && onStationClick) {
      onStationClick(station);
    }
  }, [onStationClick]);

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_URL,
      center: GREECE_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      map.addLayer({
        id: LAYER_CLUSTERS,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1B7B4E',
          'circle-radius': [
            'step', ['get', 'point_count'],
            18, 10, 24, 50, 32, 200, 40,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85,
        },
      });

      map.addLayer({
        id: LAYER_CLUSTER_COUNT,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 13,
          'text-font': ['Open Sans Bold'],
        },
        paint: { 'text-color': '#ffffff' },
      });

      map.addLayer({
        id: LAYER_POINTS,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'powerCategory'],
            'slow', '#9CA3AF',
            'fast', '#22C55E',
            'rapid', '#F59E0B',
            'ultrarapid', '#8B5CF6',
            'offline', '#EF4444',
            '#22C55E',
          ],
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            5, 4, 10, 7, 14, 10,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Favorites layer (rendered on top)
      map.addSource(SOURCE_FAVORITES, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: LAYER_FAVORITES,
        type: 'circle',
        source: SOURCE_FAVORITES,
        paint: {
          'circle-color': '#F59E0B',
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            5, 6, 10, 9, 14, 12,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', LAYER_FAVORITES, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_FAVORITES] });
        if (!features.length) return;
        handleStationClick(features[0].properties!.id as string);
      });

      map.on('mouseenter', LAYER_FAVORITES, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', LAYER_FAVORITES, () => { map.getCanvas().style.cursor = ''; });

      // Click handlers
      map.on('click', LAYER_CLUSTERS, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTERS] });
        if (!features.length) return;
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geometry = features[0].geometry;
          if (geometry.type === 'Point') {
            map.easeTo({ center: geometry.coordinates as [number, number], zoom });
          }
        });
      });

      map.on('click', LAYER_POINTS, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_POINTS] });
        if (!features.length) return;
        handleStationClick(features[0].properties.id);
      });

      map.on('mouseenter', LAYER_CLUSTERS, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', LAYER_CLUSTERS, () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', LAYER_POINTS, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', LAYER_POINTS, () => { map.getCanvas().style.cursor = ''; });

      // Set initial data
      const geojson = stationsToGeoJSON(allStationsRef.current);
      (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map data when stations change (filtering)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(stationsToGeoJSON(stations));
    }
  }, [stations]);

  // Update favorites layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_FAVORITES) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      const favStations = stations.filter(s => favoriteIds.includes(s.id));
      source.setData(stationsToGeoJSON(favStations));
    }
  }, [stations, favoriteIds]);

  // Fly to location when flyTo changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: 14, duration: 1500 });
  }, [flyTo]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full"
      style={{ height: '100dvh' }}
    />
  );
}
