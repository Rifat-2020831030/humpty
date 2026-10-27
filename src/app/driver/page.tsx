'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { trpc } from '@/trpc/client';
import { TRPCProvider } from '@/trpc/Provider';
import { useSession } from '@/hooks/useSession';
import {
  ActiveRide,
  HeatmapCell,
  RideStatus,
  VehicleType,
} from '@/types';
import { DHAKA_CENTER, SEED_DRIVERS } from '@/lib/constants';
import {
  OnlineToggle,
  IncomingRideAlert,
  NavigateToPickup,
  TripActiveDriver,
  TripCompletedDriver,
  getDriverFlowState,
  formatBDT,
  IncomingRideData,
} from '@/components/driver';
import {
  Shield,
  Layers,
  MapPin,
  Flame,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';

// Dynamic client-only imports for map components
const MapBase = dynamic(() => import('@/components/map/MapBase'), { ssr: false });
const DensityHeatmap = dynamic(() => import('@/components/map/DensityHeatmap'), { ssr: false });
const RouteLayer = dynamic(() => import('@/components/map/RouteLayer'), { ssr: false });
const DriverMarker = dynamic(() => import('@/components/map/DriverMarker'), { ssr: false });

function DriverFlowContent() {
  const session = useSession();

  // Set session role to DRIVER on mount
  useEffect(() => {
    session.setRole('DRIVER');
  }, [session]);

  // Online & vehicle selection state
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('BIKE');

  // Session cumulative stats
  const [sessionEarnings, setSessionEarnings] = useState<number>(0);
  const [completedTripsCount, setCompletedTripsCount] = useState<number>(0);

  // Driver location (defaults to Banani / Gulshan driver seed position)
  const defaultDriverSeed = SEED_DRIVERS[0] ?? {
    id: 'driver-1',
    name: 'Rahim Uddin',
    lat: 23.7937,
    lng: 90.4066,
    plate: 'DHA-1234',
    rating: 4.8,
  };

  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
    bearing?: number;
  }>({
    lat: defaultDriverSeed.lat,
    lng: defaultDriverSeed.lng,
    bearing: 0,
  });

  // Heatmap density cells
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([]);

  // Active in-flight ride & incoming alert state
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [incomingRide, setIncomingRide] = useState<IncomingRideData | null>(null);

  // Initial heatmap fetch
  const { data: initialDensity } = trpc.driver.getDensity.useQuery(undefined, {
    enabled: isOnline,
  });

  useEffect(() => {
    if (initialDensity && initialDensity.length > 0) {
      setHeatmapCells(initialDensity);
    }
  }, [initialDensity]);

  // Subscribe to real-time density updates
  trpc.driver.onDensityUpdate.useSubscription(undefined, {
    enabled: isOnline,
    onData(data) {
      if (data?.cells) {
        setHeatmapCells(data.cells);
      }
    },
  });

  // Subscribe to incoming rides for this driver's vehicle type
  trpc.ride.onIncomingRide.useSubscription(
    { vehicleType: selectedVehicle },
    {
      enabled: isOnline && !activeRide,
      onData(data) {
        if (!activeRide) {
          setIncomingRide({
            rideId: data.rideId,
            vehicleType: data.vehicleType,
            pickupAddress: data.pickupAddress,
            dropoffAddress: data.dropoffAddress,
            fareEstimate: data.fareEstimate,
            distanceKm: data.distanceKm,
            driverSessionId: data.driverSessionId,
          });
        }
      },
    }
  );

  // Restore active ride on load if session has activeRideId
  const { data: restoredRide } = trpc.ride.getActive.useQuery(
    { sessionId: session.sessionId },
    { enabled: !!session.sessionId && !activeRide }
  );

  useEffect(() => {
    if (restoredRide && !activeRide) {
      setActiveRide(restoredRide as unknown as ActiveRide);
      setIsOnline(true);
    }
  }, [restoredRide, activeRide]);

  // Subscribe to ride status updates when activeRide is present
  trpc.ride.onStatusChange.useSubscription(
    { rideId: activeRide?.id ?? '' },
    {
      enabled: !!activeRide?.id,
      onData(payload) {
        if (activeRide && payload.rideId === activeRide.id) {
          setActiveRide((prev) =>
            prev ? { ...prev, status: payload.status as RideStatus } : null
          );
        }
      },
    }
  );

  // Subscribe to live simulated driver location during active trip
  trpc.ride.onDriverLocation.useSubscription(
    { rideId: activeRide?.id ?? '' },
    {
      enabled: !!activeRide?.id,
      onData(loc) {
        setDriverLocation({
          lat: loc.lat,
          lng: loc.lng,
          bearing: loc.bearing ?? 0,
        });
      },
    }
  );

  // tRPC Driver Workflow Mutations
  const acceptMutation = trpc.ride.accept.useMutation({
    onSuccess(ride) {
      setIncomingRide(null);
      setActiveRide(ride as unknown as ActiveRide);
      session.setActiveRideId(ride.id);
    },
    onError(err) {
      console.error('Failed to accept ride:', err);
      setIncomingRide(null);
    },
  });

  const declineMutation = trpc.ride.decline.useMutation({
    onSuccess() {
      setIncomingRide(null);
    },
    onError(err) {
      console.error('Failed to decline ride:', err);
      setIncomingRide(null);
    },
  });

  const startNavMutation = trpc.ride.startNavigation.useMutation({
    onSuccess(updated) {
      setActiveRide((prev) =>
        prev ? { ...prev, status: updated.status as RideStatus } : null
      );
    },
  });

  const arrivedMutation = trpc.ride.arrivedAtPickup.useMutation({
    onSuccess(updated) {
      setActiveRide((prev) =>
        prev ? { ...prev, status: updated.status as RideStatus } : null
      );
    },
  });

  const startTripMutation = trpc.ride.startTrip.useMutation({
    onSuccess(updated) {
      setActiveRide((prev) =>
        prev ? { ...prev, status: updated.status as RideStatus } : null
      );
    },
  });

  const completeTripMutation = trpc.ride.completeTrip.useMutation({
    onSuccess(updated) {
      setActiveRide((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status as RideStatus,
              fareFinal: updated.fareFinal,
            }
          : null
      );
      // Aggregate earnings
      const finalFare = updated.fareFinal ?? updated.fareEstimate ?? 0;
      setSessionEarnings((prev) => prev + finalFare);
      setCompletedTripsCount((prev) => prev + 1);
    },
  });

  const submitRatingMutation = trpc.ride.submitRating.useMutation({
    onSuccess(updated) {
      setActiveRide((prev) =>
        prev ? { ...prev, status: updated.status as RideStatus } : null
      );
    },
  });

  const cancelMutation = trpc.ride.cancel.useMutation({
    onSuccess() {
      setActiveRide(null);
      session.clearActiveRide();
    },
  });

  // Action Handlers
  const handleAcceptRide = useCallback(
    (rideId: string) => {
      acceptMutation.mutate({
        rideId,
        driverSessionId: defaultDriverSeed.id,
      });
    },
    [acceptMutation, defaultDriverSeed.id]
  );

  const handleDeclineRide = useCallback(
    (rideId: string) => {
      declineMutation.mutate({
        rideId,
        driverSessionId: defaultDriverSeed.id,
      });
    },
    [declineMutation, defaultDriverSeed.id]
  );

  const handleStartNav = useCallback(() => {
    if (activeRide) {
      startNavMutation.mutate({ rideId: activeRide.id });
    }
  }, [activeRide, startNavMutation]);

  const handleArrived = useCallback(() => {
    if (activeRide) {
      arrivedMutation.mutate({ rideId: activeRide.id });
    }
  }, [activeRide, arrivedMutation]);

  const handleStartTrip = useCallback(() => {
    if (activeRide) {
      startTripMutation.mutate({ rideId: activeRide.id });
    }
  }, [activeRide, startTripMutation]);

  const handleCompleteTrip = useCallback(
    (fareFinal?: number) => {
      if (activeRide) {
        completeTripMutation.mutate({
          rideId: activeRide.id,
          fareFinal,
        });
      }
    },
    [activeRide, completeTripMutation]
  );

  const handleFinishCompleted = useCallback(() => {
    setActiveRide(null);
    session.clearActiveRide();
  }, [session]);

  const handleSubmitRating = useCallback(
    (rating: number, feedback?: string) => {
      if (activeRide) {
        submitRatingMutation.mutate({
          rideId: activeRide.id,
          rating,
          feedback,
        });
      }
    },
    [activeRide, submitRatingMutation]
  );

  // Compute Current Flow State
  const flowState = useMemo(() => {
    return getDriverFlowState({
      isOnline,
      hasIncomingAlert: !!incomingRide,
      activeRide,
    });
  }, [isOnline, incomingRide, activeRide]);

  // Route Coordinates for Map
  const activeRoute = useMemo<[number, number][]>(() => {
    if (!activeRide) return [];

    if (
      activeRide.status === 'DRIVER_ASSIGNED' ||
      activeRide.status === 'DRIVER_EN_ROUTE'
    ) {
      // Route from driver current position to pickup point
      return [
        [driverLocation.lat, driverLocation.lng],
        [activeRide.pickupLat, activeRide.pickupLng],
      ];
    }

    if (
      activeRide.status === 'ARRIVED_AT_PICKUP' ||
      activeRide.status === 'IN_PROGRESS'
    ) {
      // Route from pickup to dropoff
      return [
        [activeRide.pickupLat, activeRide.pickupLng],
        [activeRide.dropoffLat, activeRide.dropoffLng],
      ];
    }

    return [];
  }, [activeRide, driverLocation]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white flex flex-col font-sans select-none">
      {/* Top Floating App Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 pointer-events-none">
        {/* Brand Logo & Name */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-neutral-950/90 border border-neutral-800 rounded-full px-4 py-2 shadow-xl backdrop-blur-md">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-black text-xs text-white">
            G
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            GariKoi <span className="text-emerald-400 font-semibold text-xs">DRIVER</span>
          </span>
        </div>

        {/* Status Indicator & Live Demand Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          {isOnline && heatmapCells.length > 0 && !activeRide && (
            <div className="flex items-center gap-1.5 bg-neutral-950/90 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 shadow-xl backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>High Demand Areas</span>
            </div>
          )}

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xl backdrop-blur-md ${
              isOnline
                ? 'bg-neutral-950/90 border-emerald-700/80 text-emerald-400'
                : 'bg-neutral-950/90 border-neutral-800 text-neutral-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'
              }`}
            />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </header>

      {/* Main Interactive Map Viewport */}
      <main className="relative flex-1 w-full h-full">
        <MapBase
          center={[driverLocation.lat, driverLocation.lng]}
          zoom={14}
          className="w-full h-full"
        >
          {/* Live Heatmap Layer: Renders live rider demand clusters when Online and not on active trip */}
          {isOnline && !activeRide && heatmapCells.length > 0 && (
            <DensityHeatmap cells={heatmapCells} opacity={0.75} />
          )}

          {/* Active Navigation / Trip Route Layer */}
          {activeRoute.length >= 2 && (
            <RouteLayer
              coordinates={activeRoute}
              color="#006a4e"
              width={6}
              opacity={0.95}
            />
          )}

          {/* Live Driver Position Marker */}
          <DriverMarker
            position={[driverLocation.lat, driverLocation.lng]}
            bearing={driverLocation.bearing ?? 0}
            vehicleType={activeRide?.vehicleType ?? selectedVehicle}
          />
        </MapBase>
      </main>

      {/* Bottom Floating Control Panel: Switches dynamically based on driver flow state */}
      <section className="absolute bottom-0 left-0 right-0 z-40 p-3 sm:p-5 flex justify-center pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto transition-all duration-300">
          {/* State 1: OFFLINE or ONLINE_STANDBY */}
          {(flowState === 'OFFLINE' || flowState === 'ONLINE_STANDBY') && (
            <OnlineToggle
              isOnline={isOnline}
              onToggleOnline={(next) => setIsOnline(next)}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={(v) => setSelectedVehicle(v)}
              sessionEarnings={sessionEarnings}
              completedTripsCount={completedTripsCount}
              driverName={defaultDriverSeed.name}
            />
          )}

          {/* State 2: EN_ROUTE_PICKUP */}
          {flowState === 'EN_ROUTE_PICKUP' && activeRide && (
            <NavigateToPickup
              ride={activeRide}
              driverLocation={driverLocation}
              onStartNavigation={handleStartNav}
              onArrived={handleArrived}
              onCancel={() => cancelMutation.mutate({ rideId: activeRide.id })}
              isActionLoading={
                startNavMutation.isPending || arrivedMutation.isPending
              }
            />
          )}

          {/* State 3: ARRIVED_PICKUP or TRIP_IN_PROGRESS */}
          {(flowState === 'ARRIVED_PICKUP' || flowState === 'TRIP_IN_PROGRESS') &&
            activeRide && (
              <TripActiveDriver
                ride={activeRide}
                driverLocation={driverLocation}
                onStartTrip={handleStartTrip}
                onCompleteTrip={handleCompleteTrip}
                isActionLoading={
                  startTripMutation.isPending || completeTripMutation.isPending
                }
              />
            )}

          {/* State 4: TRIP_COMPLETED */}
          {flowState === 'TRIP_COMPLETED' && activeRide && (
            <TripCompletedDriver
              ride={activeRide}
              onSubmitRating={handleSubmitRating}
              onBackOnline={handleFinishCompleted}
              isSubmittingRating={submitRatingMutation.isPending}
            />
          )}
        </div>
      </section>

      {/* Modal Dispatch Overlay: INCOMING_DISPATCH */}
      {incomingRide && (
        <IncomingRideAlert
          ride={incomingRide}
          countdownSeconds={15}
          onAccept={handleAcceptRide}
          onDecline={handleDeclineRide}
          onTimeout={handleDeclineRide}
        />
      )}
    </div>
  );
}

export default function DriverPage() {
  return (
    <TRPCProvider>
      <DriverFlowContent />
    </TRPCProvider>
  );
}

