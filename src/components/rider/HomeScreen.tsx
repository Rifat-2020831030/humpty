'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Sparkles,
  Home as HomeIcon,
  Clock,
  Tag,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
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
  aiMode?: boolean;
  onToggleAi?: () => void;
  onSearchSubmit?: (query: string) => void;
}

const QUICK_DESTINATIONS = [
  { name: 'Gulshan 2', address: 'Gulshan 2 Circle, Dhaka' },
  { name: 'Banani 11', address: 'Road 11, Banani, Dhaka' },
  { name: 'Dhanmondi 27', address: 'Dhanmondi 27, Dhaka' },
  { name: 'Motijheel', address: 'Shapla Chattar, Motijheel' },
  { name: 'Airport', address: 'Hazrat Shahjalal Int. Airport' },
];

export function HomeScreen({
  selectedVehicle,
  onSelectVehicle,
  onOpenSearch,
  onApplyPromo,
  userLocationName = 'Dhaka City Center',
  nearbyDriversCount = SEED_DRIVERS.length,
  className = '',
  children,
  aiMode = false,
  onToggleAi,
  onSearchSubmit,
}: HomeScreenProps) {
  const [internalAiMode, setInternalAiMode] = useState<boolean>(aiMode);
  const [destinationInput, setDestinationInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'rides' | 'offers' | 'profile'>('home');

  const isAiActive = onToggleAi ? aiMode : internalAiMode;

  const handleToggleAi = () => {
    if (onToggleAi) {
      onToggleAi();
    } else {
      setInternalAiMode((prev) => !prev);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && destinationInput.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(destinationInput);
      } else {
        onOpenSearch();
      }
    }
  };

  const handleQuickDestinationClick = (address: string) => {
    setDestinationInput(address);
    if (onSearchSubmit) {
      onSearchSubmit(address);
    } else {
      onOpenSearch();
    }
  };

  return (
    <div
      className={`relative flex flex-col h-full w-full bg-black text-white select-none overflow-y-auto no-scrollbar ${className}`}
    >
      {/* Top Fixed / Floating Pathao-style Brand Header */}
      <header className="sticky top-0 z-30 px-4 py-3 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-900/30">
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
          <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nearbyDriversCount} drivers nearby</span>
          </div>
        </div>
      </header>

      {/* Main Home Dashboard Body (Pathao App Style) */}
      <main className="flex-1 px-4 py-3.5 space-y-4 max-w-md mx-auto w-full">
        {/* Current Pickup Location Banner */}
        <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block">
                Pickup Point
              </span>
              <span className="text-xs font-semibold text-white truncate block">
                {userLocationName}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50 shrink-0">
            GPS READY
          </span>
        </div>

        {/* Search Destination Field with AI Toggled */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-750 focus-within:border-emerald-500 rounded-2xl shadow-md transition-all">
            {/* MapPin Icon */}
            <div className="pl-2 text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>

            {/* Destination Input Field */}
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder={
                isAiActive
                  ? 'AI: e.g. "Take me to best biryani in Old Dhaka"...'
                  : 'Where to? Enter destination...'
              }
              className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 placeholder:text-xs outline-none py-1.5 px-1 truncate"
            />

            {/* AI Toggle Button */}
            <button
              type="button"
              onClick={handleToggleAi}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isAiActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400/50'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700'
              }`}
              title={isAiActive ? 'AI Search Active (Gemini)' : 'Click to enable AI Natural Language Search'}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiActive ? 'text-white animate-pulse' : 'text-neutral-400'}`} />
              <span className="text-[11px]">{isAiActive ? 'AI ON' : 'AI'}</span>
            </button>

            {/* Search Submit Action Button */}
            <button
              type="button"
              onClick={() => {
                if (destinationInput.trim() && onSearchSubmit) {
                  onSearchSubmit(destinationInput);
                } else {
                  onOpenSearch();
                }
              }}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl shadow-md transition-all shrink-0"
              aria-label="Search destination"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Destination Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => handleQuickDestinationClick(dest.address)}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-full text-[11px] text-neutral-300 hover:text-white font-medium whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
              >
                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Choosing Options: Bike, CNG, Car */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Select Service
            </h2>
            <span className="text-[10px] text-emerald-400/90 font-mono">Tap vehicle to open map</span>
          </div>
          <ServiceTiles selected={selectedVehicle} onSelect={onSelectVehicle} />
        </section>

        {/* 3-Card Auto-Shifting Offer Carousel (Every 5s) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Special Offers
            </h2>
            <span className="text-[10px] text-neutral-500 font-mono">Auto 5s</span>
          </div>
          <OffersStrip onApplyPromo={onApplyPromo} />
        </section>

        {/* Dhaka Rideshare Trust & Safety Card */}
        <div className="p-3 bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-white block">Safe & Utilitarian Rides</span>
              <span className="text-[11px] text-neutral-400 block">
                Cash in BDT • 24/7 Helpline • Dhaka Verified
              </span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">৳0 SURGE</span>
        </div>

        {children}
      </main>

      {/* Bottom Sticky Navigation Panel (Pathao Style) */}
      <nav className="sticky bottom-0 z-30 px-3 py-2 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-850 flex items-center justify-around max-w-md mx-auto w-full">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rides')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'rides' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px]">Activity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'offers' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span className="text-[10px]">Offers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default HomeScreen;
