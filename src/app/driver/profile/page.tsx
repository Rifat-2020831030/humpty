'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Star,
  ShieldCheck,
  CheckCircle,
  Car,
  FileText,
  PhoneCall,
  LogOut,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import DriverBottomNav from '@/components/driver/DriverBottomNav';

export default function DriverProfilePage() {
  const router = useRouter();
  const { setRole } = useSession();

  const handleSwitchToRider = () => {
    setRole('RIDER');
    router.push('/rider');
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
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
              <span>Driver Account</span>
              <User className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dhaka Captain Profile</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwitchToRider}
          className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Rider Mode</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-3.5 space-y-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Driver Profile Card */}
        <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-xl font-black text-white shadow-md shadow-emerald-950/50">
              R
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-white truncate">Rafiqul Islam</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-neutral-400 font-mono">+880 1711-892144</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-bold">
                  VERIFIED CAPTAIN
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Dhaka Zone 1</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center">
            <div className="p-2 bg-neutral-950/70 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-xs">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>4.92</span>
              </div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block mt-0.5">Rating</span>
            </div>
            <div className="p-2 bg-neutral-950/70 rounded-xl border border-neutral-850">
              <span className="text-white font-extrabold text-xs font-mono">1,420</span>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block mt-0.5">Trips</span>
            </div>
            <div className="p-2 bg-neutral-950/70 rounded-xl border border-neutral-850">
              <span className="text-emerald-400 font-extrabold text-xs font-mono">2.5 Yrs</span>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block mt-0.5">Partner</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-0.5">
            Performance KPIs
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-1">
              <span className="text-base font-extrabold text-emerald-400 font-mono">96%</span>
              <span className="text-[10px] text-neutral-400 block">Acceptance</span>
            </div>
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-1">
              <span className="text-base font-extrabold text-white font-mono">1.8%</span>
              <span className="text-[10px] text-neutral-400 block">Cancellation</span>
            </div>
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-1">
              <span className="text-base font-extrabold text-amber-400 font-mono">98%</span>
              <span className="text-[10px] text-neutral-400 block">On-Time</span>
            </div>
          </div>
        </section>

        {/* Vehicle & BRTA Documentation */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-0.5">
            Vehicle & BRTA Documents
          </h3>

          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Toyota Axio 2018 (White)</h4>
                  <span className="text-[11px] text-neutral-400 font-mono">Dhaka Metro Ga 28-9412</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="border-t border-neutral-800/80 pt-2 space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span>BRTA Registration:</span>
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span>Tax Token:</span>
                </span>
                <span className="text-white font-mono">Valid (31 Dec 2026)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span>Driving License:</span>
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Smart Card Active</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Driver Support */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-0.5">
            Captain Helpline
          </h3>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white block">Dedicated Captain Support</span>
                <span className="text-[10px] text-neutral-400 block">24/7 Dhaka Driver Care</span>
              </div>
            </div>
            <span className="text-emerald-400 font-mono font-bold">16216</span>
          </div>
        </section>

        {/* Switch Role & Session Reset */}
        <div className="pt-2 pb-4 space-y-2">
          <button
            type="button"
            onClick={handleSwitchToRider}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
          >
            <Car className="w-4 h-4" />
            <span>Switch to Rider Mode</span>
          </button>

          <button
            type="button"
            onClick={handleResetSession}
            className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-rose-400 border border-neutral-800 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Go Offline & Reset Session</span>
          </button>
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <DriverBottomNav activeTab="profile" />
    </div>
  );
}
