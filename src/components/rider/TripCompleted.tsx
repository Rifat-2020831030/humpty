'use client';

import React from 'react';

export interface TripCompletedProps {
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  baseFare: number;
  distanceFare: number;
  totalFare: number;
  onPayCash: () => void;
  driverName?: string;
  className?: string;
}

export function TripCompleted({
  pickupAddress,
  dropoffAddress,
  distanceKm,
  baseFare,
  distanceFare,
  totalFare,
  onPayCash,
  driverName = 'Your Driver',
  className = '',
}: TripCompletedProps) {
  return (
    <div
      className={`w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl ${className}`}
    >
      {/* Success / Finished Header */}
      <div className="text-center pb-4 mb-4 border-b border-neutral-800">
        <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center mx-auto mb-2 text-emerald-400 text-xl font-bold">
          ✓
        </div>
        <h3 className="text-xl font-bold text-neutral-100">Trip Completed</h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          You have arrived safely at your destination with {driverName}
        </p>
      </div>

      {/* Origin & Destination Summary */}
      <div className="mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-neutral-400">From:</span>
          <span className="text-neutral-200 truncate font-medium">{pickupAddress}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-neutral-400">To:</span>
          <span className="text-neutral-200 truncate font-medium">{dropoffAddress}</span>
        </div>
        <div className="pt-1 text-[11px] text-neutral-500 flex items-center justify-between border-t border-neutral-800">
          <span>Road Distance</span>
          <span className="font-mono text-neutral-300">{distanceKm.toFixed(1)} km</span>
        </div>
      </div>

      {/* Fare Breakdown Card */}
      <div className="mb-5 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">
          Fare Breakdown
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Base Fare</span>
            <span className="font-mono text-neutral-200">৳{baseFare}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Distance Fare ({distanceKm.toFixed(1)} km)</span>
            <span className="font-mono text-neutral-200">৳{distanceFare}</span>
          </div>

          <div className="pt-2 mt-2 border-t border-neutral-800 flex items-center justify-between text-sm font-bold text-white">
            <span>Total Payable</span>
            <span className="text-xl font-mono text-emerald-400">৳{totalFare}</span>
          </div>
        </div>
      </div>

      {/* One-Tap Cash Payment Button */}
      <button
        type="button"
        onClick={onPayCash}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
      >
        <span>💵</span>
        <span>Pay ৳{totalFare} (Cash)</span>
      </button>

      <p className="text-[11px] text-center text-neutral-500 mt-2.5">
        Hand the exact cash amount in BDT (৳) to the driver.
      </p>
    </div>
  );
}

export default TripCompleted;
