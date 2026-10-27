'use client';

import React, { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      {/* Bottom Floating Control Deck - Collapsible */}
      <div className="w-full pointer-events-auto transition-all duration-300 ease-in-out">
        {isCollapsed ? (
          /* Collapsed Mini Deck */
          <div className="p-2.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/90 rounded-2xl shadow-2xl flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-700/80 rounded-xl text-left transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1 truncate">
                <span className="text-xs font-semibold text-white">Where to?</span>
                <span className="text-[11px] text-neutral-400 ml-1.5 truncate">
                  {userLocationName}
                </span>
              </div>
              <span className="text-xs text-neutral-400">🔍</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Expand ride options"
            >
              <span>Ride</span>
              <span>▲</span>
            </button>
          </div>
        ) : (
          /* Expanded Full Deck */
          <div className="p-3.5 sm:p-4 bg-neutral-950/95 backdrop-blur-md border border-neutral-800/90 rounded-3xl shadow-2xl space-y-3">
            {/* Top Pull / Collapse Handle */}
            <div
              className="flex items-center justify-center -mt-1 pb-1 cursor-pointer group"
              onClick={() => setIsCollapsed(true)}
              title="Click to collapse deck"
            >
              <div className="w-10 h-1 bg-neutral-700 group-hover:bg-neutral-500 rounded-full transition-colors" />
            </div>

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
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Select Service
                </div>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 font-medium flex items-center gap-1"
                >
                  <span>Collapse</span>
                  <span>▼</span>
                </button>
              </div>
              <ServiceTiles selected={selectedVehicle} onSelect={onSelectVehicle} />
            </div>

            {/* Offers Bar */}
            <div>
              <OffersStrip onApplyPromo={onApplyPromo} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
