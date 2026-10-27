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
  ChevronRight,
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
      <header className="sticky top-0 z-30 px-5 py-4 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/driver"
            className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Driver Earnings</span>
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">Dhaka Daily Settlements</p>
          </div>
        </div>

        <div className="px-3 py-1 bg-emerald-950/70 border border-emerald-800/60 rounded-full text-xs font-mono text-emerald-400 font-bold">
          ৳2,850 Today
        </div>
      </header>

      {/* Main Spacious Content */}
      <main className="flex-1 px-5 py-5 space-y-6 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Today's Hero Summary */}
        <section className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/80 rounded-3xl space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Today's Net Earnings
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-800/50 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% vs daily avg</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-black text-white font-mono tracking-tight">
              ৳2,850
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              14 Completed Trips • 6h 30m Active Online
            </p>
          </div>

          {/* Quick Metrics Bar with Generous Breathing Room */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-800/80 text-center">
            <div className="py-1.5">
              <span className="text-sm font-bold text-white font-mono block">14</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">Trips</span>
            </div>
            <div className="py-1.5 border-x border-neutral-850">
              <span className="text-sm font-bold text-white font-mono block">6.5 hrs</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">Online</span>
            </div>
            <div className="py-1.5">
              <span className="text-sm font-bold text-emerald-400 font-mono block">৳203</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">Avg/Trip</span>
            </div>
          </div>
        </section>

        {/* Digital Wallet & Cashout Box */}
        <section className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm">
                ৳
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Digital Wallet (bKash)</span>
                <span className="text-[11px] text-neutral-400">Available for instant withdrawal</span>
              </div>
            </div>

            <span className="text-xl font-extrabold text-white font-mono">
              ৳{walletBalance}
            </span>
          </div>

          {/* Breakdown Items with Spacious Rows */}
          <div className="space-y-2.5 bg-neutral-950/70 p-3.5 rounded-2xl border border-neutral-850 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Cash in Hand Collected</span>
              <span className="text-white font-mono font-medium">৳1,650</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Platform Commission (10%)</span>
              <span className="text-rose-400 font-mono font-medium">-৳320</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Peak Surge Bonus Boost</span>
              <span className="text-emerald-400 font-mono font-medium">+৳320</span>
            </div>
          </div>

          {/* Action Button */}
          {cashoutStatus === 'idle' && (
            <button
              type="button"
              disabled={walletBalance <= 0}
              onClick={handleCashout}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 active:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Wallet className="w-4 h-4" />
              <span>Instant Cashout ৳{walletBalance} to bKash</span>
            </button>
          )}

          {cashoutStatus === 'processing' && (
            <div className="w-full py-3.5 px-4 bg-neutral-800 text-neutral-300 rounded-2xl text-xs font-bold text-center animate-pulse">
              Transferring to bKash 017***5678...
            </div>
          )}

          {cashoutStatus === 'success' && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transferred ৳1,200 to bKash (TrxID: 9X882A31). Wallet settled!</span>
            </div>
          )}
        </section>

        {/* Daily Quests & Rush Hour Incentives */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Target & Incentives</span>
            </h2>
            <span className="text-[11px] text-amber-400 font-mono font-semibold">1 Active Quest</span>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>15 Trips Daily Target</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Complete 1 more trip today to unlock bonus.
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-800/60">
                +৳250 Bonus
              </span>
            </div>

            {/* Clean Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[93%]" />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                <span>14 completed</span>
                <span>15 required (93%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payout History */}
        <section className="space-y-3 pb-2">
          <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-1">
            Recent Settlement Payouts
          </h2>
          <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-3xl space-y-3">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-850">
              <div>
                <span className="text-white font-medium block">Yesterday Payout</span>
                <span className="text-[10px] text-neutral-400 font-mono">bKash • TrxID: 8P4921</span>
              </div>
              <span className="text-white font-mono font-bold text-sm">৳3,420</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <div>
                <span className="text-white font-medium block">25 Oct 2026 Payout</span>
                <span className="text-[10px] text-neutral-400 font-mono">Nagad • TrxID: 7M1092</span>
              </div>
              <span className="text-white font-mono font-bold text-sm">৳2,910</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Sticky Navigation */}
      <DriverBottomNav activeTab="earnings" />
    </div>
  );
}
