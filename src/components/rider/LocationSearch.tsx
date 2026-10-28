'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles, ArrowLeft, Check, Compass, Search, Clock, Map } from 'lucide-react';
import { VehicleType } from '../../types';

export interface LocationSuggestion {
  displayName: string;
  lat: number;
  lng: number;
  category?: string;
}

export interface LocationSearchProps {
  pickupText: string;
  dropoffText: string;
  onPickupChange: (val: string) => void;
  onDropoffChange: (val: string) => void;
  onUseGPS: () => void;
  onSelectManually: () => void;
  onSelectDropoffManually?: () => void;
  aiMode: boolean;
  onToggleAI: () => void;
  onSubmitSearch?: () => void;
  onSelectSuggestion?: (item: any) => void;
  onShowOnMap?: (item: any) => void;
  suggestions?: any[];
  pickupSuggestions?: LocationSuggestion[];
  onSelectPickupSuggestion?: (item: any) => void;
  initialFocusField?: 'pickup' | 'dropoff';
  isAiSearched?: boolean;
  error?: string | null;
  isLoading?: boolean;
  onClearError?: () => void;
  className?: string;
  onBack?: () => void;
  selectedVehicle?: VehicleType;
  onConfirm?: () => void;
}

const DEFAULT_RECENT_SEARCHES: LocationSuggestion[] = [
  { displayName: 'Banani Road 11, Dhaka', lat: 23.7901, lng: 90.4062, category: 'Food & Shopping' },
  { displayName: 'Gulshan 2 Circle, Dhaka', lat: 23.7938, lng: 90.4143, category: 'Commercial Hub' },
  { displayName: 'Dhanmondi 27, Dhaka', lat: 23.7461, lng: 90.3742, category: 'Residential' },
  { displayName: 'Jamuna Future Park, Kuril, Dhaka', lat: 23.8135, lng: 90.4242, category: 'Shopping Mall' },
  { displayName: 'Hazrat Shahjalal International Airport', lat: 23.8433, lng: 90.4029, category: 'Transit' },
];

const DEFAULT_DHAKA_PICKUPS: LocationSuggestion[] = [
  { displayName: 'Mohakhali, Dhaka', lat: 23.778363865941, lng: 90.39804578897022, category: 'Default Hub' },
  { displayName: 'Mohakhali DOHS, Dhaka', lat: 23.7845, lng: 90.3920, category: 'Residential' },
  { displayName: 'Mohakhali Bus Terminal, Dhaka', lat: 23.7770, lng: 90.3985, category: 'Transit Hub' },
  { displayName: 'Banani Road 11, Dhaka', lat: 23.7901, lng: 90.4062, category: 'Commercial' },
  { displayName: 'Gulshan 1 Circle, Dhaka', lat: 23.7788, lng: 90.4172, category: 'Commercial' },
  { displayName: 'Gulshan 2 Circle, Dhaka', lat: 23.7938, lng: 90.4143, category: 'Commercial' },
  { displayName: 'Dhanmondi 27, Dhaka', lat: 23.7461, lng: 90.3742, category: 'Residential' },
  { displayName: 'Farmgate Bus Stand, Dhaka', lat: 23.7697, lng: 90.3871, category: 'Transit' },
  { displayName: 'Kawran Bazar, Dhaka', lat: 23.7516, lng: 90.3938, category: 'Commercial' },
  { displayName: 'Uttara Sector 3, Dhaka', lat: 23.8729, lng: 90.3984, category: 'Transit' },
  { displayName: 'Mirpur 10 Circle, Dhaka', lat: 23.8069, lng: 90.3687, category: 'Transit' },
  { displayName: 'Bashundhara R/A, Dhaka', lat: 23.8151, lng: 90.4255, category: 'Residential' },
];

