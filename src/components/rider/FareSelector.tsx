'use client';

import React from 'react';
import { VehicleType, VEHICLE_TYPES } from '../../types';
import { calculateFare, VEHICLE_RATES } from '../../lib/fare';

export interface FareSelectorProps {
  distanceKm: number;
  selectedVehicle: VehicleType;
  onSelectVehicle: (type: VehicleType) => void;
  onConfirm: () => void;
  pickupAddress?: string;
  dropoffAddress?: string;
  promoDiscount?: number;
  isLoading?: boolean;
  className?: string;
}

export function FareSelector({
  distanceKm,
  selectedVehicle,
  onSelectVehicle,
  onConfirm,
  pickupAddress,
  dropoffAddress,
  promoDiscount = 0,
  isLoading = false,
  className = '',
}: FareSelectorProps) {
  return (
    <div className={`w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white shadow-2xl ${className}`}>
      {/* Route Summary */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <div>
          <div className="text-xs text-neutral-400">Estimated Trip Distance</div>
          <div className="text-lg font-bold text-neutral-100 font-mono">
            {distanceKm.toFixed(1)} km
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-400">Payment Method</div>
          <div className="text-sm font-semibold text-emerald-400 flex items-center justify-end gap-1">
            <span>💵</span>
            <span>Cash in BDT (৳)</span>
          </div>
        </div>
      </div>

      {(pickupAddress || dropoffAddress) && (
        <div className="mb-3 p-2 bg-neutral-900 border border-neutral-800/80 rounded-lg text-xs space-y-1">
          {pickupAddress && (
            <div className="flex items-center gap-2 truncate text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="truncate">{pickupAddress}</span>
            </div>
          )}
          {dropoffAddress && (
            <div className="flex items-center gap-2 truncate text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="truncate">{dropoffAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* 3 Vehicle Cards */}
      <div className="space-y-2 mb-4">
        {VEHICLE_TYPES.map((type) => {
          const rateInfo = VEHICLE_RATES[type];
          const breakdown = calculateFare(type, distanceKm);
          const finalFare = Math.max(0, breakdown.totalFare - promoDiscount);
          const isSelected = selectedVehicle === type;
          const etaMinutes = Math.max(3, Math.round((distanceKm / rateInfo.speedKmh) * 60));

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectVehicle(type)}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 text-white'
                  : 'bg-neutral-950 hover:bg-neutral-900/60 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none" role="img" aria-label={rateInfo.name}>
                  {rateInfo.icon}
                </span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-neutral-100">{rateInfo.name}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      👤 {rateInfo.seats} seat{rateInfo.seats > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Est. {etaMinutes} min trip • 3-5 min pickup
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-bold font-mono text-emerald-400">
                  ৳{finalFare}
                </div>
                {promoDiscount > 0 && (
                  <div className="text-[10px] text-neutral-500 line-through">
                    ৳{breakdown.totalFare}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold text-base rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <span>Requesting ride...</span>
        ) : (
          <span>Confirm {VEHICLE_RATES[selectedVehicle].name} Ride</span>
        )}
      </button>
    </div>
  );
}

export default FareSelector;
