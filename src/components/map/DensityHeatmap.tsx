'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { HeatmapCell } from '../../types';
import { useMap } from './MapBase';
import { buildHeatmapGeoJson } from './mapUtils';

export interface DensityHeatmapProps {
  cells: (HeatmapCell | { lat: number; lng: number; intensity: number })[];
  id?: string;
  opacity?: number;
  map?: maplibregl.Map | null;
}

export function DensityHeatmap({
  cells,
  id = 'density-heatmap',
  opacity = 0.8,
  map: propMap,
}: DensityHeatmapProps) {
  const context = useMap();
  const map = propMap ?? context.map;
  const isLoaded = context.isLoaded || (map ? map.isStyleLoaded() : false);

  const sourceId = `source-${id}`;
  const layerId = `layer-${id}`;
  const layerAddedRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    const setupHeatmap = () => {
      if (!map.getStyle()) return;

      const data = buildHeatmapGeoJson(cells);

      // Add or update source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data,
        });
      } else {
        const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
        source.setData(data);
      }

      // Add native MapLibre GL heatmap layer
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'heatmap',
          source: sourceId,
          maxzoom: 16,
          paint: {
            // Increase heatmap weight based on property intensity (1-10)
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 0,
              1, 0.2,
              5, 0.7,
              10, 1,
            ],
            // Color ramp: transparent -> green (emerald-500) -> yellow (yellow-500) -> orange -> red (red-500)
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.2, 'rgba(34, 197, 94, 0.5)',   // green
              0.5, 'rgba(234, 179, 8, 0.8)',   // yellow
              0.8, 'rgba(249, 115, 22, 0.9)',  // orange
              1.0, 'rgba(239, 68, 68, 0.95)',  // red
            ],
            // Heatmap radius adjusts by zoom level for smooth visibility across scales
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 18,
              13, 35,
              16, 60,
            ],
            'heatmap-opacity': opacity,
          },
        });
      }

      layerAddedRef.current = true;
    };

    if (map.isStyleLoaded()) {
      setupHeatmap();
    } else {
      map.once('load', setupHeatmap);
    }

    return () => {
      if (!map || !map.getStyle()) return;

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      layerAddedRef.current = false;
    };
  }, [map, sourceId, layerId]);

  // Update source data when cells change
  useEffect(() => {
    if (!map || !layerAddedRef.current) return;
    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (source && typeof source.setData === 'function') {
      source.setData(buildHeatmapGeoJson(cells));
    }
  }, [cells, map, sourceId]);

  // Update opacity if prop changes
  useEffect(() => {
    if (!map || !layerAddedRef.current) return;
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'heatmap-opacity', opacity);
    }
  }, [opacity, map, layerId]);

  return null;
}

export default DensityHeatmap;
