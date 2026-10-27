'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Tag,
  Copy,
  Check,
  Sparkles,
  Percent,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import RiderBottomNav from '@/components/rider/RiderBottomNav';

interface PromoOffer {
  code: string;
  title: string;
  description: string;
  discountBadge: string;
  vehicleType: 'CAR' | 'CNG' | 'BIKE' | 'ALL';
  validUntil: string;
  minFare?: number;
  highlightColor: string;
}

const DHAKA_OFFERS: PromoOffer[] = [
  {
    code: 'DHAKA50',
    title: 'Dhaka City 50% Special',
    description: 'Get 50% discount up to ৳100 on your next Car ride anywhere in Dhaka.',
    discountBadge: '50% OFF',
    vehicleType: 'CAR',
    validUntil: '31 Oct 2026',
    minFare: 150,
    highlightColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
  },
  {
    code: 'CNG25',
    title: 'Dhaka CNG Quick Commute',
    description: 'Flat 25% off (up to ৳50) on Green Auto-rickshaws across Dhaka metro.',
    discountBadge: '25% OFF',
    vehicleType: 'CNG',
    validUntil: '05 Nov 2026',
    highlightColor: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
  },
  {
    code: 'AIRPORT150',
    title: 'Airport Gateway Express',
    description: 'Save flat ৳150 on your drop-off or pickup from Hazrat Shahjalal Int. Airport.',
    discountBadge: '৳150 FLAT',
    vehicleType: 'CAR',
    validUntil: '15 Nov 2026',
    minFare: 300,
    highlightColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
  },
  {
    code: 'BIKERUSH',
    title: 'Morning & Evening Rush Saver',
    description: '20% off on all motorbike rides during rush hours (8AM-11AM & 5PM-9PM).',
    discountBadge: '20% OFF',
    vehicleType: 'BIKE',
    validUntil: '02 Nov 2026',
    highlightColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
  },
  {
    code: 'BKASHCASH',
    title: 'bKash Digital Payment Bonus',
    description: 'Enjoy ৳50 instant cashback when paying for any ride with bKash digital wallet.',
    discountBadge: '৳50 BACK',
    vehicleType: 'ALL',
    validUntil: '30 Nov 2026',
    highlightColor: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
  },
];

export default function OffersPage() {
  const router = useRouter();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleApplyCustomPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const cleanCode = promoInput.trim().toUpperCase();
    setAppliedPromo(cleanCode);
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleUsePromoInRide = (code: string) => {
    setAppliedPromo(code);
    router.push('/rider');
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-black text-white select-none overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 px-4 py-3 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/rider"
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Offers & Promos</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dhaka City Deals & Discounts</p>
          </div>
        </div>

        <div className="px-2 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-[11px] font-mono text-emerald-400 font-bold">
          {DHAKA_OFFERS.length} Active
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 px-4 py-3.5 space-y-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Promo Code Input Box */}
        <form onSubmit={handleApplyCustomPromo} className="space-y-1.5">
          <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 focus-within:border-emerald-500 rounded-2xl shadow-sm transition-all">
            <div className="pl-2 text-neutral-400">
              <Tag className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter voucher or promo code..."
              className="flex-1 bg-transparent text-xs font-mono uppercase text-white placeholder:text-neutral-500 placeholder:normal-case outline-none py-1.5 px-1"
            />
            <button
              type="submit"
              disabled={!promoInput.trim()}
              className="px-3 py-1.5 bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Apply
            </button>
          </div>

          {appliedPromo && (
            <div className="p-2.5 bg-emerald-950/70 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Code <span className="font-mono font-bold">{appliedPromo}</span> is active for your next booking!
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleUsePromoInRide(appliedPromo)}
                className="text-[11px] font-bold text-white underline hover:text-emerald-300"
              >
                Book Now
              </button>
            </div>
          )}
        </form>

        {/* Featured Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/40 via-neutral-900 to-neutral-950 border border-emerald-500/30 p-4 shadow-md">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 font-semibold">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>LIMITED TIME DHAKA PASS</span>
            </div>
            <h2 className="text-base font-extrabold text-white">Save Up to 50% on Rides</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Use verified promo codes on Bike, CNG, and Car rides across all 50+ Dhaka zones.
            </p>
          </div>
        </div>

        {/* Offers List */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-0.5">
            Available Vouchers
          </h3>

          <div className="space-y-3">
            {DHAKA_OFFERS.map((offer) => {
              const isCopied = copiedCode === offer.code;
              return (
                <div
                  key={offer.code}
                  className={`p-3.5 rounded-2xl bg-neutral-900/90 border transition-all shadow-sm space-y-2.5 ${
                    offer.code === appliedPromo
                      ? 'border-emerald-500 bg-neutral-900 shadow-emerald-950/40'
                      : 'border-neutral-800 hover:border-neutral-750'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-extrabold tracking-wider bg-neutral-800 border border-neutral-700 text-white">
                        {offer.code}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-bold">
                        {offer.discountBadge}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-[11px] text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-neutral-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title and details */}
                  <div>
                    <h4 className="text-xs font-bold text-white">{offer.title}</h4>
                    <p className="text-[11px] text-neutral-400 leading-normal mt-0.5">
                      {offer.description}
                    </p>
                  </div>

                  {/* Footer Terms & Action */}
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>Valid till {offer.validUntil}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUsePromoInRide(offer.code)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>Apply & Ride</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Safety & Trust info */}
        <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-2xl flex items-center gap-2.5 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Discount automatically applies to final fare at trip completion.</span>
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <RiderBottomNav activeTab="offers" />
    </div>
  );
}
