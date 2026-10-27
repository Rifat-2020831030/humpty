'use client';

import React from 'react';

export interface DriverCardProps {
  driverName: string;
  driverPlate: string;
  driverVehicle?: string;
  driverRating?: number;
  driverPhone?: string;
  etaMinutes?: number;
  statusText?: string;
  onCall?: () => void;
  onOpenChat?: () => void;
  unreadChatCount?: number;
  className?: string;
}

export function DriverCard({
  driverName,
  driverPlate,
  driverVehicle = 'Dhaka Transport',
  driverRating = 4.8,
  driverPhone = '+8801711000001',
  etaMinutes = 5,
  statusText,
  onCall,
  onOpenChat,
  unreadChatCount = 0,
  className = '',
}: DriverCardProps) {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else if (typeof window !== 'undefined') {
      window.location.href = `tel:${driverPhone}`;
    }
  };

  return (
    <div
      className={`w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white shadow-xl ${className}`}
    >
      {/* Top Status & ETA Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            {statusText || 'Driver on the way'}
          </span>
        </div>
        <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs font-mono font-medium text-emerald-400">
          {etaMinutes <= 1 ? 'Arriving now' : `${etaMinutes} min away`}
        </div>
      </div>

      {/* Driver Profile Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Driver Avatar */}
          <div className="relative w-12 h-12 rounded-full bg-neutral-900 border-2 border-emerald-500 flex items-center justify-center text-lg font-bold text-neutral-100 shadow-md">
            {driverName.charAt(0)}
            <span className="absolute -bottom-1 -right-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded-full px-1 py-0.2 text-emerald-400 font-mono">
              ★{driverRating.toFixed(1)}
            </span>
          </div>

          <div>
            <div className="font-bold text-base text-neutral-100 flex items-center gap-1.5">
              <span>{driverName}</span>
            </div>
            <div className="text-xs text-neutral-400">{driverVehicle}</div>
          </div>
        </div>

        {/* License Plate Badge */}
        <div className="text-right">
          <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded-md font-mono font-bold text-xs text-neutral-200 tracking-wider">
            {driverPlate}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Metro Dhaka</div>
        </div>
      </div>

      {/* Call & Chat Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
        <button
          type="button"
          onClick={handleCall}
          className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <span>📞</span>
          <span>Call Driver</span>
        </button>

        <button
          type="button"
          onClick={onOpenChat}
          className="relative py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow"
        >
          <span>💬</span>
          <span>Chat</span>
          {unreadChatCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border-2 border-black text-[10px] font-bold flex items-center justify-center">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default DriverCard;
