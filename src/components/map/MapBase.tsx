'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DHAKA_CENTER, MAP_STYLE_URL } from '../../lib/constants';
import { toLngLat } from './mapUtils';

export interface MapBaseProps {
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onMapLoad?: (map: maplibregl.Map) => void;
  styleUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface MapContextType {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

export const MapContext = createContext<MapContextType>({
  map: null,
  isLoaded: false,
});

export function useMap(): MapContextType {
  return useContext(MapContext);
}

export function MapBase({
  center = DHAKA_CENTER,
  zoom = 13,
  interactive = true,
  onMapClick,
  onMapLoad,
  styleUrl = MAP_STYLE_URL,
  className = 'w-full h-full min-h-[300px]',
  children,
}: MapBaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapState, setMapState] = useState<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep callback refs stable
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const onMapLoadRef = useRef(onMapLoad);
  onMapLoadRef.current = onMapLoad;

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined' || !containerRef.current) return;

    const initialCenter = toLngLat(center);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: initialCenter,
      zoom,
      interactive,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    if (interactive) {
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: false,
        }),
        'top-right'
      );
    }

    map.on('load', () => {
      setIsLoaded(true);
      if (onMapLoadRef.current) {
        onMapLoadRef.current(map);
      }
    });

    map.on('click', (e) => {
      if (onMapClickRef.current) {
        onMapClickRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    mapRef.current = map;
    setMapState(map);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapState(null);
      setIsLoaded(false);
    };
  }, [styleUrl, interactive]);

  // Sync center when prop changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    const target = toLngLat(center);
    const curr = mapRef.current.getCenter();
    if (
      Math.abs(curr.lng - target[0]) > 0.0001 ||
      Math.abs(curr.lat - target[1]) > 0.0001
    ) {
      mapRef.current.flyTo({ center: target, speed: 1.2 });
    }
  }, [center, isLoaded]);

  // Sync zoom when prop changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    if (Math.abs(mapRef.current.getZoom() - zoom) > 0.1) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom, isLoaded]);

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
      <MapContext.Provider value={{ map: mapState, isLoaded }}>
        {children}
      </MapContext.Provider>
    </div>
  );
}

export default MapBase;
