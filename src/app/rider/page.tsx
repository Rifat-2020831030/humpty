'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { trpc } from '../../trpc/client';
import { useSession } from '../../hooks/useSession';
import { useLocation } from '../../hooks/useLocation';
import { DHAKA_CENTER, SEED_DRIVERS } from '../../lib/constants';
import { calculateDistance, calculateBearing } from '../../lib/geo';
import { calculateFare, VEHICLE_RATES } from '../../lib/fare';
import { VehicleType, RideStatus, LocationResult } from '../../types';
import {
  HomeScreen,
  LocationSearch,
  FareSelector,
  SearchingOverlay,
  DriverCard,
  TripActiveHUD,
  TripCompleted,
  RatingScreen,
} from '../../components/rider';
import {
  MapBase,
  LocationPicker,
  DriverMarker,
  RouteLayer,
} from '../../components/map';
import { TRPCProvider } from '../../trpc/Provider';

export type RiderFlowStep =
  | 'HOME'
  | 'LOCATION_SEARCH'
  | 'FARE_SELECT'
  | 'MANUAL_PIN_PICKER'
  | 'SEARCHING'
  | 'RATING_SCREEN';

function RiderContent() {
  const { sessionId, role, setRole } = useSession();
  const utils = trpc.useUtils();

  const {
    location: userLocation,
    mode: locationMode,
    error: locationError,
    requestGPS,
    setManualPin,
    clearError: clearLocationError,
  } = useLocation({
    initialLocation: {
      lat: DHAKA_CENTER[0],
      lng: DHAKA_CENTER[1],
      displayName: 'Banani / Mohakhali, Dhaka',
    },
  });

  // Flow State
  const [currentStep, setCurrentStep] = useState<RiderFlowStep>('HOME');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('BIKE');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  // Search Inputs
  const [pickupText, setPickupText] = useState<string>('Banani / Mohakhali, Dhaka');
  const [dropoffText, setDropoffText] = useState<string>('');
  const [aiMode, setAiMode] = useState<boolean>(false);
  const [pickupCoord, setPickupCoord] = useState<{ lat: number; lng: number }>({
    lat: DHAKA_CENTER[0],
    lng: DHAKA_CENTER[1],
  });
  const [dropoffCoord, setDropoffCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);

  // Manual Center Pin Picker State
  const [pinPickerTarget, setPinPickerTarget] = useState<'pickup' | 'dropoff'>('pickup');
  const [centerPinCoord, setCenterPinCoord] = useState<{ lat: number; lng: number }>({
    lat: DHAKA_CENTER[0],
    lng: DHAKA_CENTER[1],
  });
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);

  // Confirming / Dispatching loading state
  const [isConfirmingRide, setIsConfirmingRide] = useState<boolean>(false);

  // Active Ride & Driver tracking
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus | null>(null);
  const isTripActive = Boolean(
    rideStatus &&
    ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED_AT_PICKUP'].includes(rideStatus)
  );
  const [driverCoord, setDriverCoord] = useState<{ lat: number; lng: number; bearing?: number } | null>(null);

  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessageText, setChatMessageText] = useState<string>('');

  // Active ride query
  const activeRideQuery = trpc.ride.getActive.useQuery(
    { sessionId },
    {
      enabled: Boolean(sessionId),
      refetchInterval: activeRideId ? 3000 : false,
    }
  );

  // tRPC Mutations
  const requestMutation = trpc.ride.request.useMutation();
  const cancelMutation = trpc.ride.cancel.useMutation();
  const submitRatingMutation = trpc.ride.submitRating.useMutation();
  const aiSearchMutation = trpc.location.aiSearch.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const autoAssignMutation = trpc.ride.autoAssign.useMutation();
  const arrivedMutation = trpc.ride.arrivedAtPickup.useMutation();
  const startTripMutation = trpc.ride.startTrip.useMutation();
  const completeTripMutation = trpc.ride.completeTrip.useMutation();

  // Chat messages query
  const chatMessagesQuery = trpc.chat.getMessages.useQuery(
    { rideId: activeRideId || '' },
    { enabled: Boolean(activeRideId && isChatOpen), refetchInterval: isChatOpen ? 2000 : false }
  );

  // Ensure role is RIDER
  useEffect(() => {
    if (role !== 'RIDER') {
      setRole('RIDER');
    }
  }, [role, setRole]);

  // Sync active ride from query safely
  useEffect(() => {
    if (activeRideQuery.data) {
      setActiveRideId(activeRideQuery.data.id);
      setRideStatus(activeRideQuery.data.status as RideStatus);
      if (activeRideQuery.data.vehicleType) {
        setSelectedVehicle(activeRideQuery.data.vehicleType as VehicleType);
      }
    }
  }, [activeRideQuery.data]);

  // Auto-resolve search to a driver after 5 seconds
  useEffect(() => {
    if (rideStatus === 'SEARCHING' && activeRideId) {
      const timer = setTimeout(() => {
        autoAssignMutation.mutate(
          { rideId: activeRideId },
          {
            onSuccess(updated) {
              setRideStatus(updated.status as RideStatus);
              utils.ride.getActive.setData({ sessionId }, updated);
            },
          }
        );
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [rideStatus, activeRideId]);

  // Sync user location to pickup text when GPS / manual changes
  useEffect(() => {
    if (userLocation) {
      setPickupCoord({ lat: userLocation.lat, lng: userLocation.lng });
      if (userLocation.displayName) {
        setPickupText(userLocation.displayName);
      }
    }
  }, [userLocation]);

  // HTTP Polling for active ride status (1.5s interval)
  const currentRideQuery = trpc.ride.getById.useQuery(
    { id: activeRideId || '' },
    {
      enabled: Boolean(activeRideId),
      refetchInterval: 1500,
    }
  );

  useEffect(() => {
    if (currentRideQuery.data?.status) {
      setRideStatus(currentRideQuery.data.status as RideStatus);
    }
  }, [currentRideQuery.data?.status]);

  // HTTP Polling for simulated driver location from server
  const driverLocQuery = trpc.ride.getDriverLocation.useQuery(
    { rideId: activeRideId || '' },
    {
      enabled: Boolean(activeRideId && isTripActive),
      refetchInterval: 1000,
    }
  );

  useEffect(() => {
    if (driverLocQuery.data) {
      setDriverCoord({
        lat: driverLocQuery.data.lat,
        lng: driverLocQuery.data.lng,
        bearing: driverLocQuery.data.bearing,
      });
    }
  }, [driverLocQuery.data]);

  // Local simulated driver movement along route for smooth demo
  useEffect(() => {
    if (!activeRideId || !pickupCoord) return;

    // Phase 1: Driver approaching pickup
    if (rideStatus === 'DRIVER_ASSIGNED' || rideStatus === 'DRIVER_EN_ROUTE') {
      if (!driverCoord) {
        setDriverCoord({
          lat: pickupCoord.lat + 0.005,
          lng: pickupCoord.lng + 0.004,
          bearing: calculateBearing(
            pickupCoord.lat + 0.005,
            pickupCoord.lng + 0.004,
            pickupCoord.lat,
            pickupCoord.lng
          ),
        });
        return;
      }

      const timer = setInterval(() => {
        setDriverCoord((prev) => {
          if (!prev) return prev;
          const distKm = calculateDistance(prev.lat, prev.lng, pickupCoord.lat, pickupCoord.lng);
          if (distKm <= 0.035) {
            setRideStatus('ARRIVED_AT_PICKUP');
            arrivedMutation.mutate({ rideId: activeRideId });
            return { lat: pickupCoord.lat, lng: pickupCoord.lng, bearing: prev.bearing };
          }
          const step = 0.16;
          const nextLat = prev.lat + (pickupCoord.lat - prev.lat) * step;
          const nextLng = prev.lng + (pickupCoord.lng - prev.lng) * step;
          const bearing = calculateBearing(prev.lat, prev.lng, pickupCoord.lat, pickupCoord.lng);
          return { lat: nextLat, lng: nextLng, bearing };
        });
      }, 1000);

      return () => clearInterval(timer);
    }

    // Phase 2: Driver arrived at pickup -> automatically start trip after 3.5s in demo
    if (rideStatus === 'ARRIVED_AT_PICKUP') {
      const startTimer = setTimeout(() => {
        setRideStatus('IN_PROGRESS');
        startTripMutation.mutate({ rideId: activeRideId });
      }, 3500);
      return () => clearTimeout(startTimer);
    }

    // Phase 3: Trip in progress towards dropoff
    if (rideStatus === 'IN_PROGRESS' && dropoffCoord) {
      const timer = setInterval(() => {
        setDriverCoord((prev) => {
          if (!prev) return prev;
          const distKm = calculateDistance(prev.lat, prev.lng, dropoffCoord.lat, dropoffCoord.lng);
          if (distKm <= 0.035) {
            setRideStatus('COMPLETED');
            completeTripMutation.mutate({ rideId: activeRideId });
            return { lat: dropoffCoord.lat, lng: dropoffCoord.lng, bearing: prev.bearing };
          }
          const step = 0.14;
          const nextLat = prev.lat + (dropoffCoord.lat - prev.lat) * step;
          const nextLng = prev.lng + (dropoffCoord.lng - prev.lng) * step;
          const bearing = calculateBearing(prev.lat, prev.lng, dropoffCoord.lat, dropoffCoord.lng);
          return { lat: nextLat, lng: nextLng, bearing };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    rideStatus,
    activeRideId,
    pickupCoord,
    dropoffCoord,
    driverCoord,
    arrivedMutation,
    startTripMutation,
    completeTripMutation,
  ]);

  // Matched Driver Details
  const matchedDriver = useMemo(() => {
    const defaultDriver = SEED_DRIVERS.find((d) => d.vehicleType === selectedVehicle) || SEED_DRIVERS[0];
    const activeDriverName = activeRideQuery.data?.driverName;
    const activeDriverVehicle = activeRideQuery.data?.driverVehicle;
    const activeDriverPlate = activeRideQuery.data?.driverPlate;
    const activeDriverRating = activeRideQuery.data?.driverRating;

    return {
      name: activeDriverName || defaultDriver.name,
      vehicle: activeDriverVehicle || defaultDriver.vehicle,
      plate: activeDriverPlate || defaultDriver.plate,
      rating: activeDriverRating || defaultDriver.rating,
      phone: defaultDriver.phone,
    };
  }, [activeRideQuery.data, selectedVehicle]);

  // Calculate Distance & Fare
  const routeDistanceKm = useMemo(() => {
    if (!pickupCoord || !dropoffCoord) {
      return 2.5;
    }
    const dist = calculateDistance(
      pickupCoord.lat,
      pickupCoord.lng,
      dropoffCoord.lat,
      dropoffCoord.lng
    );
    return Math.max(0.5, Math.round(dist * 10) / 10);
  }, [pickupCoord, dropoffCoord]);

  const fareBreakdown = useMemo(() => {
    return calculateFare(selectedVehicle, routeDistanceKm);
  }, [selectedVehicle, routeDistanceKm]);

  // Handle Location Search Submission
  const handleSubmitLocationSearch = async () => {
    if (!dropoffText.trim()) return;
    setIsSearchingLocation(true);

    try {
      let matchedCoord: { lat: number; lng: number } = { lat: 23.7828, lng: 90.3985 };

      if (aiMode) {
        const aiResult = await aiSearchMutation.mutateAsync({
          query: dropoffText,
          contextLat: pickupCoord.lat,
          contextLng: pickupCoord.lng,
        });
        if (aiResult && aiResult.lat && aiResult.lng) {
          matchedCoord = { lat: aiResult.lat, lng: aiResult.lng };
          if (aiResult.displayName) {
            setDropoffText(aiResult.displayName);
          }
        }
      } else {
        const queryLower = dropoffText.toLowerCase();
        if (queryLower.includes('gulshan')) {
          matchedCoord = { lat: 23.7925, lng: 90.4078 };
        } else if (queryLower.includes('banani')) {
          matchedCoord = { lat: 23.7940, lng: 90.4043 };
        } else if (queryLower.includes('dhanmondi')) {
          matchedCoord = { lat: 23.7534, lng: 90.3773 };
        } else if (queryLower.includes('motijheel')) {
          matchedCoord = { lat: 23.7330, lng: 90.4172 };
        } else if (queryLower.includes('uttara') || queryLower.includes('airport')) {
          matchedCoord = { lat: 23.8433, lng: 90.4030 };
        } else if (queryLower.includes('mirpur')) {
          matchedCoord = { lat: 23.8070, lng: 90.3680 };
        } else {
          matchedCoord = {
            lat: pickupCoord.lat + 0.015,
            lng: pickupCoord.lng + 0.012,
          };
        }
      }

      setDropoffCoord(matchedCoord);
      setCurrentStep('FARE_SELECT');
    } catch (err) {
      console.error('Error resolving location:', err);
      setDropoffCoord({ lat: 23.7925, lng: 90.4078 });
      setCurrentStep('FARE_SELECT');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Open Manual Center Pin Picker
  const handleOpenManualPinPicker = (target: 'pickup' | 'dropoff') => {
    setPinPickerTarget(target);
    const initial = target === 'pickup' ? pickupCoord : (dropoffCoord || pickupCoord);
    setCenterPinCoord(initial);
    setCurrentStep('MANUAL_PIN_PICKER');
  };

  // Confirm Manual Pin Point
  const handleConfirmManualPin = () => {
    if (pinPickerTarget === 'pickup') {
      setPickupCoord(centerPinCoord);
      setPickupText(`Manual Pin (${centerPinCoord.lat.toFixed(4)}, ${centerPinCoord.lng.toFixed(4)})`);
      setManualPin(centerPinCoord.lat, centerPinCoord.lng);
      setCurrentStep('LOCATION_SEARCH');
    } else {
      setDropoffCoord(centerPinCoord);
      setDropoffText(`Manual Pin (${centerPinCoord.lat.toFixed(4)}, ${centerPinCoord.lng.toFixed(4)})`);
      setCurrentStep('FARE_SELECT');
    }
  };

  // Handle Ride Booking Request
  const handleConfirmRide = async () => {
    if (!pickupCoord || !dropoffCoord) return;
    setIsConfirmingRide(true);

    try {
      const ride = await requestMutation.mutateAsync({
        vehicleType: selectedVehicle,
        pickupLat: pickupCoord.lat,
        pickupLng: pickupCoord.lng,
        pickupAddress: pickupText || 'Banani / Mohakhali, Dhaka',
        dropoffLat: dropoffCoord.lat,
        dropoffLng: dropoffCoord.lng,
        dropoffAddress: dropoffText || 'Dhaka Destination',
        riderSessionId: sessionId,
      });

      setActiveRideId(ride.id);
      setRideStatus('SEARCHING');
      utils.ride.getActive.setData({ sessionId }, ride);

      // Brief transition delay so user perceives the dispatching confirmation
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep('SEARCHING');
    } catch (err) {
      console.error('Failed to request ride:', err);
    } finally {
      setIsConfirmingRide(false);
    }
  };

  // Handle Cancel
  const handleCancelRide = async () => {
    if (!activeRideId) return;
    try {
      await cancelMutation.mutateAsync({ rideId: activeRideId });
      setActiveRideId(null);
      setRideStatus(null);
      setCurrentStep('HOME');
      utils.ride.getActive.setData({ sessionId }, null);
    } catch (err) {
      console.error('Failed to cancel ride:', err);
    }
  };

  // Handle Rating Submission
  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (!activeRideId) return;
    try {
      await submitRatingMutation.mutateAsync({
        rideId: activeRideId,
        rating,
        feedback,
      });
      setActiveRideId(null);
      setRideStatus(null);
      setCurrentStep('HOME');
      utils.ride.getActive.setData({ sessionId }, null);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  // Promo Code Application
  const handleApplyPromo = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (upper === 'DHAKA20') {
      setPromoCode('DHAKA20');
      setPromoDiscount(20);
    } else if (upper === 'GARIKOI30') {
      setPromoCode('GARIKOI30');
      setPromoDiscount(30);
    }
  };

  // Chat message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeRideId) return;

    try {
      await sendMessageMutation.mutateAsync({
        rideId: activeRideId,
        senderRole: 'RIDER',
        text: chatMessageText.trim(),
      });
      setChatMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white flex flex-col font-sans select-none">
      {/* Central Interactive Map Area */}
      <div className="absolute inset-0 z-0">
        <MapBase
          center={
            currentStep === 'MANUAL_PIN_PICKER'
              ? [centerPinCoord.lat, centerPinCoord.lng]
              : [pickupCoord.lat, pickupCoord.lng]
          }
          zoom={14}
          onMapMove={(c) => {
            if (currentStep === 'MANUAL_PIN_PICKER') {
              setCenterPinCoord(c);
            }
          }}
          onMapMoveStart={() => {
            if (currentStep === 'MANUAL_PIN_PICKER') {
              setIsMapMoving(true);
            }
          }}
          onMapMoveEnd={(c) => {
            if (currentStep === 'MANUAL_PIN_PICKER') {
              setCenterPinCoord(c);
              setIsMapMoving(false);
            }
          }}
          className="w-full h-full"
        >
          {/* Normal Mode Map Layers (hidden during Center-Pin manual picker mode) */}
          {currentStep !== 'MANUAL_PIN_PICKER' && (
            <>
              {/* Pickup Marker */}
              <LocationPicker
                currentPin={pickupCoord}
                label="Pickup"
                onPinChange={(pos: { lat: number; lng: number }) => {
                  setPickupCoord({ lat: pos.lat, lng: pos.lng });
                  setManualPin(pos.lat, pos.lng);
                }}
              />

              {/* Dropoff Marker if selected */}
              {dropoffCoord && (
                <LocationPicker
                  currentPin={dropoffCoord}
                  label="Dropoff"
                />
              )}

              {/* Route Layer when both pickup and dropoff exist */}
              {dropoffCoord && (
                <RouteLayer
                  coordinates={[
                    [pickupCoord.lat, pickupCoord.lng],
                    [
                      (pickupCoord.lat + dropoffCoord.lat) / 2 + 0.003,
                      (pickupCoord.lng + dropoffCoord.lng) / 2 + 0.002,
                    ],
                    [dropoffCoord.lat, dropoffCoord.lng],
                  ]}
                  color="#006a4e"
                  width={5}
                />
              )}

              {/* Driver Marker during active ride or seed drivers on Home */}
              {(isTripActive || rideStatus === 'IN_PROGRESS') && driverCoord ? (
                <DriverMarker
                  position={[driverCoord.lat, driverCoord.lng]}
                  bearing={driverCoord.bearing || 0}
                  vehicleType={selectedVehicle}
                />
              ) : (
                SEED_DRIVERS.map((d) => (
                  <DriverMarker
                    key={d.id}
                    id={d.id}
                    position={[d.lat, d.lng]}
                    vehicleType={d.vehicleType}
                  />
                ))
              )}
            </>
          )}
        </MapBase>
      </div>

      {/* Dead-Center Static Pin for Manual Pin Picker Mode */}
      {currentStep === 'MANUAL_PIN_PICKER' && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-30 flex flex-col items-center">
          {/* Badge Tooltip */}
          <div
            className={`px-3 py-1 mb-1.5 bg-neutral-950/95 border border-emerald-500 rounded-full text-xs font-semibold text-emerald-400 shadow-2xl backdrop-blur-md transition-all duration-200 ${
              isMapMoving ? '-translate-y-2 scale-105' : 'translate-y-0 scale-100'
            }`}
          >
            {pinPickerTarget === 'pickup' ? '📍 Set Pickup Point' : '🎯 Set Destination'}
          </div>

          {/* Elevated Pin Icon with smooth lift animation on map move */}
          <div
            className={`transition-all duration-200 ease-out origin-bottom ${
              isMapMoving ? '-translate-y-3 scale-110' : 'translate-y-0 scale-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="w-2.5 h-2.5 -mt-1 mx-auto rotate-45 bg-emerald-600 border-r-2 border-b-2 border-white" />
          </div>

          {/* Ground Shadow */}
          <div
            className={`w-4 h-1.5 rounded-full bg-black/50 blur-[1px] transition-all duration-200 ${
              isMapMoving ? 'scale-75 opacity-30 mt-3' : 'scale-100 opacity-70 mt-1'
            }`}
          />
        </div>
      )}

      {/* Main Overlay State Machine */}
      <div className="relative z-20 h-full flex-1 flex flex-col justify-between pointer-events-none p-3 max-w-md mx-auto w-full">
        {/* Step: MANUAL PIN PICKER CONFIRMATION CARD */}
        {currentStep === 'MANUAL_PIN_PICKER' ? (
          <div className="mt-auto pointer-events-auto">
            <div className="bg-neutral-950/95 border border-neutral-800 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                    {pinPickerTarget === 'pickup' ? 'Pickup Location' : 'Destination'}
                  </span>
                  <p className="text-sm font-semibold text-white truncate max-w-xs">
                    {pinPickerTarget === 'pickup' ? 'Banani / Mohakhali' : 'Dhaka Destination'}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-400">
                    {centerPinCoord.lat.toFixed(5)}, {centerPinCoord.lng.toFixed(5)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('LOCATION_SEARCH')}
                  className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmManualPin}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm {pinPickerTarget === 'pickup' ? 'Pickup' : 'Destination'} Point</span>
              </button>
            </div>
          </div>
        ) : isConfirmingRide ? (
          /* Step: CONFIRMING / DISPATCHING LOADING STATE */
          <div className="my-auto pointer-events-auto">
            <div className="bg-neutral-950/95 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md text-center space-y-4 max-w-sm mx-auto">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <span className="w-16 h-16 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin absolute" />
                <span className="w-4 h-4 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Requesting Ride...</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Connecting with nearby drivers in Banani / Mohakhali
                </p>
              </div>
              <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-400 inline-block">
                {selectedVehicle} • Est. Fare ৳{fareBreakdown.totalFare}
              </div>
            </div>
          </div>
        ) : rideStatus === 'RATED' || currentStep === 'RATING_SCREEN' ? (
          /* Step: RATING SCREEN */
          <div className="my-auto pointer-events-auto">
            <RatingScreen
              driverName={matchedDriver.name}
              driverVehicle={matchedDriver.vehicle}
              onSubmit={handleSubmitRating}
            />
          </div>
        ) : rideStatus === 'COMPLETED' ? (
          /* Step: TRIP COMPLETED */
          <div className="my-auto pointer-events-auto">
            <TripCompleted
              pickupAddress={pickupText}
              dropoffAddress={dropoffText || 'Dhaka Destination'}
              distanceKm={routeDistanceKm}
              baseFare={fareBreakdown.baseFare}
              distanceFare={fareBreakdown.distanceFare}
              totalFare={Math.max(0, fareBreakdown.totalFare - promoDiscount)}
              driverName={matchedDriver.name}
              onPayCash={() => setCurrentStep('RATING_SCREEN')}
            />
          </div>
        ) : rideStatus === 'IN_PROGRESS' ? (
          /* Step: TRIP IN PROGRESS HUD */
          <div className="mt-auto pointer-events-auto">
            <TripActiveHUD
              driverName={matchedDriver.name}
              vehiclePlate={matchedDriver.plate}
              currentFare={Math.max(0, fareBreakdown.totalFare - promoDiscount)}
              distanceTraveledKm={Math.min(routeDistanceKm, 2.4)}
              totalDistanceKm={routeDistanceKm}
              onSOS={() => {
                if (typeof window !== 'undefined') window.location.href = 'tel:999';
              }}
              onOpenChat={() => setIsChatOpen(true)}
            />
          </div>
        ) : isTripActive ? (
          /* Step: DRIVER ASSIGNED / EN ROUTE */
          <div className="mt-auto pointer-events-auto">
            <DriverCard
              driverName={matchedDriver.name}
              driverPlate={matchedDriver.plate}
              driverVehicle={matchedDriver.vehicle}
              driverRating={matchedDriver.rating}
              etaMinutes={rideStatus === 'ARRIVED_AT_PICKUP' ? 0 : 4}
              statusText={
                rideStatus === 'ARRIVED_AT_PICKUP'
                  ? 'Driver has arrived at pickup!'
                  : 'Driver is on the way'
              }
              onOpenChat={() => setIsChatOpen(true)}
            />
          </div>
        ) : rideStatus === 'SEARCHING' || currentStep === 'SEARCHING' ? (
          /* Step: SEARCHING OVERLAY */
          <div className="my-auto pointer-events-auto">
            <SearchingOverlay
              pickupAddress={pickupText}
              dropoffAddress={dropoffText || 'Dhaka Destination'}
              vehicleType={selectedVehicle}
              onCancel={handleCancelRide}
            />
          </div>
        ) : currentStep === 'FARE_SELECT' ? (
          /* Step: FARE SELECTOR */
          <div className="mt-auto pointer-events-auto">
            <div className="mb-2 flex justify-start">
              <button
                type="button"
                onClick={() => setCurrentStep('LOCATION_SEARCH')}
                className="px-3 py-1.5 bg-neutral-900/90 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:text-white"
              >
                ← Back to Search
              </button>
            </div>
            <FareSelector
              distanceKm={routeDistanceKm}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              onConfirm={handleConfirmRide}
              pickupAddress={pickupText}
              dropoffAddress={dropoffText || 'Dhaka Destination'}
              promoDiscount={promoDiscount}
              isLoading={requestMutation.isPending || isConfirmingRide}
            />
          </div>
        ) : currentStep === 'LOCATION_SEARCH' ? (
          /* Step: LOCATION SEARCH MODAL */
          <div className="mt-auto mb-4 pointer-events-auto">
            <div className="mb-2 flex justify-start">
              <button
                type="button"
                onClick={() => setCurrentStep('HOME')}
                className="px-3 py-1.5 bg-neutral-900/90 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:text-white"
              >
                ← Back to Map
              </button>
            </div>
            <LocationSearch
              pickupText={pickupText}
              dropoffText={dropoffText}
              onPickupChange={setPickupText}
              onDropoffChange={setDropoffText}
              onUseGPS={requestGPS}
              onSelectManually={() => handleOpenManualPinPicker('pickup')}
              onSelectDropoffManually={() => handleOpenManualPinPicker('dropoff')}
              aiMode={aiMode}
              onToggleAI={() => setAiMode(!aiMode)}
              onSubmitSearch={handleSubmitLocationSearch}
              isLoading={isSearchingLocation}
              error={locationError}
              onClearError={clearLocationError}
            />
          </div>
        ) : (
          /* Step: HOME SCREEN */
          <div className="h-full w-full pointer-events-none flex flex-col justify-between">
            <HomeScreen
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              onOpenSearch={() => setCurrentStep('LOCATION_SEARCH')}
              onApplyPromo={handleApplyPromo}
              userLocationName={pickupText}
            />
          </div>
        )}
      </div>

      {/* In-Trip Chat Drawer Modal */}
      {isChatOpen && activeRideId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end p-2 pointer-events-auto">
          <div className="w-full max-w-md mx-auto bg-neutral-950 border border-neutral-800 rounded-t-3xl p-4 flex flex-col max-h-[80vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-sm text-neutral-100">
                  Chat with {matchedDriver.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="text-neutral-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[160px] max-h-[300px]">
              {(chatMessagesQuery.data || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.senderRole === 'RIDER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                      msg.senderRole === 'RIDER'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-neutral-800 text-neutral-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5 px-1 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className="flex gap-1.5 overflow-x-auto py-2 border-t border-neutral-800/80 no-scrollbar">
              {['I am waiting here', 'Where are you?', 'Coming downstairs'].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      sendMessageMutation.mutate({
                        rideId: activeRideId,
                        senderRole: 'RIDER',
                        text: quick,
                      });
                    }}
                    className="flex-shrink-0 px-2.5 py-1 bg-neutral-900 border border-neutral-700/80 rounded-full text-[11px] text-neutral-300 hover:border-emerald-500 transition-colors"
                  >
                    {quick}
                  </button>
                )
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-neutral-800">
              <input
                type="text"
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                placeholder="Type a message to driver..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!chatMessageText.trim() || sendMessageMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function RiderPage() {
  return (
    <TRPCProvider>
      <RiderContent />
    </TRPCProvider>
  );
}
