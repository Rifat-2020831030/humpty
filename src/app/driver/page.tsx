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
  DriverBottomNav,
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

  // High-demand passenger hotspot clusters centered around:
  // Location 1: 23.790584354558263, 90.39968461849804 (Banani / Kakoli Hub)
  // Location 2: 23.778363865941, 90.39804578897022 (Mohakhali Hub)
  const PASSENGER_HEATMAP_HOTSPOTS: HeatmapCell[] = useMemo(
    () => [
      // --- Location 1: Banani / Kakoli Hub (Epicenter + Wide Range Coverage) ---
      { lat: 23.790584354558263, lng: 90.39968461849804, intensity: 10 },
      { lat: 23.7922, lng: 90.4010, intensity: 8 },
      { lat: 23.7890, lng: 90.3982, intensity: 8 },
      { lat: 23.7925, lng: 90.3980, intensity: 7 },
      { lat: 23.7885, lng: 90.4015, intensity: 7 },
      { lat: 23.7908, lng: 90.4030, intensity: 7 },
      { lat: 23.7902, lng: 90.3965, intensity: 7 },
      { lat: 23.7935, lng: 90.3998, intensity: 6 },
      { lat: 23.7875, lng: 90.3995, intensity: 6 },

      // --- Location 2: Mohakhali Hub (Epicenter + Wide Range Coverage) ---
      { lat: 23.778363865941, lng: 90.39804578897022, intensity: 10 },
      { lat: 23.7802, lng: 90.3995, intensity: 8 },
      { lat: 23.7765, lng: 90.3966, intensity: 8 },
      { lat: 23.7805, lng: 90.3962, intensity: 7 },
      { lat: 23.7762, lng: 90.3998, intensity: 7 },
      { lat: 23.7786, lng: 90.4014, intensity: 7 },
      { lat: 23.7781, lng: 90.3948, intensity: 7 },
      { lat: 23.7815, lng: 90.3982, intensity: 6 },
      { lat: 23.7752, lng: 90.3978, intensity: 6 },
    ],
    []
  );

  // Heatmap density cells - pre-populated with high-demand passenger hotspots
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>(PASSENGER_HEATMAP_HOTSPOTS);

  // Heatmap visibility toggle - defaults to OFF
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Active in-flight ride & incoming alert state
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [incomingRide, setIncomingRide] = useState<IncomingRideData | null>(null);

  // Poll driver demand heatmap every 8s
  const densityQuery = trpc.driver.getDensity.useQuery(undefined, {
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (densityQuery.data && densityQuery.data.length > 0) {
      setHeatmapCells([...PASSENGER_HEATMAP_HOTSPOTS, ...densityQuery.data]);
    } else {
      setHeatmapCells(PASSENGER_HEATMAP_HOTSPOTS);
    }
  }, [densityQuery.data, PASSENGER_HEATMAP_HOTSPOTS]);

  // Poll for incoming rides via HTTP (1.5s interval)
  const pendingRideQuery = trpc.ride.getPending.useQuery(
    { vehicleType: selectedVehicle },
    {
      enabled: isOnline && !activeRide && !incomingRide,
      refetchInterval: 1500,
    }
  );

  useEffect(() => {
    if (pendingRideQuery.data && !activeRide && isOnline && !incomingRide) {
      setIncomingRide({
        rideId: pendingRideQuery.data.id,
        vehicleType: pendingRideQuery.data.vehicleType as VehicleType,
        pickupAddress: pendingRideQuery.data.pickupAddress,
        dropoffAddress: pendingRideQuery.data.dropoffAddress,
        fareEstimate: pendingRideQuery.data.fareEstimate,
        distanceKm: pendingRideQuery.data.distanceKm,
        driverSessionId: pendingRideQuery.data.driverSessionId,
      });
    }
  }, [pendingRideQuery.data, activeRide, isOnline, incomingRide]);

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

  // Poll active ride status updates via HTTP (1.5s interval)
  const activeRideStatusQuery = trpc.ride.getById.useQuery(
    { id: activeRide?.id ?? '' },
    {
      enabled: !!activeRide?.id && !activeRide.id.startsWith('demo-'),
      refetchInterval: 1500,
    }
  );

  useEffect(() => {
    if (activeRideStatusQuery.data && activeRide) {
      if (activeRideStatusQuery.data.status !== activeRide.status) {
        setActiveRide((prev) =>
          prev
            ? {
                ...prev,
                status: activeRideStatusQuery.data.status as RideStatus,
                fareFinal: activeRideStatusQuery.data.fareFinal ?? prev.fareFinal,
              }
            : null
        );
      }
    }
  }, [activeRideStatusQuery.data, activeRide]);

  // Smooth simulated movement during active trip (towards pickup or destination)
  useEffect(() => {
    if (!activeRide) return;
    const isEnRoute =
      activeRide.status === 'DRIVER_ASSIGNED' || activeRide.status === 'DRIVER_EN_ROUTE';
    const isInProgress = activeRide.status === 'IN_PROGRESS';

    if (!isEnRoute && !isInProgress) return;

    const targetCoord = isEnRoute
      ? { lat: activeRide.pickupLat, lng: activeRide.pickupLng }
      : { lat: activeRide.dropoffLat, lng: activeRide.dropoffLng };

    const interval = setInterval(() => {
      setDriverLocation((prev) => {
        const dLat = targetCoord.lat - prev.lat;
        const dLng = targetCoord.lng - prev.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist < 0.0004) {
          return { lat: targetCoord.lat, lng: targetCoord.lng, bearing: prev.bearing };
        }

        const step = 0.12;
        const nextLat = prev.lat + dLat * step;
        const nextLng = prev.lng + dLng * step;
        const bearing = (Math.atan2(dLng, dLat) * 180) / Math.PI;

        return { lat: nextLat, lng: nextLng, bearing };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    activeRide?.id,
    activeRide?.status,
    activeRide?.pickupLat,
    activeRide?.pickupLng,
    activeRide?.dropoffLat,
    activeRide?.dropoffLng,
  ]);

  // tRPC Driver Workflow Mutations
  const acceptMutation = trpc.ride.accept.useMutation({
    onSuccess(ride) {
      setIncomingRide(null);
      setActiveRide(ride as unknown as ActiveRide);
      session.setActiveRideId(ride.id);
    },
    onError(err) {
      console.warn('Accept fallback for demo mode:', err);
      if (incomingRide) {
        setActiveRide({
          id: incomingRide.rideId,
          status: 'DRIVER_ASSIGNED',
          vehicleType: incomingRide.vehicleType,
          pickupLat: 23.7925,
          pickupLng: 90.4078,
          pickupAddress: incomingRide.pickupAddress,
          dropoffLat: 23.7465,
          dropoffLng: 90.3760,
          dropoffAddress: incomingRide.dropoffAddress,
          fareEstimate: incomingRide.fareEstimate,
          distanceKm: incomingRide.distanceKm,
        } as ActiveRide);
        setIncomingRide(null);
      }
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

        {/* Controls: Heatmap Toggle & Online Status Indicator */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* On-Off Heatmap Toggle Button (Defaults to OFF) */}
          <button
            type="button"
            onClick={() => setShowHeatmap((prev) => !prev)}
            aria-label="Toggle passenger heatmap"
            title={showHeatmap ? 'Turn off passenger heatmap' : 'Turn on passenger heatmap'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
              showHeatmap
                ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 shadow-amber-500/20'
                : 'bg-neutral-950/90 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            <Flame
              className={`w-3.5 h-3.5 transition-colors ${
                showHeatmap ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-neutral-500'
              }`}
            />
            <span className="hidden sm:inline">Heatmap:</span>
            <span className="font-bold">{showHeatmap ? 'ON' : 'OFF'}</span>
            <div
              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                showHeatmap ? 'bg-amber-500 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-sm transition-transform" />
            </div>
          </button>

          {/* Online/Offline Status */}
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
          {/* Live Heatmap Layer: Renders passenger demand clusters when toggle is ON and not on active trip */}
          {showHeatmap && !activeRide && heatmapCells.length > 0 && (
            <DensityHeatmap cells={heatmapCells} opacity={0.85} />
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
            <>
              <OnlineToggle
                isOnline={isOnline}
                onToggleOnline={(next) => setIsOnline(next)}
                selectedVehicle={selectedVehicle}
                onSelectVehicle={(v) => setSelectedVehicle(v)}
                sessionEarnings={sessionEarnings}
                completedTripsCount={completedTripsCount}
                driverName={defaultDriverSeed.name}
              />
              <div className="mt-2.5">
                <DriverBottomNav activeTab="drive" className="rounded-2xl border border-neutral-800 shadow-xl" />
              </div>
            </>
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

