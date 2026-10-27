'use client';

import React, { useEffect, useState, useRef } from 'react';
import { VehicleType } from '../../types';
import { formatBDT, calculateCountdownProgress } from './driverUtils';
import { MapPin, Navigation, X, Check, ArrowRight } from 'lucide-react';

export interface IncomingRideData {
  rideId: string;
  vehicleType: VehicleType;
  pickupAddress: string;
  dropoffAddress: string;
  fareEstimate: number;
  distanceKm: number;
  driverSessionId?: string | null;
}

export interface IncomingRideAlertProps {
  ride: IncomingRideData;
  countdownSeconds?: number;
  onAccept: (rideId: string) => void;
  onDecline: (rideId: string) => void;
  onTimeout?: (rideId: string) => void;
}

export function IncomingRideAlert({
  ride,
  countdownSeconds = 15,
  onAccept,
  onDecline,
  onTimeout,
}: IncomingRideAlertProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // SVG countdown ring geometry
  const radius = 34;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setSecondsLeft(countdownSeconds);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (onTimeout) {
            onTimeout(ride.rideId);
          } else {
            onDecline(ride.rideId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [ride.rideId, countdownSeconds, onTimeout, onDecline]);

  const { percentage, dashoffset } = calculateCountdownProgress(
    secondsLeft,
    countdownSeconds,
    circumference
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white">
        {/* Header: Dispatch Title & Animated Countdown Ring */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
              New Ride Request
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {formatBDT(ride.fareEstimate)}
              <span className="text-xs font-semibold text-neutral-400 ml-2">
                est. payout
              </span>
            </div>
          </div>

          {/* Countdown Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              {/* Background circle track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#262626"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active countdown circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={secondsLeft <= 5 ? '#ef4444' : '#006a4e'}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-lg font-black ${
                  secondsLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-neutral-100'
                }`}
              >
                {secondsLeft}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold -mt-1">
                sec
              </span>
            </div>
          </div>
        </div>

        {/* Trip Specs Bar */}
        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-300">
          <span className="font-bold text-white px-2 py-0.5 bg-neutral-800 rounded border border-neutral-700">
            {ride.vehicleType}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="font-semibold">{ride.distanceKm} km total trip</span>
          <span className="text-neutral-400">•</span>
          <span className="text-emerald-400 font-medium">Cash payment</span>
        </div>

        {/* Route Details Card */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-4">
          {/* Pickup Address */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Pickup Location
              </span>
              <span className="text-sm font-bold text-white truncate">
                {ride.pickupAddress}
              </span>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-neutral-800 ml-3 h-2" />

          {/* Destination Address */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Destination
              </span>
              <span className="text-sm font-bold text-neutral-200 truncate">
                {ride.dropoffAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Accept (Emerald Green) & Decline (Red / Neutral Dark) */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onDecline(ride.rideId)}
            className="py-4 px-4 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 border border-neutral-800 hover:border-red-900 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer select-none"
          >
            <X className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            type="button"
            onClick={() => onAccept(ride.rideId)}
            className="col-span-2 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 text-base transition-all shadow-xl cursor-pointer select-none border border-emerald-500"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>ACCEPT RIDE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingRideAlert;

