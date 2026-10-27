'use client';

import React from 'react';

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
}: LocationSearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitSearch) {
      onSubmitSearch();
    }
  };

  return (
    <div
      className={`w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white shadow-xl ${className}`}
    >
      {/* Search Header / Mode Indicator */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide text-neutral-200">
            Trip Locations
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
            Dhaka City
          </span>
        </div>

        {/* Clean, Flat AI Toggle - Strictly avoid glow/gradients */}
        <button
          type="button"
          onClick={onToggleAI}
          aria-pressed={aiMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors border ${
            aiMode
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Gemini Natural Language AI search"
        >
          <span className="font-bold">[AI]</span>
          <span className="text-[11px]">{aiMode ? 'AI Mode ON' : 'Standard'}</span>
        </button>
      </div>

      {/* GPS Error Notification if any - non blocking */}
      {error && (
        <div className="mb-3 p-2.5 bg-neutral-900 border border-red-900/50 rounded-lg text-xs text-red-300 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
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

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Pickup Input Container */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Pickup Point
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={pickupText}
              onChange={(e) => onPickupChange(e.target.value)}
              placeholder="Enter pickup or use GPS / map pin"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Explicit GPS and Manual Pin Selection Buttons for Pickup */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={onUseGPS}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-emerald-400 transition-colors"
            >
              <span>📍</span>
              <span>Use my GPS</span>
            </button>
            <button
              type="button"
              onClick={onSelectManually}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <span>🗺</span>
              <span>Select Manually</span>
            </button>
          </div>
        </div>

        {/* Dropoff Input Container */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Destination
          </label>

          <div className="relative">
            <input
              type="text"
              value={dropoffText}
              onChange={(e) => onDropoffChange(e.target.value)}
              placeholder={
                aiMode
                  ? "Describe destination in plain words (e.g., 'Behind Gulshan 2 KFC near DCC Market')"
                  : "Where to? (e.g. Dhanmondi 27, Gulshan 2, Motijheel)"
              }
              className={`w-full bg-neutral-900 border rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none ${
                aiMode
                  ? 'border-emerald-700 focus:border-emerald-500'
                  : 'border-neutral-800 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Manual Pin Selection Button for Destination */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={onSelectDropoffManually || onSelectManually}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <span>🗺</span>
              <span>Pin Destination on Map</span>
            </button>
          </div>
        </div>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="max-h-48 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-lg divide-y divide-neutral-800/80">
            {suggestions.map((item, idx) => (
              <button
                key={`${item.displayName}-${idx}`}
                type="button"
                onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-800 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-neutral-500">📍</span>
                  <span className="text-neutral-200 font-medium truncate">
                    {item.displayName}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 flex-shrink-0">
                  Dhaka
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !dropoffText.trim()}
          className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Searching Dhaka locations...</span>
          ) : (
            <span>Find Rides in GariKoi</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default LocationSearch;
