'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
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
  isInitiallyCollapsed?: boolean;
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
  isInitiallyCollapsed = false,
}: FareSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);

  const selectedRate = VEHICLE_RATES[selectedVehicle];
  const selectedFare = calculateFare(selectedVehicle, distanceKm);
  const selectedFinalFare = Math.max(0, selectedFare.totalFare - promoDiscount);

  return (
    <div
      className={`w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-4 text-white shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Top Collapsible Pull / Toggle Handle (Collapsible at any point) */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex flex-col items-center py-1 -mt-1 mb-2 group cursor-pointer focus:outline-none"
        aria-label={isCollapsed ? 'Expand vehicle carousel' : 'Collapse vehicle carousel'}
      >
        <div className="w-12 h-1 bg-neutral-700 group-hover:bg-neutral-500 rounded-full transition-colors mb-1" />
        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200">
          {isCollapsed ? (
            <>
              <span>Expand Carousel</span>
              <ChevronUp className="w-3 h-3 text-emerald-400" />
            </>
          ) : (
            <>
              <span>Collapse Map</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </>
          )}
        </div>
      </button>

      {/* Collapsed State: Compact Floating View (Minimal obstruction of the map) */}
      {isCollapsed ? (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-2xl" role="img" aria-label={selectedRate.name}>
              {selectedRate.icon}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-100">{selectedRate.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {distanceKm.toFixed(1)} km
                </span>
              </div>
              <div className="text-sm font-mono font-extrabold text-emerald-400">
                ৳{selectedFinalFare}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <span>Confirm</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Expanded State: Full Vehicle Options Carousel / Grid & Route Breakdown */
        <div>
          {/* Route Summary */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-850">
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
            <div className="mb-3 p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs space-y-1.5">
              {pickupAddress && (
                <div className="flex items-center gap-2 truncate text-neutral-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{pickupAddress}</span>
                </div>
              )}
              {dropoffAddress && (
                <div className="flex items-center gap-2 truncate text-neutral-300">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{dropoffAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* Vehicle Carousel Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {VEHICLE_TYPES.map((type) => {
              const rateInfo = VEHICLE_RATES[type];
              const isSelected = selectedVehicle === type;
              const fare = calculateFare(type, distanceKm);
              const finalFare = Math.max(0, fare.totalFare - promoDiscount);

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSelectVehicle(type)}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md text-white'
                      : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-850 text-neutral-400'
                  }`}
                >
                  <span className="text-2xl mb-1 select-none" role="img" aria-label={rateInfo.name}>
                    {rateInfo.icon}
                  </span>
                  <div className="font-semibold text-xs text-neutral-200">{rateInfo.name}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {rateInfo.seats} seat{rateInfo.seats > 1 ? 's' : ''}
                  </div>
                  <div className="mt-1 font-mono font-bold text-sm text-emerald-400">
                    ৳{finalFare}
                  </div>
                </button>
              );
            })}
          </div>

          {promoDiscount > 0 && (
            <div className="mb-3 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-mono">
              <span>Promo Discount Applied</span>
              <span className="font-bold">-৳{promoDiscount}</span>
            </div>
          )}

          {/* Confirm Ride CTA */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Finding Drivers...</span>
              </>
            ) : (
              <span>Confirm {VEHICLE_RATES[selectedVehicle].name}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default FareSelector;
