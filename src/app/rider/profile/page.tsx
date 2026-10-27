'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Star,
  Shield,
  MapPin,
  Briefcase,
  Home as HomeIcon,
  CreditCard,
  Wallet,
  PhoneCall,
  LogOut,
  ChevronRight,
  Plus,
  Car,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import RiderBottomNav from '@/components/rider/RiderBottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const { setRole } = useSession();
  const [defaultPayment, setDefaultPayment] = useState<'bKash' | 'Cash' | 'Nagad'>('bKash');

  const handleSwitchToDriver = () => {
    setRole('DRIVER');
    router.push('/driver');
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
            href="/rider"
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Account & Profile</span>
              <User className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dhaka Rider Dashboard</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwitchToDriver}
          className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Driver Mode</span>
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 px-4 py-3.5 space-y-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* User Profile Card */}
        <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl font-black text-white shadow-md shadow-emerald-950/50">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white truncate">Tanvir Ahmed</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-mono font-bold">
                  GOLD
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">+880 1712-345678</p>
              <p className="text-[11px] text-neutral-500 truncate">tanvir.ahmed@garikoi.com</p>
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
              <span className="text-white font-extrabold text-xs font-mono">128</span>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block mt-0.5">Trips</span>
            </div>
            <div className="p-2 bg-neutral-950/70 rounded-xl border border-neutral-850">
              <span className="text-emerald-400 font-extrabold text-xs font-mono">৳1,420</span>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block mt-0.5">Saved</span>
            </div>
          </div>
        </div>

        {/* Saved Places */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Saved Locations
            </h3>
            <button
              type="button"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between hover:border-neutral-750 transition-colors">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <HomeIcon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-white block">Home</span>
                  <span className="text-[11px] text-neutral-400 truncate block">
                    House 14, Road 27, Dhanmondi, Dhaka
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between hover:border-neutral-750 transition-colors">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-white block">Work</span>
                  <span className="text-[11px] text-neutral-400 truncate block">
                    Gulshan Center Point, Road 90, Gulshan 2
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-0.5">
            Payment Methods
          </h3>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setDefaultPayment('bKash')}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                defaultPayment === 'bKash'
                  ? 'bg-neutral-900 border-emerald-500'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-750'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 text-xs font-bold">
                  ৳
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">bKash Linked</span>
                    {defaultPayment === 'bKash' && (
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">DEFAULT</span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">017***5678</span>
                </div>
              </div>
              {defaultPayment === 'bKash' && (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDefaultPayment('Cash')}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                defaultPayment === 'Cash'
                  ? 'bg-neutral-900 border-emerald-500'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-750'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Cash in BDT</span>
                    {defaultPayment === 'Cash' && (
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">DEFAULT</span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">Pay directly to driver</span>
                </div>
              </div>
              {defaultPayment === 'Cash' && (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDefaultPayment('Nagad')}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                defaultPayment === 'Nagad'
                  ? 'bg-neutral-900 border-emerald-500'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-750'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xs font-bold">
                  N
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Nagad Wallet</span>
                    {defaultPayment === 'Nagad' && (
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">DEFAULT</span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">018***9921</span>
                </div>
              </div>
              {defaultPayment === 'Nagad' && (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>
        </section>

        {/* Safety & Emergency Support */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-0.5">
            Safety & Emergency
          </h3>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Emergency SOS (999)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Dhaka Police Integration</span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-800">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>24/7 GariKoi Helpline</span>
              </span>
              <span className="text-white font-mono font-bold">16216</span>
            </div>
          </div>
        </section>

        {/* Account Reset & Switch Role */}
        <div className="pt-2 pb-4 space-y-2">
          <button
            type="button"
            onClick={handleSwitchToDriver}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
          >
            <Car className="w-4 h-4" />
            <span>Switch to Driver Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleResetSession}
            className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-rose-400 border border-neutral-800 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Reset Session & Clear Data</span>
          </button>
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <RiderBottomNav activeTab="profile" />
    </div>
  );
}
