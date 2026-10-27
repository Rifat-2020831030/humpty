'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CircleDollarSign,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  Award,
  Zap,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import DriverBottomNav from '@/components/driver/DriverBottomNav';

export default function DriverEarningsPage() {
  const [walletBalance, setWalletBalance] = useState<number>(1200);
  const [cashoutStatus, setCashoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleCashout = () => {
    if (walletBalance <= 0 || cashoutStatus !== 'idle') return;
    setCashoutStatus('processing');
    setTimeout(() => {
      setCashoutStatus('success');
      setWalletBalance(0);
    }, 1500);
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-black text-white select-none overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 px-4 py-3 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/driver"
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Driver Earnings</span>
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Today's Dhaka Settlements</p>
          </div>
        </div>

        <div className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-[11px] font-mono text-emerald-400 font-bold">
          ৳2,850 Today
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-3.5 space-y-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Today's Hero Summary */}
        <div className="p-4 bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-neutral-950 border border-emerald-600/30 rounded-2xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Today's Net Earnings
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-700/40">
              <TrendingUp className="w-3 h-3" />
              <span>+18% vs avg</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">৳2,850</span>
            <span className="text-xs text-neutral-400 font-medium">BDT earned</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center text-xs">
            <div className="p-2 bg-neutral-950/80 rounded-xl border border-neutral-850">
              <span className="text-white font-bold font-mono">14</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">Trips</span>
            </div>
            <div className="p-2 bg-neutral-950/80 rounded-xl border border-neutral-850">
              <span className="text-white font-bold font-mono">6h 30m</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">Online</span>
            </div>
            <div className="p-2 bg-neutral-950/80 rounded-xl border border-neutral-850">
              <span className="text-emerald-400 font-bold font-mono">৳203</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">Avg / Trip</span>
            </div>
          </div>
        </div>

        {/* Digital Wallet & Cashout Box */}
        <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                ৳
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Digital Wallet (bKash)</span>
                <span className="text-[10px] text-neutral-400 font-mono">Available for instant cashout</span>
              </div>
            </div>

            <span className="text-base font-extrabold text-white font-mono">
              ৳{walletBalance}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-neutral-300 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Cash in Hand Collected:</span>
              <span className="text-white font-mono font-medium">৳1,650</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Platform Commission (10%):</span>
              <span className="text-rose-400 font-mono font-medium">-৳320</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Surge & Bonus Boost:</span>
              <span className="text-emerald-400 font-mono font-medium">+৳320</span>
            </div>
          </div>

          {cashoutStatus === 'idle' && (
            <button
              type="button"
              disabled={walletBalance <= 0}
              onClick={handleCashout}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Instant Cashout ৳{walletBalance} to bKash</span>
            </button>
          )}

          {cashoutStatus === 'processing' && (
            <div className="w-full py-2.5 px-3 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold text-center animate-pulse">
              Transferring to bKash 017***5678...
            </div>
          )}

          {cashoutStatus === 'success' && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transferred ৳1,200 to bKash (TrxID: 9X882A31). Wallet settled!</span>
            </div>
          )}
        </div>

        {/* Dhaka Quests & Peak Hour Bonuses */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Quests & Surge</span>
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">1 Active Quest</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-neutral-900 border border-amber-500/40 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>15 Trips Daily Target</span>
                    <Zap className="w-3 h-3 text-amber-400" />
                  </h4>
                  <p className="text-[11px] text-neutral-400">Complete 1 more trip to unlock bonus.</p>
                </div>
                <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  +৳250 Bonus
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[93%]" />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>14 completed</span>
                  <span>15 required</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Gulshan & Banani Peak Hour</h4>
                  <p className="text-[10px] text-neutral-400 font-mono">5:00 PM - 9:00 PM Boost</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">+৳300 Earned</span>
            </div>
          </div>
        </section>

        {/* Payout History */}
        <section className="space-y-2 pb-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-0.5">
            Previous Payouts
          </h3>
          <div className="space-y-1.5">
            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-white font-medium block">Yesterday Payout</span>
                <span className="text-[10px] text-neutral-500 font-mono">bKash • TrxID: 8P4921</span>
              </div>
              <span className="text-white font-mono font-bold">৳3,420</span>
            </div>

            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-white font-medium block">25 Oct 2026 Payout</span>
                <span className="text-[10px] text-neutral-500 font-mono">Nagad • TrxID: 7M1092</span>
              </div>
              <span className="text-white font-mono font-bold">৳2,910</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Sticky Navigation */}
      <DriverBottomNav activeTab="earnings" />
    </div>
  );
}
