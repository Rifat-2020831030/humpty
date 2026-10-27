import { describe, it, expect } from 'vitest';
import {
  buildGeoJsonPoint,
  buildGeoJsonLine,
  buildHeatmapGeoJson,
  toLngLat,
  toLatLng,
  calculateBearing,
  interpolatePosition,
} from '../../src/components/map/mapUtils';
import {
  MapBase,
  LocationPicker,
  RouteLayer,
  DriverMarker,
  SearchRadarOverlay,
  DensityHeatmap,
  useMap,
} from '../../src/components/map';

describe('Map GeoJSON Utilities', () => {
  it('creates valid GeoJSON Point structure with [lng, lat] coordinates', () => {
    const feature = buildGeoJsonPoint(23.81, 90.41, { name: 'Pickup Point' });
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('Point');
    expect(feature.geometry.coordinates).toEqual([90.41, 23.81]); // [lng, lat]
    expect(feature.properties).toEqual({ name: 'Pickup Point' });
  });

  it('creates valid GeoJSON LineString structure', () => {
    const line = buildGeoJsonLine([[23.81, 90.41], [23.82, 90.42]]);
    expect(line.type).toBe('Feature');
    expect(line.geometry.type).toBe('LineString');
    expect(line.geometry.coordinates.length).toBe(2);
    // Verified it converts [lat, lng] to [lng, lat]
    expect(line.geometry.coordinates[0]).toEqual([90.41, 23.81]);
    expect(line.geometry.coordinates[1]).toEqual([90.42, 23.82]);
  });

  it('handles already [lng, lat] ordered line coordinates without double swapping', () => {
    const line = buildGeoJsonLine([[90.41, 23.81], [90.42, 23.82]]);
    expect(line.geometry.coordinates[0]).toEqual([90.41, 23.81]);
    expect(line.geometry.coordinates[1]).toEqual([90.42, 23.82]);
  });

  it('builds FeatureCollection for heatmap density points', () => {
    const collection = buildHeatmapGeoJson([
      { lat: 23.81, lng: 90.41, intensity: 3 },
      { lat: 23.82, lng: 90.42, intensity: 5 },
    ]);
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features.length).toBe(2);
    expect(collection.features[0].geometry.type).toBe('Point');
    expect(collection.features[0].geometry.coordinates).toEqual([90.41, 23.81]);
    expect(collection.features[0].properties?.intensity).toBe(3);
    expect(collection.features[1].properties?.intensity).toBe(5);
  });

  it('toLngLat converts lat/lng to [lng, lat]', () => {
    expect(toLngLat(23.81, 90.41)).toEqual([90.41, 23.81]);
    expect(toLngLat([23.81, 90.41])).toEqual([90.41, 23.81]);
  });

  it('toLatLng converts lng/lat to [lat, lng]', () => {
    expect(toLatLng(90.41, 23.81)).toEqual([23.81, 90.41]);
    expect(toLatLng([90.41, 23.81])).toEqual([23.81, 90.41]);
  });

  it('calculateBearing calculates directional angle between two points', () => {
    // Due North
    const bearingNorth = calculateBearing([23.80, 90.40], [23.90, 90.40]);
    expect(Math.round(bearingNorth)).toBe(0);

    // Due East
    const bearingEast = calculateBearing([23.80, 90.40], [23.80, 90.50]);
    expect(Math.round(bearingEast)).toBe(90);

    // Due South
    const bearingSouth = calculateBearing([23.90, 90.40], [23.80, 90.40]);
    expect(Math.round(bearingSouth)).toBe(180);

    // Due West
    const bearingWest = calculateBearing([23.80, 90.50], [23.80, 90.40]);
    expect(Math.round(bearingWest)).toBe(270);
  });

  it('interpolatePosition smoothly interpolates between two points', () => {
    const start: [number, number] = [23.80, 90.40];
    const end: [number, number] = [23.82, 90.44];

    const midpoint = interpolatePosition(start, end, 0.5);
    expect(midpoint[0]).toBeCloseTo(23.81, 4);
    expect(midpoint[1]).toBeCloseTo(90.42, 4);

    const quarter = interpolatePosition(start, end, 0.25);
    expect(quarter[0]).toBeCloseTo(23.805, 4);
    expect(quarter[1]).toBeCloseTo(90.41, 4);
  });
});

describe('Map Component Exports & SSR Safety', () => {
  it('exports all required React components and hooks', () => {
    expect(typeof MapBase).toBe('function');
    expect(typeof LocationPicker).toBe('function');
    expect(typeof RouteLayer).toBe('function');
    expect(typeof DriverMarker).toBe('function');
    expect(typeof SearchRadarOverlay).toBe('function');
    expect(typeof DensityHeatmap).toBe('function');
    expect(typeof useMap).toBe('function');
  });
});

