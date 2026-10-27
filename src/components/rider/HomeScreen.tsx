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
    <div className={`relative flex flex-col h-full w-full bg-black text-white ${className}`}>
      {/* Top Header Bar */}
      <header className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow">
            G
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>GariKoi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dhaka Rideshare</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-neutral-900/90 border border-neutral-800 rounded-full text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nearbyDriversCount} drivers nearby</span>
          </div>
        </div>
      </header>

      {/* Central Map Area (passed via children or rendered as container) */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        {children}
      </div>

      {/* Bottom Floating Control Deck */}
      <div className="relative z-30 w-full p-4 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/90 rounded-t-3xl shadow-2xl space-y-3 pointer-events-auto">
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
