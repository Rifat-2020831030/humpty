'use client';

import React from 'react';
import { VehicleType } from '../../types';
import { VEHICLE_RATES } from '../../lib/fare';

export interface SearchingOverlayProps {
  pickupAddress: string;
  dropoffAddress?: string;
  vehicleType: VehicleType;
  onCancel: () => void;
  className?: string;
}

export function SearchingOverlay({
  pickupAddress,
  dropoffAddress,
  vehicleType,
  onCancel,
  className = '',
}: SearchingOverlayProps) {
  const vehicle = VEHICLE_RATES[vehicleType];

  return (
    <div
      className={`w-full bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl flex flex-col items-center text-center ${className}`}
    >
      {/* Animated Radar Pulse Visual */}
      <div className="relative w-28 h-28 flex items-center justify-center my-3">
        {/* Radar Ring 1 */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-75" />
        {/* Radar Ring 2 */}
        <div className="absolute inset-3 rounded-full border border-emerald-500/50 animate-pulse" />
        {/* Center Vehicle Icon */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-neutral-900 border-2 border-emerald-500 flex items-center justify-center shadow-lg">
          <span className="text-3xl select-none" role="img" aria-label={vehicle.name}>
            {vehicle.icon}
          </span>
        </div>
      </div>

      {/* Driver Silhouettes indicating search */}
      <div className="flex items-center justify-center gap-3 my-2 text-neutral-500 text-xs">
        <span className="animate-pulse">🏍 Farhan</span>
        <span>•</span>
        <span className="animate-pulse text-emerald-400 font-medium">🛺 Karim (Nearby)</span>
        <span>•</span>
        <span className="animate-pulse">🚗 Rahim</span>
      </div>

      {/* Status Headlines */}
      <h3 className="text-lg font-bold text-neutral-100 mt-2">
        Connecting to nearby drivers
      </h3>
      <p className="text-xs text-neutral-400 mt-1 max-w-xs">
        Locating available {vehicle.name}s near{' '}
        <span className="text-neutral-200 font-medium">{pickupAddress}</span> in Dhaka
      </p>

      {dropoffAddress && (
        <div className="mt-3 text-[11px] text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 truncate max-w-xs">
          To: {dropoffAddress}
        </div>
      )}

      {/* Cancel Action */}
      <div className="w-full mt-6 pt-3 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-850 border border-neutral-700 text-neutral-300 hover:text-white font-medium text-sm rounded-xl transition-colors"
        >
          Cancel Request
        </button>
      </div>
    </div>
  );
}

export default SearchingOverlay;
