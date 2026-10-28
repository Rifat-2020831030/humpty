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
  onMapMove?: (coords: { lat: number; lng: number }) => void;
  onMapMoveStart?: () => void;
  onMapMoveEnd?: (coords: { lat: number; lng: number }) => void;
  styleUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface MapContextType {
  map: maplibregl.Map | null;
  isLoaded: boolean;
  isAvailable: boolean;
  isInMapBase?: boolean;
  project?: (coord: [number, number] | { lat: number; lng: number }) => { x: number; y: number } | null;
}

export const MapContext = createContext<MapContextType>({
  map: null,
  isLoaded: false,
  isAvailable: false,
  isInMapBase: false,
});

export function useMap(): MapContextType {
  return useContext(MapContext);
}

/**
 * Checks whether WebGL / WebGL2 rendering is supported and functioning in the current browser.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(gl && (gl instanceof WebGLRenderingContext || (window.WebGL2RenderingContext && gl instanceof WebGL2RenderingContext)));
  } catch {
    return false;
  }
}

/**
 * Approximate geographical bounding box of Greater Dhaka for 2D fallback projection
 */
export const DHAKA_2D_BOUNDS = {
  minLat: 23.6800,
  maxLat: 23.8900,
  minLng: 90.3300,
  maxLng: 90.4600,
};

/**
 * Key landmark reference points for the 2D schematic map
 */
export const DHAKA_2D_LANDMARKS = [
  { name: 'Uttara', lat: 23.8680, lng: 90.3980, code: 'UTR' },
  { name: 'Airport', lat: 23.8433, lng: 90.4030, code: 'DAC' },
  { name: 'Mirpur 10', lat: 23.8070, lng: 90.3680, code: 'MIR' },
  { name: 'Banani', lat: 23.7940, lng: 90.4043, code: 'BAN' },
  { name: 'Gulshan 2', lat: 23.7925, lng: 90.4078, code: 'GUL' },
  { name: 'Farmgate', lat: 23.7561, lng: 90.3872, code: 'FRM' },
  { name: 'Dhanmondi', lat: 23.7534, lng: 90.3773, code: 'DHN' },
  { name: 'Shahbagh', lat: 23.7380, lng: 90.3957, code: 'SHB' },
  { name: 'Motijheel', lat: 23.7330, lng: 90.4172, code: 'MOT' },
];

