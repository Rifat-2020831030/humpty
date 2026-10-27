'use client';

import React from 'react';
import { VehicleType } from '../../types';
import { SEED_DRIVERS } from '../../lib/constants';
import ServiceTiles from './ServiceTiles';
import OffersStrip from './OffersStrip';

export interface HomeScreenProps {
  selectedVehicle: VehicleType;
  onSelectVehicle: (type: VehicleType) => void;
  onOpenSearch: () => void;
  onApplyPromo?: (code: string) => void;
  userLocationName?: string;
  nearbyDriversCount?: number;
  className?: string;
  children?: React.ReactNode;
}

export function HomeScreen({
  selectedVehicle,
  onSelectVehicle,
  onOpenSearch,
  onApplyPromo,
  userLocationName = 'Dhaka City Center',
  nearbyDriversCount = SEED_DRIVERS.length,
  className = '',
  children,
}: HomeScreenProps) {
  return (
    <div
      className={`relative flex flex-col justify-between h-full w-full pointer-events-none ${className}`}
    >
      {/* Top Floating Glass Header Bar */}
      <header className="p-3 sm:p-3.5 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-xl flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow">
            G
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>GariKoi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dhaka Rideshare</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-neutral-900/90 border border-neutral-800 rounded-full text-[11px] font-mono text-emerald-400 flex items-center gap-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nearbyDriversCount} drivers nearby</span>
          </div>
        </div>
      </header>

      {/* Central Map Area (completely transparent and click-through) */}
      <div className="flex-1 pointer-events-none">{children}</div>

      {/* Bottom Floating Control Deck */}
      <div className="w-full p-3.5 sm:p-4 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/90 rounded-3xl shadow-2xl space-y-3 pointer-events-auto">
        {/* Destination Search Bar Pill */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between p-3.5 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-700/80 rounded-2xl text-left transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-sm font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors">
                Where to?
              </div>
              <div className="text-xs text-neutral-400 truncate max-w-xs">
                Pick up near {userLocationName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
            <span>🔍</span>
            <span>Search</span>
          </div>
        </button>

        {/* Service Tiles Selection */}
        <div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 px-0.5">
            Select Service
          </div>
          <ServiceTiles selected={selectedVehicle} onSelect={onSelectVehicle} />
        </div>

        {/* Offers Bar */}
        <div>
          <OffersStrip onApplyPromo={onApplyPromo} />
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
