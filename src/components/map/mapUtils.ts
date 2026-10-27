/// <reference types="geojson" />
import { HeatmapCell } from '../../types';

/**
 * Normalizes input coordinates to [lng, lat] for MapLibre/GeoJSON.
 * If given [lat, lng] (e.g. Dhaka lat ~23.8, lng ~90.4), swaps to [lng, lat].
 */
export function toLngLat(
  latOrCoord: number | [number, number],
  lng?: number
): [number, number] {
  if (Array.isArray(latOrCoord)) {
    const [a, b] = latOrCoord;
    // If [lng, lat] already (lng > 60 and lat <= 60):
    if (a > 60 && b <= 60) {
      return [a, b];
    }
    // If [lat, lng] (lat <= 60 and lng > 60):
    if (a <= 60 && b > 60) {
      return [b, a];
    }
    // Default assumption if both in range: [lat, lng] -> [lng, lat]
    return [b, a];
  }

  const lat = latOrCoord;
  const lon = lng ?? 0;
  return [lon, lat];
}

/**
 * Normalizes input coordinates to [lat, lng] for application state/APIs.
 */
export function toLatLng(
  lngOrCoord: number | [number, number],
  lat?: number
): [number, number] {
  if (Array.isArray(lngOrCoord)) {
    const [a, b] = lngOrCoord;
    // If already [lat, lng] (lat <= 60 and lng > 60):
    if (a <= 60 && b > 60) {
      return [a, b];
    }
    // If [lng, lat] (lng > 60 and lat <= 60):
    if (a > 60 && b <= 60) {
      return [b, a];
    }
    // Default assumption: [lng, lat] -> [lat, lng]
    return [b, a];
  }

  const lon = lngOrCoord;
  const latitude = lat ?? 0;
  return [latitude, lon];
}

/**
 * Builds a GeoJSON Point feature from (lat, lng) coordinates.
 * Resulting geometry coordinates are [lng, lat].
 */
export function buildGeoJsonPoint(
  lat: number,
  lng: number,
  properties: Record<string, unknown> = {}
): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
  };
}

/**
 * Builds a GeoJSON LineString feature from an array of coordinate pairs.
 * Ensures points are ordered as [lng, lat].
 */
export function buildGeoJsonLine(
  coordinates: [number, number][],
  properties: Record<string, unknown> = {}
): GeoJSON.Feature<GeoJSON.LineString> {
  const normalized = coordinates.map((coord) => toLngLat(coord));

  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'LineString',
      coordinates: normalized,
    },
  };
}

/**
 * Builds a GeoJSON FeatureCollection of Point features with an 'intensity' property
 * for MapLibre heatmap layers.
 */
export function buildHeatmapGeoJson(
  cells: (HeatmapCell | { lat: number; lng: number; intensity: number })[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: cells.map((cell) => ({
      type: 'Feature',
      properties: {
        intensity: cell.intensity,
      },
      geometry: {
        type: 'Point',
        coordinates: [cell.lng, cell.lat],
      },
    })),
  };
}

/**
 * Calculates bearing (heading in degrees from 0 to 360) between two coordinates [lat, lng].
 */
export function calculateBearing(
  start: [number, number],
  end: [number, number]
): number {
  const [startLat, startLng] = toLatLng(start);
  const [endLat, endLng] = toLatLng(end);

  const lat1 = (startLat * Math.PI) / 180;
  const lat2 = (endLat * Math.PI) / 180;
  const dLng = ((endLng - startLng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Interpolates smoothly between two coordinates given fraction t (0 to 1).
 */
export function interpolatePosition(
  start: [number, number],
  end: [number, number],
  t: number
): [number, number] {
  const [lat1, lng1] = toLatLng(start);
  const [lat2, lng2] = toLatLng(end);

  return [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t];
}

