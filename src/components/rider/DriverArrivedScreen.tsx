'use client';

import React from 'react';
import { MapPin, CheckCircle2, Phone, MessageSquare, Car, Sparkles, Navigation } from 'lucide-react';

export interface DriverArrivedScreenProps {
  driverName: string;
  driverPlate: string;
  driverVehicle: string;
  driverRating?: number;
  pickupAddress?: string;
  onConfirmStartRide: () => void;
  onDriverConfirmStartRide?: () => void;
  onOpenChat?: () => void;
  onCall?: () => void;
  driverPhone?: string;
  isLoading?: boolean;
  className?: string;
}

export function DriverArrivedScreen({
  driverName,
  driverPlate,
  driverVehicle,
  driverRating = 4.8,
  pickupAddress = 'Your Pickup Point',
  onConfirmStartRide,
  onDriverConfirmStartRide,
  onOpenChat,
  onCall,
  driverPhone = '+8801711000001',
  isLoading = false,
  className = '',
}: DriverArrivedScreenProps) {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else if (typeof window !== 'undefined') {
      window.location.href = `tel:${driverPhone}`;
    }
  };

  return (
    <div
      className={`w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-5 text-white shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`}
    >
      {/* Top Arrival Status Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Driver Has Arrived!</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono">Ready for pickup</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-xs font-mono font-bold text-emerald-300">
          At Pickup
        </span>
      </div>

      {/* Pickup Location Reminder */}
      <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center gap-2.5 text-xs text-neutral-200">
        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
        <div className="truncate">
          <div className="text-[10px] text-neutral-400 uppercase font-mono">Waiting at location</div>
          <div className="font-semibold text-neutral-100 truncate">{pickupAddress}</div>
        </div>
      </div>

      {/* Driver & Vehicle Details */}
      <div className="flex items-center justify-between p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full bg-neutral-950 border-2 border-emerald-500 flex items-center justify-center text-lg font-black text-white shadow-md">
            {driverName.charAt(0)}
            <span className="absolute -bottom-1 -right-1 text-[10px] bg-neutral-900 border border-neutral-700 rounded-full px-1 text-emerald-400 font-mono">
              ★{driverRating.toFixed(1)}
            </span>
          </div>

          <div>
            <div className="font-bold text-sm text-neutral-100">{driverName}</div>
            <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
              <Car className="w-3 h-3 text-neutral-400" />
              <span>{driverVehicle}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-750 rounded-lg font-mono font-bold text-xs text-neutral-100 tracking-wider">
            {driverPlate}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Dhaka Metro</div>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCall}
          className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-750 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call Driver</span>
        </button>

        <button
          type="button"
          onClick={onOpenChat}
          className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-750 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chat</span>
        </button>
      </div>

      {/* Primary Confirmation Action: Start Ride */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onConfirmStartRide}
          disabled={isLoading}
          className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Starting Ride...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>I Have Met Driver • Start Ride</span>
            </>
          )}
        </button>

        {/* Secondary Action: Driver Confirmation option for demo */}
        {onDriverConfirmStartRide && (
          <button
            type="button"
            onClick={onDriverConfirmStartRide}
            disabled={isLoading}
            className="w-full py-2 px-3 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Driver-side Confirmation (Start Ride)</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default DriverArrivedScreen;
