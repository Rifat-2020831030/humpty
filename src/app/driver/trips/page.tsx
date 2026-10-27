'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Car,
  Bike,
  Star,
  ChevronDown,
  ChevronUp,
  Receipt,
  User,
  Heart,
} from 'lucide-react';
import DriverBottomNav from '@/components/driver/DriverBottomNav';

interface DriverTripRecord {
  id: string;
  time: string;
  passengerName: string;
  passengerRating: number;
  pickup: string;
  dropoff: string;
  vehicleType: 'CAR' | 'CNG' | 'BIKE';
  grossFare: number;
  netFare: number;
  platformFee: number;
  tip?: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad';
  distanceKm: number;
  durationMin: number;
}

const DRIVER_TRIPS: DriverTripRecord[] = [
  {
    id: 'DH-9842',
    time: '4:15 PM - 4:48 PM',
    passengerName: 'Tanvir Ahmed',
    passengerRating: 5.0,
    pickup: 'Pink City, Gulshan 2, Dhaka',
    dropoff: 'Road 27, Dhanmondi, Dhaka',
    vehicleType: 'CAR',
    grossFare: 380,
    netFare: 342,
    platformFee: 38,
    tip: 20,
    paymentMethod: 'bKash',
    distanceKm: 9.4,
    durationMin: 33,
  },
  {
    id: 'DH-9831',
    time: '2:30 PM - 3:00 PM',
    passengerName: 'Sadia Khan',
    passengerRating: 4.9,
    pickup: 'Block D, Banani 11, Dhaka',
    dropoff: 'Hazrat Shahjalal Int. Airport T2',
    vehicleType: 'CAR',
    grossFare: 540,
    netFare: 486,
    platformFee: 54,
    paymentMethod: 'Cash',
    distanceKm: 11.2,
    durationMin: 30,
  },
  {
    id: 'DH-9820',
    time: '12:10 PM - 12:45 PM',
    passengerName: 'Rakib Hasan',
    passengerRating: 5.0,
    pickup: 'Farmgate Overbridge, Dhaka',
    dropoff: 'Shapla Chattar, Motijheel, Dhaka',
    vehicleType: 'CAR',
    grossFare: 260,
    netFare: 234,
    platformFee: 26,
    tip: 10,
    paymentMethod: 'Nagad',
    distanceKm: 6.8,
    durationMin: 35,
  },
  {
    id: 'DH-9808',
    time: '10:00 AM - 10:35 AM',
    passengerName: 'Farzana Maya',
    passengerRating: 4.8,
    pickup: 'Mohakhali Wireless Gate, Dhaka',
    dropoff: 'Uttara Sector 3, Dhaka',
    vehicleType: 'CAR',
    grossFare: 410,
    netFare: 369,
    platformFee: 41,
    paymentMethod: 'bKash',
    distanceKm: 10.5,
    durationMin: 35,
  },
  {
    id: 'DH-9795',
    time: '8:15 AM - 8:45 AM',
    passengerName: 'Zubair Hossain',
    passengerRating: 5.0,
    pickup: 'Mirpur 10 Roundabout, Dhaka',
    dropoff: 'Kawran Bazar, Dhaka',
    vehicleType: 'CAR',
    grossFare: 290,
    netFare: 261,
    platformFee: 29,
    paymentMethod: 'Cash',
    distanceKm: 8.1,
    durationMin: 30,
  },
];

export default function DriverTripsPage() {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

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
              <span>Driver Trip Log</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Completed Trips Today</p>
          </div>
        </div>

        <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-[11px] font-mono text-emerald-400 font-bold">
          {DRIVER_TRIPS.length} Trips
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Trips List */}
        <div className="space-y-3">
          {DRIVER_TRIPS.map((trip) => {
            const isExpanded = expandedTripId === trip.id;
            return (
              <div
                key={trip.id}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-750 rounded-2xl p-3.5 transition-all shadow-sm space-y-3"
              >
                {/* Header line: Passenger & Net Earning */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{trip.passengerName}</span>
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {trip.passengerRating}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block font-mono">{trip.time}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      +৳{trip.netFare + (trip.tip || 0)}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-medium">
                      via {trip.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-1.5 pl-2 border-l-2 border-neutral-800 ml-2">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <span className="text-[11px] text-neutral-300 truncate">{trip.pickup}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <span className="text-[11px] text-neutral-100 font-medium truncate">
                      {trip.dropoff}
                    </span>
                  </div>
                </div>

                {/* Footer and details toggle */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span>{trip.distanceKm} km</span>
                    <span>•</span>
                    <span>{trip.durationMin} mins</span>
                    {trip.tip && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono text-[10px]">
                        +৳{trip.tip} Tip
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                    className="px-2 py-1 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Fare Breakdown</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expanded Fare breakdown */}
                {isExpanded && (
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Trip ID:</span>
                      <span className="text-white font-mono">{trip.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Gross Passenger Fare:</span>
                      <span className="text-white font-mono">৳{trip.grossFare}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Platform Commission (10%):</span>
                      <span className="text-rose-400 font-mono">-৳{trip.platformFee}</span>
                    </div>
                    {trip.tip && (
                      <div className="flex items-center justify-between text-emerald-400 font-medium">
                        <span>Passenger Tip:</span>
                        <span className="font-mono">+৳{trip.tip}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-850 pt-1.5 flex items-center justify-between font-bold">
                      <span className="text-neutral-300">Net Take Home:</span>
                      <span className="text-emerald-400 font-mono text-sm">
                        ৳{trip.netFare + (trip.tip || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <DriverBottomNav activeTab="trips" />
    </div>
  );
}
