'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { VehicleType } from '../../types';
import { useMap } from './MapBase';
import { interpolatePosition, toLatLng, toLngLat } from './mapUtils';

export interface DriverMarkerProps {
  position: { lat: number; lng: number } | [number, number];
  bearing?: number;
  vehicleType?: VehicleType;
  id?: string;
  onClick?: () => void;
  map?: maplibregl.Map | null;
}

function getVehicleIconSvg(type: VehicleType = 'BIKE'): string {
  switch (type) {
    case 'CNG':
      // Lucide CarTaxiFront icon (proper standard icon)
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 2h4"/>
          <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.6 5H8.4a2 2 0 0 0-1.9 1.3L5 10 3 8"/>
          <path d="M7 14h.01"/>
          <path d="M17 14h.01"/>
          <rect width="18" height="8" x="3" y="10" rx="2"/>
          <path d="M5 18v2"/>
          <path d="M19 18v2"/>
        </svg>
      `;
    case 'CAR':
      // Lucide Car icon (proper standard icon)
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      `;
    case 'BIKE':
    default:
      // Lucide Bike icon (proper standard icon)
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="15" cy="5" r="1"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      `;
  }
}

export function DriverMarker({
  position,
  bearing = 0,
  vehicleType = 'BIKE',
  id = 'driver-marker',
  onClick,
  map: propMap,
}: DriverMarkerProps) {
  const context = useMap();
  const map = propMap ?? context.map;

  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const iconWrapperRef = useRef<HTMLDivElement | null>(null);

  const prevPosRef = useRef<[number, number]>(
    Array.isArray(position) ? toLatLng(position) : [position.lat, position.lng]
  );
  const targetPosRef = useRef<[number, number]>(prevPosRef.current);
  const animFrameRef = useRef<number | null>(null);

  const [lat, lng] = Array.isArray(position)
    ? toLatLng(position)
    : [position.lat, position.lng];

  // Initialize WebGL marker DOM element and attach to map
  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.id = id;
    el.className = 'driver-marker-container cursor-pointer select-none';

    // Black & white high-contrast vehicle badge with directional pointer
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <!-- Directional pointer -->
        <div class="driver-marker-rotator transition-transform duration-300 ease-out" style="transform: rotate(${bearing}deg);">
          <div class="w-10 h-10 rounded-full bg-black border-2 border-white shadow-2xl flex items-center justify-center text-white">
            ${getVehicleIconSvg(vehicleType)}
          </div>
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-white"></div>
        </div>
      </div>
    `;

    if (onClick) {
      el.addEventListener('click', onClick);
    }

    elementRef.current = el;
    iconWrapperRef.current = el.querySelector(
      '.driver-marker-rotator'
    ) as HTMLDivElement;

    const [currentLng, currentLat] = toLngLat(lat, lng);
    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([currentLng, currentLat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      marker.remove();
      markerRef.current = null;
      elementRef.current = null;
      iconWrapperRef.current = null;
    };
  }, [map, vehicleType, id]);

  // Update bearing rotation in WebGL mode
  useEffect(() => {
    if (iconWrapperRef.current) {
      iconWrapperRef.current.style.transform = `rotate(${bearing}deg)`;
    }
  }, [bearing]);

  // Smooth position interpolation on updates in WebGL mode
  useEffect(() => {
    if (!map) return;
    const nextPos: [number, number] = [lat, lng];
    const prevPos = targetPosRef.current;
    targetPosRef.current = nextPos;

    if (!markerRef.current) return;

    // If change is very small or first render, jump immediately
    const dist =
      Math.abs(nextPos[0] - prevPos[0]) + Math.abs(nextPos[1] - prevPos[1]);
    if (dist < 0.00001) {
      const [finalLng, finalLat] = toLngLat(nextPos[0], nextPos[1]);
      markerRef.current.setLngLat([finalLng, finalLat]);
      return;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const duration = 600; // ms for tick transition
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth linear interpolation along the tick
      const [interpLat, interpLng] = interpolatePosition(
        prevPos,
        nextPos,
        progress
      );
      const [lngVal, latVal] = toLngLat(interpLat, interpLng);

      if (markerRef.current) {
        markerRef.current.setLngLat([lngVal, latVal]);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevPosRef.current = nextPos;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [lat, lng, map]);

  // Fallback 2D render if map is null but context.project exists
  if (!map && context.project) {
    const coords = context.project({ lat, lng });
    if (!coords) return null;
    return (
      <div
        id={id}
        onClick={onClick}
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 pointer-events-auto"
        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
      >
        <div
          className="transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${bearing}deg)` }}
        >
          <div className="w-9 h-9 rounded-full bg-black border-2 border-white shadow-2xl flex items-center justify-center text-white">
            <div
              dangerouslySetInnerHTML={{
                __html: getVehicleIconSvg(vehicleType),
              }}
            />
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-white" />
        </div>
      </div>
    );
  }

  return null;
}

export default DriverMarker;
