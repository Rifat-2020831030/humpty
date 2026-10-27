'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles, ArrowLeft, Check, Compass, Search } from 'lucide-react';
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
  suggestions?: any[];
  error?: string | null;
  isLoading?: boolean;
  onClearError?: () => void;
  className?: string;
  onBack?: () => void;
  selectedVehicle?: VehicleType;
  onConfirm?: () => void;
}

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
  suggestions = [],
  error,
  isLoading = false,
  onClearError,
  className = '',
  onBack,
  selectedVehicle = 'BIKE',
  onConfirm,
}: LocationSearchProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onSubmitSearch) {
      onSubmitSearch();
    }
  };

  const handleAiSearchTrigger = () => {
    if (!aiMode) {
      onToggleAI();
    }
    if (onSubmitSearch) {
      onSubmitSearch();
    }
  };

  return (
    <div
      className={`w-full min-h-screen bg-black text-white flex flex-col justify-between select-none ${className}`}
    >
      {/* Top Header */}
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

        {/* Clean, Flat AI Toggle in Top Header */}
        <button
          type="button"
          onClick={onToggleAI}
          aria-pressed={aiMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors border ${
            aiMode
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Gemini Natural Language AI search"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-bold">[AI]</span>
          <span className="text-[11px]">{aiMode ? 'AI Mode ON' : 'Standard'}</span>
        </button>
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

              <div className="relative">
                <input
                  type="text"
                  value={pickupText}
                  onChange={(e) => onPickupChange(e.target.value)}
                  placeholder="Enter pickup or choose live/manual below"
                  className="w-full bg-neutral-900 border border-neutral-750 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
                />
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

            {/* 2. Destination Input with Direct AI Search Integration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Destination</span>
                </label>

                {/* Direct AI Search Button / Switch in Destination Search */}
                <button
                  type="button"
                  onClick={onToggleAI}
                  aria-pressed={aiMode}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                    aiMode
                      ? 'bg-emerald-600/90 border-emerald-500 text-white'
                      : 'bg-neutral-900 border-neutral-750 text-neutral-400 hover:text-neutral-200 hover:border-emerald-500/40'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{aiMode ? 'AI Search Active' : 'Enable AI Search'}</span>
                </button>
              </div>

              {/* Destination Search Box with Inline AI Search Action */}
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

                {/* Explicit Ask AI / Search Button */}
                <button
                  type="button"
                  onClick={handleAiSearchTrigger}
                  disabled={isLoading}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                    aiMode
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-neutral-900 hover:bg-neutral-850 text-emerald-400 border border-neutral-750'
                  }`}
                  title="Search with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
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

        {/* AI & Search Suggested Options to Choose From */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{aiMode ? 'AI Return Options' : 'AI Suggested Places'}</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {isLoading ? 'Searching...' : 'Tap to pin on map'}
            </span>
          </div>

          {isLoading ? (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-center gap-2.5 text-xs text-emerald-400 font-mono">
              <span className="w-4 h-4 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <span>Resolving Dhaka locations with AI...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {suggestions.map((item, idx) => {
                const name = item.displayName || item.name;
                const isSelected = selectedIdx === idx || dropoffText === name;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(item, idx)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md'
                        : 'bg-neutral-950 hover:bg-neutral-900/80 border-neutral-850 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{name}</div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {item.category || 'Dhaka Location'}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
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
