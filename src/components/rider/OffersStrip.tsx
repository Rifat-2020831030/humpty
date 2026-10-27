'use client';

import React, { useState } from 'react';

export interface OffersStripProps {
  onApplyPromo?: (code: string) => void;
  className?: string;
}

interface PromoOffer {
  id: string;
  code: string;
  title: string;
  discount: string;
  details: string;
}

const OFFERS: PromoOffer[] = [
  {
    id: 'dhaka20',
    code: 'DHAKA20',
    title: 'Dhaka Rush Promo',
    discount: '20% OFF',
    details: 'Save 20% on next 3 CNG or Bike rides',
  },
  {
    id: 'garikoi1',
    code: 'GARIKOI30',
    title: 'First Trip Bonus',
    discount: '৳30 OFF',
    details: 'Direct discount on first city ride',
  },
  {
    id: 'nosurge',
    code: 'NIGHTDHAKA',
    title: 'Night Commute',
    discount: 'ZERO SURGE',
    details: 'Flat rates across Dhaka after 10 PM',
  },
];

export function OffersStrip({ onApplyPromo, className = '' }: OffersStripProps) {
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleApply = (code: string) => {
    setAppliedCode(code);
    if (onApplyPromo) {
      onApplyPromo(code);
    }
  };

  return (
    <div className={`overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex gap-2.5 min-w-full">
        {OFFERS.map((offer) => {
          const isApplied = appliedCode === offer.code;

          return (
            <div
              key={offer.id}
              className="flex-shrink-0 flex items-center justify-between gap-3 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                  <span className="text-emerald-400 font-mono font-bold tracking-wider">
                    {offer.code}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-emerald-300 font-semibold">{offer.discount}</span>
                </div>
                <div className="text-[11px] text-neutral-400">{offer.details}</div>
              </div>
              <button
                type="button"
                onClick={() => handleApply(offer.code)}
                disabled={isApplied}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  isApplied
                    ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50'
                }`}
              >
                {isApplied ? 'Applied ✓' : 'Apply'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OffersStrip;
