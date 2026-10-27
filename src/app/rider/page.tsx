'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { trpc } from '../../trpc/client';
import { useSession } from '../../hooks/useSession';
import { useLocation } from '../../hooks/useLocation';
import { DHAKA_CENTER, SEED_DRIVERS } from '../../lib/constants';
import { calculateDistance } from '../../lib/geo';
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

type RiderFlowStep = 'HOME' | 'LOCATION_SEARCH' | 'FARE_SELECT' | 'RATING_SCREEN';

function RiderContent() {
  const { sessionId, role, setRole } = useSession();
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
      displayName: 'Dhaka City Center',
    },
  });

  // Flow State
  const [currentStep, setCurrentStep] = useState<RiderFlowStep>('HOME');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('BIKE');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  // Search Inputs
  const [pickupText, setPickupText] = useState<string>('Dhaka City Center');
  const [dropoffText, setDropoffText] = useState<string>('');
  const [aiMode, setAiMode] = useState<boolean>(false);
  const [pickupCoord, setPickupCoord] = useState<{ lat: number; lng: number }>({
    lat: DHAKA_CENTER[0],
    lng: DHAKA_CENTER[1],
  });
  const [dropoffCoord, setDropoffCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);

  // Active Ride & Driver tracking
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus | null>(null);
  const [driverCoord, setDriverCoord] = useState<{ lat: number; lng: number; bearing?: number } | null>(null);

  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessageText, setChatMessageText] = useState<string>('');

  // Active ride query
  const activeRideQuery = trpc.ride.getActive.useQuery(
    { sessionId },
    {
      enabled: Boolean(sessionId),
      refetchInterval: activeRideId ? 4000 : false,
    }
  );

  // tRPC Mutations
  const requestMutation = trpc.ride.request.useMutation();
  const cancelMutation = trpc.ride.cancel.useMutation();
  const submitRatingMutation = trpc.ride.submitRating.useMutation();
  const aiSearchMutation = trpc.location.aiSearch.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

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

  // Sync active ride from query
  useEffect(() => {
    if (activeRideQuery.data) {
      setActiveRideId(activeRideQuery.data.id);
      setRideStatus(activeRideQuery.data.status as RideStatus);
      if (activeRideQuery.data.vehicleType) {
        setSelectedVehicle(activeRideQuery.data.vehicleType as VehicleType);
      }
    } else if (activeRideQuery.isFetched && !activeRideQuery.data && activeRideId) {
      if (rideStatus !== 'COMPLETED' && rideStatus !== 'RATED') {
        setActiveRideId(null);
        setRideStatus(null);
      }
    }
  }, [activeRideQuery.data, activeRideQuery.isFetched, activeRideId, rideStatus]);

  // Sync user location to pickup text when GPS / manual changes
  useEffect(() => {
    if (userLocation) {
      setPickupCoord({ lat: userLocation.lat, lng: userLocation.lng });
      if (userLocation.displayName) {
        setPickupText(userLocation.displayName);
      }
    }
  }, [userLocation]);

  // Subscriptions for status and driver location
  trpc.ride.onStatusChange.useSubscription(
    { rideId: activeRideId || '' },
    {
      enabled: Boolean(activeRideId),
      onData(data) {
        if (data.status) {
          setRideStatus(data.status as RideStatus);
        }
      },
    }
  );

  trpc.ride.onDriverLocation.useSubscription(
    { rideId: activeRideId || '' },
    {
      enabled: Boolean(activeRideId),
      onData(data) {
        if (typeof data.lat === 'number' && typeof data.lng === 'number') {
          setDriverCoord({
            lat: data.lat,
            lng: data.lng,
            bearing: data.bearing ?? 0,
          });
        }
      },
    }
  );

  // Calculated distance between pickup and dropoff
  const routeDistanceKm = useMemo(() => {
    if (!pickupCoord || !dropoffCoord) {
      return 6.5; // Default Dhaka average distance
    }
    const dist = calculateDistance(
      pickupCoord.lat,
      pickupCoord.lng,
      dropoffCoord.lat,
      dropoffCoord.lng
    );
    return Math.max(0.8, Math.round(dist * 10) / 10);
  }, [pickupCoord, dropoffCoord]);

  // Handle Promo Application
  const handleApplyPromo = (code: string) => {
    setPromoCode(code);
    if (code === 'DHAKA20') {
      setPromoDiscount(25);
    } else if (code === 'GARIKOI30') {
      setPromoDiscount(30);
    } else {
      setPromoDiscount(20);
    }
  };

  // Handle Search Submission
  const handleSubmitLocationSearch = async () => {
    if (!dropoffText.trim()) return;

    setIsSearchingLocation(true);
    try {
      if (aiMode) {
        const result = await aiSearchMutation.mutateAsync({
          query: dropoffText,
          contextLat: pickupCoord.lat,
          contextLng: pickupCoord.lng,
        });

        if (result && typeof result.lat === 'number' && typeof result.lng === 'number') {
          setDropoffCoord({ lat: result.lat, lng: result.lng });
          setDropoffText(result.displayName || dropoffText);
          setCurrentStep('FARE_SELECT');
          return;
        }
      }

      // Default Dhaka landmarks fallback / resolution
      const queryLower = dropoffText.toLowerCase();
      let matchedCoord = { lat: 23.7925, lng: 90.4078 }; // Gulshan 2 default

      if (queryLower.includes('dhanmondi')) {
        matchedCoord = { lat: 23.7461, lng: 90.3742 };
      } else if (queryLower.includes('motijheel')) {
        matchedCoord = { lat: 23.733, lng: 90.4172 };
      } else if (queryLower.includes('uttara')) {
        matchedCoord = { lat: 23.8759, lng: 90.3795 };
      } else if (queryLower.includes('banani')) {
        matchedCoord = { lat: 23.7938, lng: 90.4043 };
      } else if (queryLower.includes('airport')) {
        matchedCoord = { lat: 23.8433, lng: 90.4042 };
      }

      setDropoffCoord(matchedCoord);
      setCurrentStep('FARE_SELECT');
    } catch (err) {
      console.error('Error resolving location:', err);
      // Fallback coordinate
      setDropoffCoord({ lat: 23.7925, lng: 90.4078 });
      setCurrentStep('FARE_SELECT');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Handle Ride Booking Request
  const handleConfirmRide = async () => {
    if (!pickupCoord || !dropoffCoord) return;

    try {
      const ride = await requestMutation.mutateAsync({
        vehicleType: selectedVehicle,
        pickupLat: pickupCoord.lat,
        pickupLng: pickupCoord.lng,
        pickupAddress: pickupText || 'Pickup Location',
        dropoffLat: dropoffCoord.lat,
        dropoffLng: dropoffCoord.lng,
        dropoffAddress: dropoffText || 'Destination',
        riderSessionId: sessionId,
      });

      setActiveRideId(ride.id);
      setRideStatus('SEARCHING');
      setCurrentStep('HOME');
    } catch (err) {
      console.error('Failed to request ride:', err);
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
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setActiveRideId(null);
      setRideStatus(null);
      setCurrentStep('HOME');
    }
  };

  // Handle Send Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeRideId) return;

    try {
      await sendMessageMutation.mutateAsync({
        rideId: activeRideId,
        text: chatMessageText.trim(),
        senderRole: 'RIDER',
      });
      setChatMessageText('');
      chatMessagesQuery.refetch();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Matched Driver profile
  const matchedDriver = useMemo(() => {
    if (!activeRideQuery.data) return SEED_DRIVERS[0];
    return {
      name: activeRideQuery.data.driverName || 'Rahim Uddin',
      plate: activeRideQuery.data.driverPlate || 'DHA-1234',
      vehicle: activeRideQuery.data.driverVehicle || 'Dhaka Transport',
      rating: activeRideQuery.data.driverRating || 4.9,
    };
  }, [activeRideQuery.data]);

  // Fare breakdown calculation
  const fareBreakdown = useMemo(() => {
    return calculateFare(selectedVehicle, routeDistanceKm);
  }, [selectedVehicle, routeDistanceKm]);

  // Determine current active view
  const isTripActive =
    rideStatus === 'DRIVER_ASSIGNED' ||
    rideStatus === 'DRIVER_EN_ROUTE' ||
    rideStatus === 'ARRIVED_AT_PICKUP' ||
    rideStatus === 'IN_PROGRESS';

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white flex flex-col font-sans select-none">
      {/* Central Interactive Map Area */}
      <div className="absolute inset-0 z-0">
        <MapBase
          center={[pickupCoord.lat, pickupCoord.lng]}
          zoom={13}
          className="w-full h-full"
        >
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
          {isTripActive && driverCoord ? (
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
        </MapBase>
      </div>

      {/* Main Overlay State Machine */}
      <div className="relative z-20 flex-1 flex flex-col justify-between pointer-events-none p-3 max-w-md mx-auto w-full">
        {/* Step: RATING SCREEN */}
        {rideStatus === 'RATED' || currentStep === 'RATING_SCREEN' ? (
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
        ) : rideStatus === 'SEARCHING' ? (
          /* Step: SEARCHING OVERLAY */
          <div className="my-auto pointer-events-auto">
            <SearchingOverlay
              pickupAddress={pickupText}
              dropoffAddress={dropoffText}
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
              dropoffAddress={dropoffText}
              promoDiscount={promoDiscount}
              isLoading={requestMutation.isPending}
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
              onSelectManually={() => {
                setManualPin(pickupCoord.lat, pickupCoord.lng);
                setCurrentStep('HOME');
              }}
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
          <div className="h-full w-full pointer-events-auto">
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
                className="p-1 text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[160px]">
              {(chatMessagesQuery.data || []).map((msg) => {
                const isMe = msg.senderRole === 'RIDER';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {(!chatMessagesQuery.data || chatMessagesQuery.data.length === 0) && (
                <div className="text-center text-xs text-neutral-500 py-6">
                  No messages yet. Send a note to your driver!
                </div>
              )}
            </div>

            {/* Quick replies & Input */}
            <div className="flex gap-1.5 pb-2 overflow-x-auto text-[11px]">
              {['I am waiting outside', 'Near the main gate', 'On my way down'].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setChatMessageText(quick)}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full text-neutral-300 flex-shrink-0"
                >
                  {quick}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-1 border-t border-neutral-800">
              <input
                type="text"
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!chatMessageText.trim() || sendMessageMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white font-semibold text-xs rounded-xl"
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

