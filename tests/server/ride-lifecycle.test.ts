import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { appRouter } from '../../src/server/routers/_app';
import { db } from '../../src/server/db';
import { getActiveSimulations, stopDriverSimulation } from '../../src/server/simulation/locationSimulator';
import { heatmapStore } from '../../src/server/density/heatmapStore';
import { TRPCError } from '@trpc/server';

describe('Ride Lifecycle & State Machine', () => {
  const createCaller = (sessionId = 'test-session-1') => appRouter.createCaller({ db, sessionId });

  beforeEach(async () => {
    heatmapStore.clear();
    // Stop all active simulations
    for (const [rideId] of getActiveSimulations()) {
      stopDriverSimulation(rideId);
    }
    // Clean up DB rides and chat messages
    await db.chatMessage.deleteMany();
    await db.ride.deleteMany();
  });

  afterEach(async () => {
    for (const [rideId] of getActiveSimulations()) {
      stopDriverSimulation(rideId);
    }
  });

  it('progresses ride through requested -> assigned -> arrived -> in_progress -> completed', async () => {
    const caller = createCaller();
    const ride = await caller.ride.request({
      vehicleType: 'BIKE',
      pickupLat: 23.7938,
      pickupLng: 90.4143,
      pickupAddress: 'Gulshan 2',
      dropoffLat: 23.7831,
      dropoffLng: 90.3977,
      dropoffAddress: 'Mohakhali',
    });

    expect(ride.status).toBe('SEARCHING');
    expect(ride.distanceKm).toBeGreaterThan(0);
    expect(ride.fareEstimate).toBeGreaterThan(0);

    // Accept ride
    const accepted = await caller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-1' });
    expect(accepted.status).toBe('DRIVER_ASSIGNED');
    expect(accepted.driverName).toBe('Rahim Uddin');
    expect(accepted.driverSessionId).toBe('driver-1');

    // Start navigation
    const enRoute = await caller.ride.startNavigation({ rideId: ride.id });
    expect(enRoute.status).toBe('DRIVER_EN_ROUTE');

    // Arrived at pickup
    const arrived = await caller.ride.arrivedAtPickup({ rideId: ride.id });
    expect(arrived.status).toBe('ARRIVED_AT_PICKUP');

    // Start trip
    const started = await caller.ride.startTrip({ rideId: ride.id });
    expect(started.status).toBe('IN_PROGRESS');

    // Complete trip
    const completed = await caller.ride.completeTrip({ rideId: ride.id });
    expect(completed.status).toBe('COMPLETED');
    expect(completed.fareFinal).toBeGreaterThan(0);

    // Submit rating
    const rated = await caller.ride.submitRating({ rideId: ride.id, rating: 5, feedback: 'Great ride!' });
    expect(rated.status).toBe('RATED');
    expect(rated.driverRatingByRider).toBe(5);
  });

  it('rejects invalid state transition (e.g. completing already completed or cancelled ride)', async () => {
    const caller = createCaller();
    const ride = await caller.ride.request({
      vehicleType: 'CAR',
      pickupLat: 23.79,
      pickupLng: 90.41,
      pickupAddress: 'Start',
      dropoffLat: 23.80,
      dropoffLng: 90.42,
      dropoffAddress: 'End',
    });

    await caller.ride.cancel({ rideId: ride.id, reason: 'Changed mind' });

    // Review Focus 3: attempting completeTrip on CANCELLED ride must throw TRPCError BAD_REQUEST
    await expect(caller.ride.completeTrip({ rideId: ride.id })).rejects.toThrow();

    // Verify ride remained cancelled in DB
    const persisted = await db.ride.findUnique({ where: { id: ride.id } });
    expect(persisted?.status).toBe('CANCELLED');
  });

  it('enforces Review Focus 3: rejects illegal transitions with BAD_REQUEST and leaves ride intact', async () => {
    const caller = createCaller();
    const ride = await caller.ride.request({
      vehicleType: 'CNG',
      pickupLat: 23.75,
      pickupLng: 90.38,
      pickupAddress: 'Dhanmondi',
      dropoffLat: 23.78,
      dropoffLng: 90.40,
      dropoffAddress: 'Banani',
    });

    // 1. Cannot start navigation before DRIVER_ASSIGNED
    await expect(caller.ride.startNavigation({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // 2. Cannot startTrip before ARRIVED_AT_PICKUP
    await expect(caller.ride.startTrip({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // Accept ride
    await caller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-2' });

    // 3. Cannot accept already accepted ride
    await expect(
      caller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-3' })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // 4. Cannot start trip while only DRIVER_ASSIGNED
    await expect(caller.ride.startTrip({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // Start navigation
    await caller.ride.startNavigation({ rideId: ride.id });

    // 5. Cannot start trip while DRIVER_EN_ROUTE
    await expect(caller.ride.startTrip({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // 6. Arrive at pickup
    await caller.ride.arrivedAtPickup({ rideId: ride.id });

    // 7. Cannot complete trip while ARRIVED_AT_PICKUP (must startTrip first)
    await expect(caller.ride.completeTrip({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // Start trip
    await caller.ride.startTrip({ rideId: ride.id });

    // 8. Cannot cancel an IN_PROGRESS trip
    await expect(caller.ride.cancel({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // Complete trip
    await caller.ride.completeTrip({ rideId: ride.id });

    // 9. Cannot complete an already COMPLETED trip
    await expect(caller.ride.completeTrip({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // 10. Cannot cancel a COMPLETED trip
    await expect(caller.ride.cancel({ rideId: ride.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    // Verify ride is still COMPLETED
    const finalRide = await db.ride.findUnique({ where: { id: ride.id } });
    expect(finalRide?.status).toBe('COMPLETED');
  });

  it('supports declining ride and keeps SEARCHING status', async () => {
    const caller = createCaller();
    const ride = await caller.ride.request({
      vehicleType: 'BIKE',
      pickupLat: 23.79,
      pickupLng: 90.41,
      pickupAddress: 'Start',
      dropoffLat: 23.80,
      dropoffLng: 90.42,
      dropoffAddress: 'End',
    });

    const declined = await caller.ride.decline({ rideId: ride.id });
    expect(declined.status).toBe('SEARCHING');

    const check = await db.ride.findUnique({ where: { id: ride.id } });
    expect(check?.status).toBe('SEARCHING');
  });

  it('handles chat messages and retrieval', async () => {
    const caller = createCaller();
    const ride = await caller.ride.request({
      vehicleType: 'BIKE',
      pickupLat: 23.79,
      pickupLng: 90.41,
      pickupAddress: 'Gulshan',
      dropoffLat: 23.80,
      dropoffLng: 90.42,
      dropoffAddress: 'Banani',
    });

    const receivedChat: any[] = [];
    const chatSub = await caller.chat.onMessage({ rideId: ride.id });
    const sub = chatSub.subscribe({
      next(data) {
        receivedChat.push(data);
      },
    });

    const msg1 = await caller.chat.sendMessage({
      rideId: ride.id,
      text: 'I am waiting near the gate',
      senderRole: 'RIDER',
    });
    expect(msg1.text).toBe('I am waiting near the gate');
    expect(msg1.senderRole).toBe('RIDER');

    const msg2 = await caller.chat.sendMessage({
      rideId: ride.id,
      text: 'On my way, 2 mins',
      senderRole: 'DRIVER',
    });
    expect(msg2.text).toBe('On my way, 2 mins');
    expect(msg2.senderRole).toBe('DRIVER');

    sub.unsubscribe();

    expect(receivedChat.length).toBe(2);
    expect(receivedChat[0].text).toBe('I am waiting near the gate');
    expect(receivedChat[1].text).toBe('On my way, 2 mins');

    const history = await caller.chat.getMessages({ rideId: ride.id });
    expect(history.length).toBe(2);
    expect(history[0].text).toBe('I am waiting near the gate');
    expect(history[1].text).toBe('On my way, 2 mins');
  });

  it('supports driver density queries and heatmap updates via subscription', async () => {
    const caller = createCaller();
    const initialDensity = await caller.driver.getDensity();
    expect(initialDensity).toEqual([]);

    const densityUpdates: any[] = [];
    const densitySub = await caller.driver.onDensityUpdate();
    const sub = densitySub.subscribe({
      next(data) {
        densityUpdates.push(data);
      },
    });

    await caller.ride.request({
      vehicleType: 'CAR',
      pickupLat: 23.7938,
      pickupLng: 90.4143,
      pickupAddress: 'Gulshan 2',
      dropoffLat: 23.7831,
      dropoffLng: 90.3977,
      dropoffAddress: 'Mohakhali',
    });

    sub.unsubscribe();

    const updatedDensity = await caller.driver.getDensity();
    expect(updatedDensity.length).toBeGreaterThan(0);
    expect(updatedDensity[0].intensity).toBeGreaterThanOrEqual(1);
    expect(densityUpdates.length).toBeGreaterThan(0);
  });

  it('supports getActive and getById queries', async () => {
    const caller = createCaller('rider-session-xyz');
    const ride = await caller.ride.request({
      vehicleType: 'BIKE',
      pickupLat: 23.79,
      pickupLng: 90.41,
      pickupAddress: 'A',
      dropoffLat: 23.80,
      dropoffLng: 90.42,
      dropoffAddress: 'B',
      riderSessionId: 'rider-session-xyz',
    });

    const active = await caller.ride.getActive({ sessionId: 'rider-session-xyz' });
    expect(active?.id).toBe(ride.id);
    expect(active?.status).toBe('SEARCHING');

    const byId = await caller.ride.getById({ id: ride.id });
    expect(byId.id).toBe(ride.id);

    // Once completed, getActive should return null
    await caller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-1' });
    await caller.ride.startNavigation({ rideId: ride.id });
    await caller.ride.arrivedAtPickup({ rideId: ride.id });
    await caller.ride.startTrip({ rideId: ride.id });
    await caller.ride.completeTrip({ rideId: ride.id });

    const completedActive = await caller.ride.getActive({ sessionId: 'rider-session-xyz' });
    expect(completedActive).toBeNull();
  });

  it('emits and receives real-time events via subscriptions', async () => {
    const caller = createCaller();

    const incomingRides: any[] = [];
    const incomingSub = await caller.ride.onIncomingRide();
    const subIncoming = incomingSub.subscribe({
      next(data) {
        incomingRides.push(data);
      },
    });

    const ride = await caller.ride.request({
      vehicleType: 'BIKE',
      pickupLat: 23.79,
      pickupLng: 90.41,
      pickupAddress: 'Start',
      dropoffLat: 23.80,
      dropoffLng: 90.42,
      dropoffAddress: 'End',
    });

    subIncoming.unsubscribe();
    expect(incomingRides.length).toBe(1);
    expect(incomingRides[0].rideId).toBe(ride.id);

    const statusUpdates: string[] = [];
    const statusSub = await caller.ride.onStatusChange({ rideId: ride.id });
    const subStatus = statusSub.subscribe({
      next(data) {
        statusUpdates.push(data.status);
      },
    });

    const locations: any[] = [];
    const locSub = await caller.ride.onDriverLocation({ rideId: ride.id });
    const subLoc = locSub.subscribe({
      next(loc) {
        locations.push(loc);
      },
    });

    await caller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-1' });
    await caller.ride.startNavigation({ rideId: ride.id });
    await caller.ride.updateDriverLocation({
      rideId: ride.id,
      lat: 23.791,
      lng: 90.411,
      bearing: 45,
      speed: 30,
    });

    subStatus.unsubscribe();
    subLoc.unsubscribe();

    expect(statusUpdates).toContain('DRIVER_ASSIGNED');
    expect(statusUpdates).toContain('DRIVER_EN_ROUTE');
    expect(locations.length).toBeGreaterThan(0);
    expect(locations.some((l) => l.lat === 23.791 && l.lng === 90.411)).toBe(true);
  });
});
