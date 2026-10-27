'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from './MapBase';
import { buildGeoJsonLine } from './mapUtils';

export interface RouteLayerProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  id?: string;
  map?: maplibregl.Map | null;
}

export function RouteLayer({
  coordinates,
  color = '#10b981', // emerald-500
  width = 5,
  opacity = 0.95,
  id = 'primary-route',
  map: propMap,
}: RouteLayerProps) {
  const context = useMap();
  const map = propMap ?? context.map;
  const isLoaded = context.isLoaded || (map ? map.isStyleLoaded() : false);

  const sourceId = `source-${id}`;
  const layerCasingId = `layer-${id}-casing`;
  const layerId = `layer-${id}-line`;

  const layerAddedRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    const setupLayer = () => {
      if (!map.getStyle()) return;

      const geojsonData = buildGeoJsonLine(coordinates);

      // Add or update source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
        });
      } else {
        const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
        source.setData(geojsonData);
      }

      // Add high-contrast casing (dark emerald/slate border under the line)
      if (!map.getLayer(layerCasingId)) {
        map.addLayer({
          id: layerCasingId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#064e3b', // emerald-900 border
            'line-width': width + 3,
            'line-opacity': opacity,
          },
        });
      }

      // Add main solid route line
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': width,
            'line-opacity': opacity,
          },
        });
      }

      layerAddedRef.current = true;
    };

    if (map.isStyleLoaded()) {
      setupLayer();
    } else {
      map.once('load', setupLayer);
    }

    return () => {
      if (!map || !map.getStyle()) return;

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getLayer(layerCasingId)) {
        map.removeLayer(layerCasingId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      layerAddedRef.current = false;
    };
  }, [map, sourceId, layerId, layerCasingId]);

  // Update line data when coordinates change
  useEffect(() => {
    if (!map || !layerAddedRef.current) return;
    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (source && typeof source.setData === 'function') {
      source.setData(buildGeoJsonLine(coordinates));
    }
  }, [coordinates, map, sourceId]);

  // Update line paint properties if color/width/opacity change
  useEffect(() => {
    if (!map || !layerAddedRef.current) return;
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'line-color', color);
      map.setPaintProperty(layerId, 'line-width', width);
      map.setPaintProperty(layerId, 'line-opacity', opacity);
    }
    if (map.getLayer(layerCasingId)) {
      map.setPaintProperty(layerCasingId, 'line-width', width + 3);
      map.setPaintProperty(layerCasingId, 'line-opacity', opacity);
    }
  }, [color, width, opacity, map, layerId, layerCasingId]);

  return null;
}

export default RouteLayer;