export function MapBase({
  center = DHAKA_CENTER,
  zoom = 13,
  interactive = true,
  onMapClick,
  onMapLoad,
  onMapMove,
  onMapMoveStart,
  onMapMoveEnd,
  styleUrl = MAP_STYLE_URL,
  className = 'w-full h-full min-h-[300px]',
  children,
}: MapBaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapState, setMapState] = useState<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Keep callback refs stable
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const onMapLoadRef = useRef(onMapLoad);
  onMapLoadRef.current = onMapLoad;

  const onMapMoveRef = useRef(onMapMove);
  onMapMoveRef.current = onMapMove;

  const onMapMoveStartRef = useRef(onMapMoveStart);
  onMapMoveStartRef.current = onMapMoveStart;

  const onMapMoveEndRef = useRef(onMapMoveEnd);
  onMapMoveEndRef.current = onMapMoveEnd;

  /**
   * Projects a Dhaka [lat, lng] or {lat, lng} into a 0-100% percentage coordinate for 2D mode
   */
  const projectDhaka = useCallback(
    (coord: [number, number] | { lat: number; lng: number }): { x: number; y: number } | null => {
      if (!coord) return null;
      const lat = Array.isArray(coord) ? coord[0] : coord.lat;
      const lng = Array.isArray(coord) ? coord[1] : coord.lng;
      const { minLat, maxLat, minLng, maxLng } = DHAKA_2D_BOUNDS;
      const x = Math.max(2, Math.min(98, ((lng - minLng) / (maxLng - minLng)) * 100));
      const y = Math.max(2, Math.min(98, ((maxLat - lat) / (maxLat - minLat)) * 100));
      return { x, y };
    },
    []
  );

  /**
   * Translates 2D canvas click into real Dhaka [lat, lng]
   */
  const handle2DClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratioX = (e.clientX - rect.left) / rect.width;
    const ratioY = (e.clientY - rect.top) / rect.height;
    const { minLat, maxLat, minLng, maxLng } = DHAKA_2D_BOUNDS;
    const lng = minLng + Math.max(0, Math.min(1, ratioX)) * (maxLng - minLng);
    const lat = maxLat - Math.max(0, Math.min(1, ratioY)) * (maxLat - minLat);
    if (onMapClickRef.current) {
      onMapClickRef.current({ lat, lng });
    }
    if (onMapMoveRef.current) {
      onMapMoveRef.current({ lat, lng });
    }
    if (onMapMoveEndRef.current) {
      onMapMoveEndRef.current({ lat, lng });
    }
  };

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Check if WebGL context creation is supported
    if (!isWebGLSupported()) {
      setWebglUnavailable(true);
      setIsLoaded(true);
      return;
    }

    const initialCenter = toLngLat(center);
    let map: maplibregl.Map | null = null;

    try {
      map = new maplibregl.Map({
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
        if (onMapLoadRef.current && map) {
          onMapLoadRef.current(map);
        }
      });

      map.on('click', (e) => {
        if (onMapClickRef.current) {
          onMapClickRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        }
      });

      const activeMap = map;

      activeMap.on('movestart', () => {
        if (onMapMoveStartRef.current) {
          onMapMoveStartRef.current();
        }
      });

      activeMap.on('move', () => {
        if (onMapMoveRef.current) {
          const c = activeMap.getCenter();
          onMapMoveRef.current({ lat: c.lat, lng: c.lng });
        }
      });

      activeMap.on('moveend', () => {
        if (onMapMoveEndRef.current) {
          const c = activeMap.getCenter();
          onMapMoveEndRef.current({ lat: c.lat, lng: c.lng });
        }
      });

      mapRef.current = map;
      setMapState(map);
    } catch (err) {
      console.warn(
        'MapLibre GL initialization failed; falling back to 2D Dhaka Simulation Map:',
        err
      );
      setWebglUnavailable(true);
      setIsLoaded(true);
      mapRef.current = null;
      setMapState(null);
    }

    return () => {
      if (map) {
        try {
          map.remove();
        } catch {}
      }
      mapRef.current = null;
      setMapState(null);
      setIsLoaded(false);
    };
  }, [styleUrl, interactive]);

  const prevCenterRef = useRef<[number, number] | null>(null);

  // Sync center when prop changes (for WebGL mode)
  useEffect(() => {
    if (!mapRef.current || !isLoaded || webglUnavailable || !center) return;
    const target = toLngLat(center);
    const hasTargetChanged =
      !prevCenterRef.current ||
      Math.abs(prevCenterRef.current[0] - target[0]) > 0.0001 ||
      Math.abs(prevCenterRef.current[1] - target[1]) > 0.0001;

    if (hasTargetChanged) {
      prevCenterRef.current = target;
      const curr = mapRef.current.getCenter();
      if (
        Math.abs(curr.lng - target[0]) > 0.0001 ||
        Math.abs(curr.lat - target[1]) > 0.0001
      ) {
        mapRef.current.flyTo({ center: target, speed: 1.2 });
      }
    }
  }, [center, isLoaded, webglUnavailable]);

  // Sync zoom when prop changes (for WebGL mode)
  useEffect(() => {
    if (!mapRef.current || !isLoaded || webglUnavailable) return;
    if (Math.abs(mapRef.current.getZoom() - zoom) > 0.1) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom, isLoaded, webglUnavailable]);

  // If WebGL is unavailable or failed, render the 2D Dhaka Simulation Map
  if (webglUnavailable) {
    const centerPos = projectDhaka(center);

    return (
      <div
        ref={containerRef}
        onClick={interactive ? handle2DClick : undefined}
        className={`relative overflow-hidden bg-neutral-950 text-neutral-100 select-none ${className} ${
          interactive ? 'cursor-crosshair' : ''
        }`}
      >
        {/* Dhaka Coordinate Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <defs>
            <pattern
              id="dhakaGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#262626"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dhakaGrid)" />
        </svg>

        {/* Dhaka Arterial Roads Simulation Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Airport Road / Kazi Nazrul Islam Ave (Spine) */}
          <line
            x1="58"
            y1="5"
            x2="55"
            y2="85"
            stroke="#1c2430"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Mirpur Road */}
          <line
            x1="32"
            y1="25"
            x2="42"
            y2="78"
            stroke="#1c2430"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Pragati Sarani */}
          <line
            x1="72"
            y1="20"
            x2="68"
            y2="70"
            stroke="#1c2430"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Hatirjheel loop */}
          <ellipse
            cx="60"
            cy="58"
            rx="8"
            ry="4"
            stroke="#004d36"
            strokeWidth="1.6"
            fill="none"
            opacity="0.6"
          />
          {/* Connecting Arteries */}
          <line
            x1="32"
            y1="42"
            x2="72"
            y2="40"
            stroke="#1c2430"
            strokeWidth="1.2"
            strokeDasharray="2,2"
          />
          <line
            x1="35"
            y1="65"
            x2="75"
            y2="65"
            stroke="#1c2430"
            strokeWidth="1.2"
            strokeDasharray="2,2"
          />
        </svg>

        {/* Dhaka Landmark Reference Badges */}
        <div className="absolute inset-0 pointer-events-none">
          {DHAKA_2D_LANDMARKS.map((lm) => {
            const pos = projectDhaka([lm.lat, lm.lng]);
            if (!pos) return null;
            return (
              <div
                key={lm.code}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-70"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm mb-0.5" />
                <span className="text-[10px] font-mono tracking-wider font-semibold text-neutral-400 bg-neutral-900/90 px-1.5 py-0.5 rounded border border-neutral-800 shadow">
                  {lm.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Map Center Indicator */}
        {centerPos && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ left: `${centerPos.x}%`, top: `${centerPos.y}%` }}
          >
            <div className="relative flex items-center justify-center">
              <span className="w-6 h-6 rounded-full border border-emerald-500/60 animate-ping absolute" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-md" />
            </div>
          </div>
        )}

        {/* Informative Status Badge: Explains 2D simulation mode */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between p-2.5 bg-neutral-900/95 border border-neutral-800 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-200">
              2D Dhaka Simulation Active
            </span>
            <span className="hidden sm:inline text-[11px] text-neutral-400">
              • WebGL hardware acceleration disabled
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            <span>DHAKA</span>
            <span>
              {center[0].toFixed(3)}, {center[1].toFixed(3)}
            </span>
          </div>
        </div>

        {/* Children rendered inside MapContext with 2D coordinate projector */}
        <MapContext.Provider
          value={{
            map: null,
            isLoaded: true,
            isAvailable: false,
            isInMapBase: true,
            project: projectDhaka,
          }}
        >
          {children}
        </MapContext.Provider>
      </div>
    );
  }

  // Full WebGL mode
  return (
    <div className={`relative overflow-hidden bg-neutral-950 ${className}`}>
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
      <MapContext.Provider
        value={{
          map: mapState,
          isLoaded,
          isAvailable: true,
          isInMapBase: true,
          project: projectDhaka,
        }}
      >
        {children}
      </MapContext.Provider>
    </div>
  );
}

export default MapBase;