export function LocationSearch({
  pickupText,
  dropoffText,
  onPickupChange,
  onDropoffChange,
  onUseGPS,
  onSelectManually,
  onSelectDropoffManually,
  aiMode,
  onToggleAI,
  onSubmitSearch,
  onSelectSuggestion,
  onShowOnMap,
  suggestions = [],
  pickupSuggestions,
  onSelectPickupSuggestion,
  initialFocusField,
  isAiSearched = false,
  error,
  isLoading = false,
  onClearError,
  className = '',
  onBack,
  selectedVehicle = 'BIKE',
  onConfirm,
}: LocationSearchProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isPickupOverlayOpen, setIsPickupOverlayOpen] = useState<boolean>(false);
  const pickupInputRef = React.useRef<HTMLInputElement | null>(null);
  const pickupContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Focus pickup input on mount if initialFocusField is set to 'pickup'
  React.useEffect(() => {
    if (initialFocusField === 'pickup' && pickupInputRef.current) {
      pickupInputRef.current.focus();
      setIsPickupOverlayOpen(true);
    }
  }, [initialFocusField]);

  // Click outside listener for pickup overlay
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        pickupContainerRef.current &&
        !pickupContainerRef.current.contains(e.target as Node)
      ) {
        setIsPickupOverlayOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter pickup suggestions based on current pickupText
  const activePickupSuggestions = React.useMemo(() => {
    const pool =
      pickupSuggestions && pickupSuggestions.length > 0
        ? pickupSuggestions
        : DEFAULT_DHAKA_PICKUPS;
    const query = pickupText.trim().toLowerCase();
    if (!query) return pool.slice(0, 6);
    return pool
      .filter((p) => p.displayName.toLowerCase().includes(query))
      .slice(0, 6);
  }, [pickupSuggestions, pickupText]);

  const handleSelectPickupItem = (item: LocationSuggestion) => {
    onPickupChange(item.displayName);
    if (onSelectPickupSuggestion) {
      onSelectPickupSuggestion(item);
    }
    setIsPickupOverlayOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSubmitSearch) {
      onSubmitSearch();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  const handleSuggestionClick = (item: any, idx: number) => {
    setSelectedIdx(idx);
    onDropoffChange(item.displayName || item.name);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
  };

  const handleShowOnMapClick = (item: any, idx: number) => {
    setSelectedIdx(idx);
    onDropoffChange(item.displayName || item.name);
    if (onShowOnMap) {
      onShowOnMap(item);
    } else {
      if (onSelectSuggestion) {
        onSelectSuggestion(item);
      }
      if (onConfirm) {
        onConfirm();
      }
    }
  };

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onSubmitSearch) {
      onSubmitSearch();
    }
  };

  // Determine list of places to display:
  // If AI search was performed or suggestions were explicitly provided and non-empty, use them;
  // otherwise default to recent searches for both modes.
  const displayPlaces =
    suggestions && suggestions.length > 0 ? suggestions : DEFAULT_RECENT_SEARCHES;

  const isShowingAiResults = isAiSearched || (aiMode && suggestions.length > 0 && dropoffText.trim().length > 0);

  return (
    <div
      className={`w-full min-h-screen bg-black text-white flex flex-col justify-between select-none ${className}`}
    >
      {/* Top Header - Single clean header without duplicate AI toggle */}
      <div className="p-4 bg-neutral-950/95 border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-1 text-neutral-400 hover:text-white rounded-xl bg-neutral-900 border border-neutral-800 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-extrabold text-white">Trip Locations</h2>
            <p className="text-[10px] text-neutral-400 font-mono">Dhaka City</p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-neutral-400">
          Step 1 of 2
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* GPS Error Notification if any */}
        {error && (
          <div className="p-3 bg-neutral-900 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-start justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="text-neutral-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top 2 Search Options Container */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-3.5 shadow-xl">
            {/* 1. Pickup Input & Live / Manual Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pickup Point</span>
              </label>

              <div ref={pickupContainerRef} className="relative">
                <input
                  ref={pickupInputRef}
                  type="text"
                  value={pickupText}
                  onChange={(e) => {
                    onPickupChange(e.target.value);
                    setIsPickupOverlayOpen(true);
                  }}
                  onFocus={() => setIsPickupOverlayOpen(true)}
                  placeholder="Search pickup location (e.g. Mohakhali, Banani)..."
                  className="w-full bg-neutral-900 border border-neutral-750 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
                />

                {/* Pickup Suggestions Dropdown Overlay */}
                {isPickupOverlayOpen && activePickupSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-neutral-950 border border-neutral-750 rounded-2xl shadow-2xl backdrop-blur-md divide-y divide-neutral-850">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 bg-neutral-900/50">
                      Suggested Pickup Points
                    </div>
                    {activePickupSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectPickupItem(item);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-neutral-850 active:bg-neutral-800 flex items-center justify-between gap-2.5 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-semibold text-neutral-200 group-hover:text-emerald-300 block truncate">
                              {item.displayName}
                            </span>
                            <span className="text-[10px] text-neutral-500 block truncate">
                              {item.category || 'Dhaka Location'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Set Pickup
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Options to Choose: Live Location or Manual Location */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onUseGPS}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-750 hover:border-emerald-500/50 rounded-xl text-xs font-semibold text-emerald-400 transition-all shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>Use my GPS</span>
                </button>
                <button
                  type="button"
                  onClick={onSelectManually}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-750 hover:border-neutral-600 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>Select Manually</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-neutral-850 w-full" />

            {/* 2. Destination Input with the ONLY AI Search Toggle Option Above Search Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Destination</span>
                </label>

                {/* THE ONLY AI TOGGLE OPTION: Positioned right above the search bar */}
                <button
                  type="button"
                  onClick={onToggleAI}
                  aria-pressed={aiMode}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-colors border ${
                    aiMode
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                  title={aiMode ? 'AI Search Active' : 'Enable AI Search'}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-bold">[AI]</span>
                  <span className="text-[11px]">{aiMode ? 'AI Mode ON' : 'Standard'}</span>
                </button>
              </div>

              {/* Destination Search Box with dynamic Search button based on mode */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                    {aiMode ? (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={dropoffText}
                    onChange={(e) => onDropoffChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={
                      aiMode
                        ? "Ask AI: 'Old Dhaka Biryani' or 'Behind Gulshan 2 KFC'"
                        : "Where to? (e.g. Dhanmondi 27, Gulshan 2, Motijheel)"
                    }
                    className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-all ${
                      aiMode
                        ? 'border-emerald-600 focus:border-emerald-400 ring-1 ring-emerald-600/30'
                        : 'border-neutral-750 focus:border-emerald-500'
                    }`}
                  />
                </div>

                {/* Search Button: shows 'AI Search' text or Search icon based on AI toggle */}
                {aiMode ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className="px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-950/40"
                    title="Search with Gemini AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Search</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className="px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 text-neutral-200 border border-neutral-750"
                    title="Search location"
                  >
                    <Search className="w-4 h-4 text-neutral-300" />
                    <span>Search</span>
                  </button>
                )}
              </div>

              {/* Pin Destination Manually Option */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={onSelectDropoffManually || onSelectManually}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>Pin Destination on Map</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggested Places: Default is Recent Searches for both modes, or Gemini AI suggestions when searched */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              {isShowingAiResults ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gemini AI Suggestions</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Recent Searches</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {isLoading ? 'Searching...' : isShowingAiResults ? 'AI Results' : 'Recent Places'}
            </span>
          </div>

          {isLoading ? (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-center gap-2.5 text-xs text-emerald-400 font-mono">
              <span className="w-4 h-4 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <span>Calling Gemini AI for Dhaka places...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {displayPlaces.map((item, idx) => {
                const name = item.displayName || item.name;
                const isSelected = selectedIdx === idx || dropoffText === name;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(item, idx)}
                    className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md'
                        : 'bg-neutral-950 hover:bg-neutral-900/80 border-neutral-850 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {/* Left: Icon & Place Description */}
                    <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}
                      >
                        {isShowingAiResults ? (
                          <MapPin className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                      <div className="truncate flex-1">
                        <div className="text-xs font-semibold text-white truncate">{name}</div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {item.category || (isShowingAiResults ? 'Dhaka Match' : 'Recent Location')}
                        </div>
                      </div>
                    </div>

                    {/* Right Action: Show on map button & Selection check */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Show on Map Functionality */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowOnMapClick(item, idx);
                        }}
                        className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-750 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Show pin on map"
                      >
                        <Map className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Show on map</span>
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Confirm Button */}
      <div className="sticky bottom-0 z-30 p-4 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-850 max-w-md mx-auto w-full">
        <button
          type="button"
          onClick={handleConfirmClick}
          disabled={isLoading || !dropoffText.trim()}
          className={`w-full py-3.5 px-4 font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
            isLoading || !dropoffText.trim()
              ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-950/50'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Resolving Locations...</span>
            </>
          ) : (
            <span>Confirm & View Fare</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default LocationSearch;
