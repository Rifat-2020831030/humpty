'use client';

import React from 'react';
import { ActiveRide, RideStatus } from '../../types';
import { formatBDT, canMarkArrived } from './driverUtils';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
} from 'lucide-react';

export interface NavigateToPickupProps {
  ride: ActiveRide;
  driverLocation?: { lat: number; lng: number; bearing?: number } | null;
  onStartNavigation?: () => void;
  onArrived: () => void;
  onCancel?: () => void;
  onOpenChat?: () => void;
  isActionLoading?: boolean;
}

export function NavigateToPickup({
  ride,
  driverLocation,
  onStartNavigation,
  onArrived,
  onCancel,
  onOpenChat,
  isActionLoading = false,
}: NavigateToPickupProps) {
  const isEnRoute = ride.status === 'DRIVER_EN_ROUTE';
  const isAssigned = ride.status === 'DRIVER_ASSIGNED';

  // Distance estimation (approx 1.2 km or ride distance fraction)
  const pickupDistanceKm = (ride.distanceKm * 0.25).toFixed(1);
  const pickupEtaMin = Math.max(2, Math.round(Number(pickupDistanceKm) * 3));

  return (
    <div className="w-full bg-neutral-950/95 border border-neutral-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 text-white">
      {/* Top Bar: Navigation State & ETA */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
            {isEnRoute ? 'Heading to Pickup' : 'Ride Accepted'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-xs font-bold text-neutral-200">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>~{pickupEtaMin} mins</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">{pickupDistanceKm} km</span>
        </div>
      </div>

      {/* Pickup Location Card */}
      <div className="flex items-start gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5">
        <div className="mt-0.5 w-7 h-7 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Passenger Pickup Point
          </span>
          <span className="text-sm font-bold text-white mt-0.5 leading-snug">
            {ride.pickupAddress}
          </span>
        </div>
      </div>

      {/* Passenger Info & Communication Actions */}
      <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-300">
            P
          </div>
          <div>
            <div className="text-xs font-bold text-white">Passenger</div>
            <div className="text-[11px] text-neutral-400">
              Trip Fare: {formatBDT(ride.fareEstimate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 cursor-pointer active:scale-95 transition-all"
              title="Message Passenger"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <a
            href="tel:+8801700000000"
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 cursor-pointer active:scale-95 transition-all"
            title="Call Passenger"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Main Workflow Action Button */}
      <div className="flex flex-col gap-2 pt-1">
        {isAssigned && onStartNavigation ? (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={onStartNavigation}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-base rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer border border-emerald-500"
          >
            <Navigation className="w-5 h-5" />
            <span>START NAVIGATION</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isActionLoading || !canMarkArrived(ride.status)}
            onClick={onArrived}
            className={`w-full py-4 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-xl select-none ${
              canMarkArrived(ride.status)
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.98] border border-emerald-500'
                : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>I'VE ARRIVED AT PICKUP</span>
          </button>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-red-400 transition-colors text-center cursor-pointer"
          >
            Cancel Ride Request
          </button>
        )}
      </div>
    </div>
  );
}

export default NavigateToPickup;
