'use client';

import React from 'react';
import { VehicleType, VEHICLE_TYPES } from '../../types';
import { VEHICLE_RATES } from '../../lib/fare';

export interface ServiceTilesProps {
  selected: VehicleType;
  onSelect: (type: VehicleType) => void;
  className?: string;
}

const VEHICLE_DESCRIPTIONS: Record<VehicleType, { label: string; tag: string; startPrice: number }> = {
  BIKE: {
    label: 'Bike',
    tag: 'Fast & Agile',
    startPrice: 50,
  },
  CNG: {
    label: 'CNG',
    tag: 'Dhaka Icon',
    startPrice: 70,
  },
  CAR: {
    label: 'Car',
    tag: 'AC Comfort',
    startPrice: 120,
  },
};

export function ServiceTiles({ selected, onSelect, className = '' }: ServiceTilesProps) {
  return (
    <div className={`grid grid-cols-3 gap-2.5 ${className}`}>
      {VEHICLE_TYPES.map((type) => {
        const rateInfo = VEHICLE_RATES[type];
        const desc = VEHICLE_DESCRIPTIONS[type];
        const isSelected = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border text-left transition-all ${
              isSelected
                ? 'bg-neutral-900 border-emerald-500 ring-1 ring-emerald-500/50 text-white shadow-sm'
                : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-300'
            }`}
          >
            <span className="text-3xl mb-1 select-none" role="img" aria-label={desc.label}>
              {rateInfo.icon}
            </span>
            <div className="w-full text-center">
              <div className="font-semibold text-sm text-neutral-100 flex items-center justify-center gap-1">
                {desc.label}
              </div>
              <div className="text-[11px] text-neutral-400 truncate">{desc.tag}</div>
              <div className="mt-1 text-xs font-mono font-medium text-emerald-400">
                from ৳{desc.startPrice}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ServiceTiles;
