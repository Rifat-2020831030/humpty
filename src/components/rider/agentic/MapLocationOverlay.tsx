'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Edit3, Navigation, RotateCcw } from 'lucide-react';
import { MapBase, LocationPicker } from '../../map';

export interface MapLocationOverlayProps {
  isOpen: boolean;
  location: {
    lat: number;
    lng: number;
    name: string;
    type?: 'pickup' | 'dropoff';
  } | null;
  onClose: () => void;
  onSaveLocation: (updated: {
    lat: number;
    lng: number;
    name: string;
    type?: 'pickup' | 'dropoff';
  }) => void;
  className?: string;
}

export function MapLocationOverlay({
  isOpen,
  location,
  onClose,
  onSaveLocation,
  className = '',
}: MapLocationOverlayProps) {
  const [currentCoord, setCurrentCoord] = useState<{ lat: number; lng: number }>({
    lat: location?.lat ?? 23.7783,
    lng: location?.lng ?? 90.398,
  });
  const [locationName, setLocationName] = useState<string>(location?.name ?? '');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Sync state whenever opened with a new location
  useEffect(() => {
    if (location) {
      setCurrentCoord({ lat: location.lat, lng: location.lng });
      setLocationName(location.name);
      setIsEditingName(false);
    }
  }, [location]);

  if (!isOpen || !location) {
    return null;
  }

  const isPickup = location.type === 'pickup';
  const label = isPickup ? 'Pickup Location' : 'Dropoff Destination';

  const handleSave = () => {
    onSaveLocation({
      lat: currentCoord.lat,
      lng: currentCoord.lng,
      name: locationName.trim() || location.name,
      type: location.type,
    });
    onClose();
  };

  const handleReset = () => {
    setCurrentCoord({ lat: location.lat, lng: location.lng });
    setLocationName(location.name);
  };

  const hasChanges =
    currentCoord.lat !== location.lat ||
    currentCoord.lng !== location.lng ||
    locationName !== location.name;

  return (
    <div
      data-testid="map-location-overlay"
      className={`fixed inset-0 z-50 bg-black/95 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200 ${className}`}
    >
      {/* Top Floating Action Bar */}
      <header className="absolute top-0 inset-x-0 z-20 px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-white ${
              isPickup ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {label}
            </h2>
            <p className="text-[11px] text-neutral-300 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {locationName || location.name}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close map overlay"
          data-testid="close-map-overlay"
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all shadow-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Map View Area */}
      <div className="relative flex-1 w-full h-full">
        <MapBase
          center={[currentCoord.lat, currentCoord.lng]}
          zoom={15}
          onMapClick={(coords) => setCurrentCoord(coords)}
          className="w-full h-full"
        >
          <LocationPicker
            currentPin={currentCoord}
            label={label}
            draggable={true}
            onPinChange={(pos) => setCurrentCoord(pos)}
          />
        </MapBase>

        {/* Pin Guidance Banner */}
        <div className="absolute top-16 inset-x-0 mx-auto w-fit z-10 pointer-events-none">
          <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-neutral-700/80 rounded-full text-[11px] font-medium text-neutral-200 shadow-xl flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>Drag pin or tap anywhere on the map to adjust</span>
          </div>
        </div>
      </div>

      {/* Bottom Location Edit & Confirmation Sheet */}
      <div className="relative z-20 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 p-4 space-y-3 max-w-md mx-auto w-full shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold">
              Edit Address Name
            </span>
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset Pin</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 focus-within:border-emerald-500 rounded-xl px-3 py-2 transition-all">
            <Edit3 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name or landmark..."
              data-testid="edit-location-name-input"
              className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
            <span>Lat: {currentCoord.lat.toFixed(5)}</span>
            <span>Lng: {currentCoord.lng.toFixed(5)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            data-testid="save-location-button"
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapLocationOverlay;
