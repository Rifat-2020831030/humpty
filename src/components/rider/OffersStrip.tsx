'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Sparkles } from 'lucide-react';

export interface OffersStripProps {
  onApplyPromo?: (code: string) => void;
  className?: string;
}

export interface PromoOffer {
  id: string;
  code: string;
  title: string;
  discount: string;
  details: string;
}

export const OFFERS: PromoOffer[] = [
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
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-shift carousel cards from left to right every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % OFFERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleApply = (code: string) => {
    setAppliedCode(code);
    if (onApplyPromo) {
      onApplyPromo(code);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* 3-Card Carousel Track */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {OFFERS.map((offer, idx) => {
          const isApplied = appliedCode === offer.code;

          return (
            <div key={offer.id} className="w-full flex-shrink-0 px-0.5">
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5 min-h-[96px] bg-gradient-to-r from-neutral-900 to-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl text-xs shadow-md transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    {idx === 0 ? (
                      <Tag className="w-5 h-5" />
                    ) : idx === 1 ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <span className="text-base font-bold">🌙</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-medium text-neutral-200">
                      <span className="text-emerald-400 font-mono text-sm font-extrabold tracking-wider">
                        {offer.code}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-emerald-300 font-bold text-xs">{offer.discount}</span>
                    </div>
                    <div className="text-xs text-neutral-400 leading-snug mt-1">
                      {offer.details}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(offer.code)}
                  disabled={isApplied}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isApplied
                      ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-950/40'
                  }`}
                >
                  {isApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Indicators (Dots) */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {OFFERS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? 'w-5 bg-emerald-500'
                : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default OffersStrip;
