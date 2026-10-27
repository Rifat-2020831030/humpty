'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, Clock, Tag, User } from 'lucide-react';

export interface RiderBottomNavProps {
  activeTab?: 'home' | 'rides' | 'offers' | 'profile';
  className?: string;
}

export function RiderBottomNav({ activeTab: explicitActiveTab, className = '' }: RiderBottomNavProps) {
  const pathname = usePathname();

  const getActiveTab = (): 'home' | 'rides' | 'offers' | 'profile' => {
    if (explicitActiveTab) return explicitActiveTab;
    if (pathname?.includes('/rider/activity')) return 'rides';
    if (pathname?.includes('/rider/offers')) return 'offers';
    if (pathname?.includes('/rider/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className={`sticky bottom-0 z-30 px-3 py-2 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-850 flex items-center justify-around max-w-md mx-auto w-full select-none ${className}`}
    >
      <Link
        href="/rider"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <HomeIcon className="w-4 h-4" />
        <span className="text-[10px]">Home</span>
      </Link>

      <Link
        href="/rider/activity"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'rides' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className="text-[10px]">Activity</span>
      </Link>

      <Link
        href="/rider/offers"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'offers' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Tag className="w-4 h-4" />
        <span className="text-[10px]">Offers</span>
      </Link>

      <Link
        href="/rider/profile"
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

export default RiderBottomNav;
