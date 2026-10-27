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
  colorScheme?: 'yellow' | 'emerald';
}

export function DensityHeatmap({
  cells,
  id = 'density-heatmap',
  opacity = 0.82,
  map: propMap,
  colorScheme = 'yellow',
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

      // Color ramps: Default vibrant yellow/amber/orange glow or classic emerald
      const yellowColorRamp = [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(255, 235, 59, 0)',
        0.12,
        'rgba(254, 240, 138, 0.45)',
        0.3,
        'rgba(253, 224, 71, 0.75)',
        0.55,
        'rgba(250, 204, 21, 0.9)',
        0.75,
        'rgba(245, 158, 11, 0.95)',
        0.92,
        'rgba(234, 88, 12, 1)',
        1,
        'rgba(220, 38, 38, 1)',
      ] as unknown as maplibregl.ExpressionSpecification;

      const emeraldColorRamp = [
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
      ] as unknown as maplibregl.ExpressionSpecification;

      // Add native MapLibre GL heatmap layer
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'heatmap',
          source: sourceId,
          maxzoom: 19,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0,
              0.15,
              2,
              0.5,
              5,
              0.85,
              10,
              1.2,
            ],
            // Heatmap intensity multiplier across zoom levels for solid glow
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              9,
              0.9,
              11,
              1.3,
              13,
              1.8,
              15,
              2.6,
              18,
              3.5,
            ],
            // Color ramp for heatmap: vibrant yellow -> glowing gold -> amber orange -> red
            'heatmap-color': colorScheme === 'emerald' ? emeraldColorRamp : yellowColorRamp,
            // Larger heatmap radius for higher range
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              9,
              35,
              11,
              58,
              13,
              90,
              15,
              135,
              17,
              195,
            ],
            // Heatmap layer opacity
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
  }, [map, sourceId, layerId, colorScheme]);

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
          const intensity = 'intensity' in c ? c.intensity : 6;
          const radius = Math.min(
            110,
            Math.max(45, intensity * 11)
          );
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                filter: 'blur(28px)',
                background:
                  colorScheme === 'emerald'
                    ? 'radial-gradient(circle, rgba(16,185,129,0.75) 0%, rgba(5,150,105,0.4) 60%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(253,224,71,0.9) 0%, rgba(250,204,21,0.7) 35%, rgba(245,158,11,0.45) 65%, transparent 100%)',
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
