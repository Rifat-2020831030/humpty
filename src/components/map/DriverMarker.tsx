'use client';

import { useEffect, useRef } from 'react';
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
      // Auto-rickshaw (green 3-wheeler) SVG icon
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5.5" cy="17.5" r="2.5"/>
          <circle cx="17.5" cy="17.5" r="2.5"/>
          <path d="M8 17h7"/>
          <path d="M3 15h2l2-7h8l2 5h2"/>
          <path d="M7 10h6"/>
        </svg>
      `;
    case 'CAR':
      // Sedan car SVG icon
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      `;
    case 'BIKE':
    default:
      // Motorcycle SVG icon
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5" cy="16" r="3"/>
          <circle cx="19" cy="16" r="3"/>
          <path d="M12 16h-4l3-8 3 5 4-2"/>
          <path d="m14 11 2-5h3"/>
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

  // Initialize marker DOM element and attach to map
  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.id = id;
    el.className = 'driver-marker-container cursor-pointer select-none';

    // Utilitarian high-contrast vehicle badge with bearing indicator arrow
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <!-- Directional arrow pointer -->
        <div class="driver-marker-rotator transition-transform duration-300 ease-out" style="transform: rotate(${bearing}deg);">
          <div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400">
            ${getVehicleIconSvg(vehicleType)}
          </div>
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-emerald-400"></div>
        </div>
      </div>
    `;

    if (onClick) {
      el.addEventListener('click', onClick);
    }

    elementRef.current = el;
    iconWrapperRef.current = el.querySelector('.driver-marker-rotator') as HTMLDivElement;

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

  // Update bearing rotation
  useEffect(() => {
    if (iconWrapperRef.current) {
      iconWrapperRef.current.style.transform = `rotate(${bearing}deg)`;
    }
  }, [bearing]);

  // Smooth position interpolation on updates
  useEffect(() => {
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
  }, [lat, lng]);

  return null;
}

export default DriverMarker;
