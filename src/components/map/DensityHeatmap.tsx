'use client';

import React, { useEffect, useRef } from 'react';
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
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0,
              0,
              10,
              1,
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              11,
              1,
              15,
              3,
            ],
            // Color ramp for heatmap: transparent -> subtle teal -> rich emerald -> bright green
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0, 106, 78, 0)',
              0.2,
              'rgba(4, 120, 87, 0.35)',
              0.4,
              'rgba(16, 185, 129, 0.6)',
              0.7,
              'rgba(52, 211, 153, 0.85)',
              1,
              'rgba(110, 231, 183, 1)',
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              11,
              18,
              15,
              38,
            ],
            // Transition from heatmap to circle layer by zoom level
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

  // Update source data when cells change in WebGL mode
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

  // Fallback 2D heatmap blobs when WebGL is unavailable
  if (!map && context.project && cells.length > 0) {
    return (
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-10"
        style={{ opacity }}
      >
        {cells.map((c, i) => {
          const pt = context.project!({ lat: c.lat, lng: c.lng });
          if (!pt) return null;
          const radius = Math.min(
            32,
            Math.max(14, ('intensity' in c ? c.intensity : 1) * 6)
          );
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.7) 0%, rgba(5,150,105,0.3) 60%, transparent 100%)',
              }}
            />
          );
        })}
      </div>
    );
  }

  return null;
}

export default DensityHeatmap;
