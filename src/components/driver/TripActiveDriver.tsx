'use client';

import React, { useState, useEffect } from 'react';
import { ActiveRide } from '../../types';
import { formatBDT, calculateMeterFare, canCompleteTrip, canStartTrip } from './driverUtils';
import {
  MapPin,
  Play,
  CheckCircle,
  Clock,
  Compass,
  Phone,
  MessageSquare,
  CircleDollarSign,
  Gauge,
} from 'lucide-react';

export interface TripActiveDriverProps {
  ride: ActiveRide;
  driverLocation?: { lat: number; lng: number; bearing?: number } | null;
  onStartTrip?: () => void;
  onCompleteTrip: (fareFinal?: number) => void;
  onOpenChat?: () => void;
  isActionLoading?: boolean;
}

export function TripActiveDriver({
  ride,
  driverLocation,
  onStartTrip,
  onCompleteTrip,
  onOpenChat,
  isActionLoading = false,
}: TripActiveDriverProps) {
  const isArrived = ride.status === 'ARRIVED_AT_PICKUP';
  const isInProgress = ride.status === 'IN_PROGRESS';

  // Live trip simulation metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isInProgress) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInProgress]);

  // Progressive distance calculation for fare meter
  const progressRatio = Math.min(1, Math.max(0.1, elapsedSeconds / 180));
  const liveDistanceKm = Math.round(ride.distanceKm * progressRatio * 10) / 10;
  const liveMeterFare = calculateMeterFare(ride.vehicleType, liveDistanceKm);
  const displayFare = Math.max(ride.fareEstimate, liveMeterFare);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-neutral-950/95 border border-neutral-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 text-white">
      {/* Top Banner: Status & Live Fare Meter */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isInProgress ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'
            }`}
          />
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
            {isInProgress ? 'Trip In Progress' : 'Passenger Boarding'}
          </span>
        </div>

        {isInProgress && (
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-xs font-bold text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
        )}
      </div>

      {/* Live Fare Meter Display */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
            <CircleDollarSign className="w-4 h-4 text-emerald-500" />
            <span>Live Fare Meter</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {formatBDT(displayFare)}
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
            <Gauge className="w-3.5 h-3.5 text-neutral-400" />
            <span>Distance</span>
          </div>
          <div className="text-lg font-bold text-neutral-200 mt-1">
            {isInProgress ? `${liveDistanceKm} km` : `${ride.distanceKm} km`}
          </div>
        </div>
      </div>

      {/* Route Locations: Starting Position & Destination */}
      <div className="flex flex-col gap-2.5 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5">
        {/* Starting Position (changes from Pickup to Starting Position when trip starts) */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-7 h-7 rounded-full bg-amber-950/80 border border-amber-500/80 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">
              {isInProgress ? 'Starting Position' : 'Pickup Point'}
            </span>
            <span className="text-xs font-semibold text-neutral-200 mt-0.5 leading-snug truncate">
              {ride.pickupAddress}
            </span>
          </div>
        </div>

        {/* Destination Drop-off */}
        <div className="flex items-start gap-3 pt-2.5 border-t border-neutral-800/80">
          <div className="mt-0.5 w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/80 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider">
              Destination Drop-off
            </span>
            <span className="text-xs font-bold text-white mt-0.5 leading-snug">
              {ride.dropoffAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Card & Support */}
      <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-300">
            P
          </div>
          <div>
            <div className="text-xs font-bold text-white">Passenger on Board</div>
            <div className="text-[11px] text-neutral-400">
              Vehicle: {ride.vehicleType}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 cursor-pointer active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <a
            href="tel:+8801700000000"
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 cursor-pointer active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Main Workflow Action Buttons */}
      <div className="pt-1">
        {isArrived && onStartTrip ? (
          <button
            type="button"
            disabled={isActionLoading || !canStartTrip(ride.status)}
            onClick={onStartTrip}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-base rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer border border-emerald-500"
          >
            <Play className="w-5 h-5 fill-white stroke-none" />
            <span>START TRIP</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isActionLoading || !canCompleteTrip(ride.status)}
            onClick={() => onCompleteTrip(displayFare)}
            className={`w-full py-4 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-xl select-none ${
              canCompleteTrip(ride.status)
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.98] border border-emerald-500'
                : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            <span>COMPLETE TRIP</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default TripActiveDriver;
