'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, CircleDollarSign, Clock, User } from 'lucide-react';

export interface DriverBottomNavProps {
  activeTab?: 'drive' | 'earnings' | 'trips' | 'profile';
  className?: string;
}

export function DriverBottomNav({ activeTab: explicitActiveTab, className = '' }: DriverBottomNavProps) {
  const pathname = usePathname();

  const getActiveTab = (): 'drive' | 'earnings' | 'trips' | 'profile' => {
    if (explicitActiveTab) return explicitActiveTab;
    if (pathname?.includes('/driver/earnings')) return 'earnings';
    if (pathname?.includes('/driver/trips')) return 'trips';
    if (pathname?.includes('/driver/profile')) return 'profile';
    return 'drive';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className={`sticky bottom-0 z-30 px-3 py-2 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-850 flex items-center justify-around max-w-md mx-auto w-full select-none ${className}`}
    >
      <Link
        href="/driver"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'drive' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Navigation className="w-4 h-4" />
        <span className="text-[10px]">Drive</span>
      </Link>

      <Link
        href="/driver/earnings"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'earnings' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <CircleDollarSign className="w-4 h-4" />
        <span className="text-[10px]">Earnings</span>
      </Link>

      <Link
        href="/driver/trips"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'trips' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className="text-[10px]">Trips</span>
      </Link>

      <Link
        href="/driver/profile"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <User className="w-4 h-4" />
        <span className="text-[10px]">Profile</span>
      </Link>
    </nav>
  );
}

export default DriverBottomNav;
