'use client';

import React, { useState } from 'react';
import { VehicleType, VEHICLE_TYPES } from '../../types';
import { formatBDT } from './driverUtils';
import {
  Power,
  Car,
  Bike,
  Shield,
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface OnlineToggleProps {
  isOnline: boolean;
  onToggleOnline: (nextOnline: boolean) => void;
  selectedVehicle: VehicleType;
  onSelectVehicle?: (vehicle: VehicleType) => void;
  sessionEarnings?: number;
  completedTripsCount?: number;
  driverName?: string;
  isUpdating?: boolean;
  defaultCollapsed?: boolean;
}

const VEHICLE_LABELS: Record<
  VehicleType,
  { name: string; subtitle: string; icon: React.ReactNode }
> = {
  BIKE: {
    name: 'Bike',
    subtitle: 'Motorcycle',
    icon: <Bike className="w-5 h-5" />,
  },
  CNG: {
    name: 'CNG Auto',
    subtitle: '3-Wheeler',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
        <path d="M8 17h7" />
        <path d="M3 15h2l2-7h8l2 5h2" />
        <path d="M7 10h6" />
      </svg>
    ),
  },
  CAR: {
    name: 'Car',
    subtitle: 'Sedan AC',
    icon: <Car className="w-5 h-5" />,
  },
};

export function OnlineToggle({
  isOnline,
  onToggleOnline,
  selectedVehicle,
  onSelectVehicle,
  sessionEarnings = 0,
  completedTripsCount = 0,
  driverName = 'Captain',
  isUpdating = false,
  defaultCollapsed = false,
}: OnlineToggleProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);

  return (
    <div className="w-full bg-neutral-950/95 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3.5 sm:gap-4 text-white transition-all duration-300">
      {/* Top Drag Handle / Quick Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-label={isCollapsed ? 'Expand driver panel' : 'Collapse driver panel'}
        className="w-full flex items-center justify-center pt-0.5 pb-1 -mt-1 group cursor-pointer focus:outline-none"
      >
        <div className="w-10 h-1 bg-neutral-700 group-hover:bg-neutral-500 rounded-full transition-colors" />
      </button>

      {isCollapsed ? (
        /* Collapsed Compact View: Frees up map while keeping status & quick toggle visible */
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-200">
              {driverName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{driverName}</span>
                <Shield className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                {formatBDT(sessionEarnings)} • {completedTripsCount} trips
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                onToggleOnline(!isOnline);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isOnline
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${isOnline ? 'text-red-400' : 'text-white'}`} />
              <span>{isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand driver panel"
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition-colors"
              title="Expand control panel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded View */
        <>
          {/* Top Header: Driver Greeting, Status Pill & Collapse Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-neutral-200">
                {driverName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                  Driver Partner
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {driverName}
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Pill */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
                  isOnline
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'
                  }`}
                />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>

              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse driver panel"
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition-colors"
                title="Collapse control panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Session Earnings & Trips Stats Bar */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl p-3.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Today's Earnings</span>
              </div>
              <div className="text-xl font-extrabold text-white mt-1">
                {formatBDT(sessionEarnings)}
              </div>
            </div>

            <div className="flex flex-col border-l border-neutral-800 pl-3">
              <div className="text-xs text-neutral-400 font-medium">Completed Trips</div>
              <div className="text-xl font-extrabold text-neutral-100 mt-1">
                {completedTripsCount}{' '}
                <span className="text-xs font-normal text-neutral-400">trips</span>
              </div>
            </div>
          </div>

          {/* Vehicle Type Selector */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
              Select Vehicle Category
            </div>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((type) => {
                const isSelected = selectedVehicle === type;
                const meta = VEHICLE_LABELS[type];

                return (
                  <button
                    key={type}
                    type="button"
                    disabled={isOnline}
                    onClick={() => onSelectVehicle?.(type)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-neutral-900 border-emerald-600 text-white font-bold ring-1 ring-emerald-600'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    } ${isOnline ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  >
                    <div
                      className={`mb-1.5 ${
                        isSelected ? 'text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      {meta.icon}
                    </div>
                    <div className="text-xs font-bold leading-tight">{meta.name}</div>
                    <div className="text-[10px] text-neutral-500 leading-tight">
                      {meta.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
            {isOnline && (
              <div className="text-[11px] text-neutral-500 italic text-center">
                Go offline to change active vehicle category
              </div>
            )}
          </div>

          {/* Large GO ONLINE / GO OFFLINE Action Button */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onToggleOnline(!isOnline)}
            className={`w-full py-4 px-6 rounded-xl font-extrabold text-base tracking-wide flex items-center justify-center gap-3 transition-all select-none shadow-lg active:scale-[0.98] ${
              isOnline
                ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500'
            } ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
          >
            <Power className={`w-5 h-5 ${isOnline ? 'text-red-400' : 'text-white'}`} />
            <span>{isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
          </button>
        </>
      )}
    </div>
  );
}

export default OnlineToggle;
