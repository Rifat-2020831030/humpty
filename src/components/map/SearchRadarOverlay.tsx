'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from './MapBase';
import { toLatLng, toLngLat } from './mapUtils';

export interface SearchRadarOverlayProps {
  center?: { lat: number; lng: number } | [number, number];
  active?: boolean;
  title?: string;
  subtext?: string;
  onCancel?: () => void;
  className?: string;
  map?: maplibregl.Map | null;
}

export function SearchRadarOverlay({
  center,
  active = true,
  title = 'Searching for nearby drivers...',
  subtext = 'Connecting you with the closest vehicle in Dhaka',
  onCancel,
  className = '',
  map: propMap,
}: SearchRadarOverlayProps) {
  const context = useMap();
  const map = propMap ?? context.map;
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // If center and map are provided, anchor animated radar marker at pickup point
  useEffect(() => {
    if (!active || !center || !map) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const [lat, lng] = Array.isArray(center)
      ? toLatLng(center)
      : [center.lat, center.lng];

    const [lon, latitude] = toLngLat(lat, lng);

    const el = document.createElement('div');
    el.className = 'radar-marker-anchor pointer-events-none relative flex items-center justify-center';
    el.innerHTML = `
      <div class="relative w-36 h-36 flex items-center justify-center">
        <!-- Concentric ripple rings -->
        <div class="absolute inset-0 rounded-full border border-emerald-500/60 bg-emerald-500/10 radar-ring-1"></div>
        <div class="absolute inset-0 rounded-full border border-emerald-500/40 bg-emerald-500/5 radar-ring-2"></div>
        <div class="absolute inset-0 rounded-full border border-emerald-400/20 bg-emerald-400/5 radar-ring-3"></div>
        <!-- Center pickup pulse dot -->
        <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10"></div>
      </div>
    `;

    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([lon, latitude])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [active, center, map]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes radar-expand {
          0% {
            transform: scale(0.25);
            opacity: 0.9;
          }
          70% {
            opacity: 0.4;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }
        .radar-ring-1 {
          animation: radar-expand 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .radar-ring-2 {
          animation: radar-expand 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite 0.8s;
        }
        .radar-ring-3 {
          animation: radar-expand 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite 1.6s;
        }
      `}</style>

      {/* Screen/container center radar rings when not anchored or as fallback */}
      {!center && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/60 bg-emerald-500/10 radar-ring-1" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 radar-ring-2" />
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 bg-emerald-400/5 radar-ring-3" />
            <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-xl z-10 animate-pulse" />
          </div>
        </div>
      )}

      {/* Searching HUD notification card */}
      <div
        className={`absolute bottom-6 inset-x-4 z-20 max-w-sm mx-auto ${className}`}
      >
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Spinning radar indicator */}
            <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
              <span className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                {title}
              </h4>
              <p className="text-xs text-slate-400 truncate">{subtext}</p>
            </div>
          </div>

          {onCancel && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors border border-slate-700"
              >
                Cancel Search
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchRadarOverlay;
