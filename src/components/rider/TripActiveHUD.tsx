'use client';

import React, { useState } from 'react';

export interface TripActiveHUDProps {
  driverName: string;
  vehiclePlate: string;
  currentFare: number;
  distanceTraveledKm: number;
  totalDistanceKm: number;
  onSOS: () => void;
  onOpenChat?: () => void;
  className?: string;
}

export function TripActiveHUD({
  driverName,
  vehiclePlate,
  currentFare,
  distanceTraveledKm,
  totalDistanceKm,
  onSOS,
  onOpenChat,
  className = '',
}: TripActiveHUDProps) {
  const [showSosModal, setShowSosModal] = useState(false);

  const percent = totalDistanceKm > 0
    ? Math.min(100, Math.round((distanceTraveledKm / totalDistanceKm) * 100))
    : 0;

  const handleSosTrigger = () => {
    setShowSosModal(true);
  };

  const handleConfirmEmergency = () => {
    setShowSosModal(false);
    onSOS();
  };

  return (
    <>
      <div
        className={`w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white shadow-2xl ${className}`}
      >
        {/* Top Header: In Progress & SOS Trigger */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Trip In Progress
            </span>
          </div>

          {/* SOS Floating / Top Emergency Button */}
          <button
            type="button"
            onClick={handleSosTrigger}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            <span>🚨</span>
            <span>SOS</span>
          </button>
        </div>

        {/* Live Fare Meter & Distance */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wide">Live Meter</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              ৳{currentFare}
            </div>
            <div className="text-[10px] text-neutral-500">Ticking with road distance</div>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wide">Distance</div>
            <div className="text-2xl font-bold font-mono text-neutral-100 mt-0.5">
              {distanceTraveledKm.toFixed(1)} km
            </div>
            <div className="text-[10px] text-neutral-500">of {totalDistanceKm.toFixed(1)} km target</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-900 rounded-full h-2 mb-3 overflow-hidden border border-neutral-800">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Driver Details & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Driver:</span>
            <span className="font-semibold text-neutral-200">{driverName}</span>
            <span className="font-mono text-neutral-400 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[11px]">
              {vehiclePlate}
            </span>
          </div>

          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 rounded-lg text-neutral-300 hover:text-white transition-colors"
            >
              💬 Chat
            </button>
          )}
        </div>
      </div>

      {/* SOS Emergency Confirmation Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-950 border border-red-700 rounded-2xl p-5 text-white shadow-2xl text-center">
            <div className="text-4xl mb-2">🚨</div>
            <h4 className="text-lg font-bold text-red-500">Emergency SOS Alert</h4>
            <p className="text-xs text-neutral-300 mt-2">
              Are you in immediate danger? This will immediately connect you with the National Emergency Service (999) and share your live GPS coordinates.
            </p>

            <div className="mt-5 space-y-2">
              <a
                href="tel:999"
                onClick={handleConfirmEmergency}
                className="w-full block py-2.5 px-4 bg-red-600 hover:bg-red-500 font-bold text-white text-sm rounded-xl transition-colors shadow"
              >
                Call 999 Dhaka Police / Medical
              </a>
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-full py-2 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-xl"
              >
                Cancel / False Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TripActiveHUD;
