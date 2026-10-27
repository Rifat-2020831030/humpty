'use client';

import { useState, useCallback } from 'react';
import { LocationResult } from '../types';

export type LocationMode = 'search' | 'manual' | 'gps';

export const LOCATION_BADGES = {
  gps: 'Live GPS 🟢',
  manual: 'Manual Pin 📍',
  search: null,
} as const;

export interface UseLocationOptions {
  initialLocation?: LocationResult | null;
  initialMode?: LocationMode;
}

export interface UseLocationReturn {
  location: LocationResult | null;
  mode: LocationMode;
  error: string | null;
  isLoading: boolean;
  badgeText: string | null;
  requestGPS: () => Promise<void>;
  setManualPin: (lat: number, lng: number) => void;
  setAddressLocation: (lat: number, lng: number, address: string) => void;
  clearError: () => void;
  resetLocation: () => void;
}

function getNavigator(): Navigator | null {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator;
  }
  if (typeof navigator !== 'undefined') {
    return navigator;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).navigator) {
    return (globalThis as any).navigator;
  }
  return null;
}

/**
 * Flexible location hook for Rider and Driver interfaces.
 * Defaults to text search without forcing GPS permissions.
 *
 * Review Focus 1:
 * When GPS permission is denied or times out after clicking [📍 Use my GPS],
 * the hook sets an informative error state and safely remains in search mode
 * without throwing or blocking the booking flow.
 */
export function useLocation(options?: UseLocationOptions): UseLocationReturn {
  const [location, setLocation] = useState<LocationResult | null>(
    options?.initialLocation ?? null
  );
  const [mode, setMode] = useState<LocationMode>(options?.initialMode ?? 'search');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Set location via manual pin placement on the map.
   * Switches mode to 'manual' and clears previous errors.
   */
  const setManualPin = useCallback((lat: number, lng: number) => {
    setLocation({
      lat,
      lng,
      displayName: 'Manual Pin',
      address: 'Manual Pin',
    });
    setMode('manual');
    setError(null);
  }, []);

  /**
   * Set location via address autocomplete search.
   * Retains search mode and clears previous errors.
   */
  const setAddressLocation = useCallback(
    (lat: number, lng: number, address: string) => {
      setLocation({
        lat,
        lng,
        displayName: address,
        address,
      });
      setMode('search');
      setError(null);
    },
    []
  );

  /**
   * Explicit opt-in request for browser GPS position.
   * On success: snaps to coordinates and sets mode = 'gps'.
   * On denial / error / timeout: sets informative error, safely falls back
   * to search mode without throwing or blocking the user flow.
   */
  const requestGPS = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Guard: Geolocation API availability in browser/environment
    const nav = getNavigator();
    if (!nav || !nav.geolocation) {
      setIsLoading(false);
      setError('Geolocation is not supported by your browser. Please search or select location manually.');
      setMode('search');
      return;
    }

    return new Promise<void>((resolve) => {
      nav.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLocation({
            lat,
            lng,
            displayName: 'Current Location',
            address: 'Current Location',
            confidence: 1,
          });
          setMode('gps');
          setError(null);
          setIsLoading(false);
          resolve();
        },
        (geoError: GeolocationPositionError) => {
          let message = 'Unable to retrieve location. Please search or select manually.';

          // Review Focus 1: Map standard GeolocationPositionError error codes
          if (geoError) {
            switch (geoError.code) {
              case 1: // PERMISSION_DENIED
                message =
                  'Location permission denied. Please search or select location manually on the map.';
                break;
              case 2: // POSITION_UNAVAILABLE
                message =
                  'Current location is unavailable. Please search or select location manually.';
                break;
              case 3: // TIMEOUT
                message =
                  'Location request timed out. Please search or select location manually.';
                break;
              default:
                if (geoError.message) {
                  message = geoError.message;
                }
            }
          }

          setError(message);
          // Safely retain or revert to search mode to never block rider booking
          setMode('search');
          setIsLoading(false);
          // Resolve cleanly without throwing
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setMode('search');
    setError(null);
    setIsLoading(false);
  }, []);

  const badgeText = LOCATION_BADGES[mode];

  return {
    location,
    mode,
    error,
    isLoading,
    badgeText,
    requestGPS,
    setManualPin,
    setAddressLocation,
    clearError,
    resetLocation,
  };
}
