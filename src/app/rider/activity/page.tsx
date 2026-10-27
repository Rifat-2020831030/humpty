'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Car,
  Bike,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Receipt,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Star,
} from 'lucide-react';
import RiderBottomNav from '@/components/rider/RiderBottomNav';

interface TripRecord {
  id: string;
  date: string;
  vehicleType: 'BIKE' | 'CNG' | 'CAR';
  vehicleModel: string;
  plateNumber: string;
  driverName: string;
  driverRating: number;
  pickupAddress: string;
  dropoffAddress: string;
  fareBDT: number;
  paymentMethod: 'bKash' | 'Cash' | 'Nagad';
  status: 'COMPLETED' | 'CANCELLED';
  distanceKm: number;
  durationMin: number;
}

const PAST_TRIPS: TripRecord[] = [
  {
    id: 'TRIP-8821',
    date: 'Today, 4:30 PM',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota Axio (White)',
    plateNumber: 'Dhaka Metro Ga 28-9412',
    driverName: 'Rafiqul Islam',
    driverRating: 4.9,
    pickupAddress: 'Road 27, Dhanmondi, Dhaka',
    dropoffAddress: 'Pink City, Gulshan 2, Dhaka',
    fareBDT: 380,
    paymentMethod: 'bKash',
    status: 'COMPLETED',
    distanceKm: 9.4,
    durationMin: 32,
  },
  {
    id: 'TRIP-8819',
    date: 'Yesterday, 11:15 AM',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota Premio (Silver)',
    plateNumber: 'Dhaka Metro Cha 15-4032',
    driverName: 'Kamal Hossain',
    driverRating: 4.8,
    pickupAddress: 'Block D, Banani 11, Dhaka',
    dropoffAddress: 'Hazrat Shahjalal Int. Airport T2',
    fareBDT: 540,
    paymentMethod: 'Cash',
    status: 'COMPLETED',
    distanceKm: 11.2,
    durationMin: 28,
  },
  {
    id: 'TRIP-8810',
    date: '25 Oct 2026, 8:40 PM',
    vehicleType: 'CNG',
    vehicleModel: 'Bajaj 4-Stroke Green CNG',
    plateNumber: 'Dhaka Metro Th 11-2091',
    driverName: 'Abdul Karim',
    driverRating: 4.7,
    pickupAddress: 'Dhanmondi 27 Bridge, Dhaka',
    dropoffAddress: 'Shapla Chattar, Motijheel, Dhaka',
    fareBDT: 210,
    paymentMethod: 'Nagad',
    status: 'COMPLETED',
    distanceKm: 7.8,
    durationMin: 35,
  },
  {
    id: 'TRIP-8794',
    date: '24 Oct 2026, 2:10 PM',
    vehicleType: 'BIKE',
    vehicleModel: 'Yamaha FZS V3 (Black)',
    plateNumber: 'Dhaka Metro Ha 44-7711',
    driverName: 'Tanvir Hossain',
    driverRating: 4.9,
    pickupAddress: 'Bashundhara R/A Gate 1, Dhaka',
    dropoffAddress: 'Mohakhali Wireless Gate, Dhaka',
    fareBDT: 140,
    paymentMethod: 'bKash',
    status: 'COMPLETED',
    distanceKm: 5.2,
    durationMin: 18,
  },
  {
    id: 'TRIP-8780',
    date: '22 Oct 2026, 9:20 PM',
    vehicleType: 'BIKE',
    vehicleModel: 'Honda CB Hornet',
    plateNumber: 'Dhaka Metro La 33-1829',
    driverName: 'Suman Roy',
    driverRating: 4.6,
    pickupAddress: 'Mirpur 10 Circle, Dhaka',
    dropoffAddress: 'Farmgate Overbridge, Dhaka',
    fareBDT: 0,
    paymentMethod: 'Cash',
    status: 'CANCELLED',
    distanceKm: 6.1,
    durationMin: 0,
  },
];

export default function ActivityPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const filteredTrips = PAST_TRIPS.filter((trip) => {
    if (filter === 'ALL') return true;
    return trip.status === filter;
  });

  const getVehicleIcon = (type: TripRecord['vehicleType']) => {
    switch (type) {
      case 'BIKE':
        return <Bike className="w-4 h-4 text-amber-400" />;
      case 'CNG':
        return <span className="text-sm leading-none">🛺</span>;
      case 'CAR':
        return <Car className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handleRebook = (destination: string) => {
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
              <span>Your Activity</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dhaka Ride History</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-emerald-400">
            {PAST_TRIPS.filter((t) => t.status === 'COMPLETED').length} Completed
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-4 py-3 space-y-3.5 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 pb-1">
          {(['ALL', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab === 'ALL' ? 'All Trips' : tab === 'COMPLETED' ? 'Completed' : 'Cancelled'}
            </button>
          ))}
        </div>

        {/* Trips List */}
        <div className="space-y-3">
          {filteredTrips.map((trip) => {
            const isExpanded = expandedTripId === trip.id;
            return (
              <div
                key={trip.id}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-750 rounded-2xl p-3.5 transition-all shadow-sm space-y-3"
              >
                {/* Trip Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center">
                      {getVehicleIcon(trip.vehicleType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{trip.vehicleType}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">• {trip.id}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block">{trip.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {trip.status === 'COMPLETED' ? (
                      <span className="text-sm font-extrabold text-white font-mono">
                        ৳{trip.fareBDT}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40">
                        Cancelled
                      </span>
                    )}
                    {trip.status === 'COMPLETED' && (
                      <span className="text-[10px] text-emerald-400/90 font-medium block">
                        via {trip.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pickup and Dropoff Address Line */}
                <div className="space-y-1.5 pl-2 border-l-2 border-neutral-800 ml-2">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <span className="text-[11px] text-neutral-300 truncate">{trip.pickupAddress}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <span className="text-[11px] text-neutral-100 font-medium truncate">
                      {trip.dropoffAddress}
                    </span>
                  </div>
                </div>

                {/* Driver Summary & Action Buttons */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-300 font-medium truncate">
                      {trip.driverName}
                    </span>
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {trip.driverRating}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                      className="px-2 py-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Receipt</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRebook(trip.dropoffAddress)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-800/80 border border-emerald-800/60 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rebook</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Receipt Breakdown */}
                {isExpanded && (
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2 mt-2">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Vehicle:</span>
                      <span className="text-white font-medium">{trip.vehicleModel}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Number Plate:</span>
                      <span className="text-white font-mono">{trip.plateNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Distance & Duration:</span>
                      <span className="text-white">
                        {trip.distanceKm} km • {trip.durationMin} mins
                      </span>
                    </div>
                    <div className="border-t border-neutral-850 pt-2 flex items-center justify-between font-bold">
                      <span className="text-neutral-300">Total Charged:</span>
                      <span className="text-emerald-400 font-mono text-sm">৳{trip.fareBDT}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <RiderBottomNav activeTab="rides" />
    </div>
  );
}
