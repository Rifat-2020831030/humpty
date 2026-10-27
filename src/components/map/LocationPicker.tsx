'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { DHAKA_CENTER } from '../../lib/constants';
import { toLatLng } from './mapUtils';
import MapBase, { useMap } from './MapBase';

export interface LocationPickerProps {
  onPinChange?: (location: { lat: number; lng: number }) => void;
  currentPin?: { lat: number; lng: number } | [number, number] | null;
  onConfirm?: (location: { lat: number; lng: number }) => void;
  confirmText?: string;
  className?: string;
  showBadge?: boolean;
  label?: string;
  draggable?: boolean;
}

export function LocationPicker({
  onPinChange,
  currentPin,
  onConfirm,
  confirmText = 'Confirm Pickup Location',
  className = 'w-full h-full min-h-[350px]',
  showBadge = true,
  label = 'Pickup',
  draggable = true,
}: LocationPickerProps) {
  const context = useMap();
  const isInParentMap = !!context.isInMapBase;

  const initialCoords = currentPin
    ? Array.isArray(currentPin)
      ? toLatLng(currentPin)
      : [currentPin.lat, currentPin.lng]
    : DHAKA_CENTER;

  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number }>({
    lat: initialCoords[0],
    lng: initialCoords[1],
  });

  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onPinChangeRef = useRef(onPinChange);
  onPinChangeRef.current = onPinChange;

  // Sync external pin updates
  useEffect(() => {
    if (!currentPin) return;
    const [lat, lng] = Array.isArray(currentPin)
      ? toLatLng(currentPin)
      : [currentPin.lat, currentPin.lng];

    setPinPosition({ lat, lng });

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [currentPin]);

  // When inside a MapBase and map instance exists: attach maplibregl.Marker
  useEffect(() => {
    if (!isInParentMap || !context.map) return;
    const map = context.map;

    const el = document.createElement('div');
    el.className =
      'location-picker-pin flex flex-col items-center cursor-grab active:cursor-grabbing select-none';
    el.innerHTML = `
      <div class="px-2 py-0.5 mb-1 bg-black border border-white/80 rounded-md shadow-lg text-[11px] font-bold text-white whitespace-nowrap font-mono">
        ${label}
      </div>
      <div class="w-8 h-8 rounded-full bg-black border-2 border-white shadow-2xl flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div class="w-2 h-2 -mt-1 rotate-45 bg-black border-r-2 border-b-2 border-white"></div>
    `;

    const marker = new maplibregl.Marker({
      element: el,
      draggable: Boolean(draggable),
      anchor: 'bottom',
    })
      .setLngLat([pinPosition.lng, pinPosition.lat])
      .addTo(map);

    if (draggable) {
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const updated = { lat: lngLat.lat, lng: lngLat.lng };
        setPinPosition(updated);
        if (onPinChangeRef.current) {
          onPinChangeRef.current(updated);
        }
      });
    }

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [isInParentMap, context.map, label, draggable]);

  const handleStandaloneMapClick = (coords: { lat: number; lng: number }) => {
    setPinPosition(coords);
    if (markerRef.current) {
      markerRef.current.setLngLat([coords.lng, coords.lat]);
    }
    if (onPinChangeRef.current) {
      onPinChangeRef.current(coords);
    }
  };

  // IF inside parent MapBase:
  if (isInParentMap) {
    // If WebGL is not available (2D fallback mode)
    if (!context.map && context.project) {
      const pos = context.project(pinPosition);
      if (!pos) return null;
      return (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-20 transition-all duration-200"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="px-2 py-0.5 mb-1 bg-black border border-white/80 rounded-md shadow-lg text-[11px] font-bold text-white whitespace-nowrap font-mono">
              {label}
            </div>
            <div className="w-8 h-8 rounded-full bg-black border-2 border-white shadow-2xl flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="w-2 h-2 -mt-1 rotate-45 bg-black border-r-2 border-b-2 border-white" />
          </div>
        </div>
      );
    }
    // In WebGL mode, the marker is attached to the parent map via markerRef, so return null
    return null;
  }

  // IF STANDALONE (not inside MapBase): render standalone MapBase container
  return (
    <div className={`relative ${className}`}>
      <MapBase
        center={[pinPosition.lat, pinPosition.lng]}
        zoom={14}
        interactive={true}
        onMapClick={handleStandaloneMapClick}
      />

      {showBadge && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-neutral-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-neutral-700 backdrop-blur-sm pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Manual Pin 📍</span>
          <span className="text-neutral-400 font-normal">
            | Drag pin or tap map
          </span>
        </div>
      )}

      {onConfirm && (
        <div className="absolute bottom-6 inset-x-4 z-10 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => onConfirm(pinPosition)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>{confirmText}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
