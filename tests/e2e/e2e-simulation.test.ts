import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../../src/server/routers/_app';
import { db } from '../../src/server/db';
import { resolveNaturalLanguageLocation } from '../../src/server/ai/gemini';
import { stopDriverSimulation } from '../../src/server/simulation/locationSimulator';

describe('End-to-End Rideshare Simulation Loop (GariKoi)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('completes the entire end-to-end ride lifecycle between Rider and Driver callers', async () => {
    const riderSessionId = 'rider-e2e-session-uuid';
    const driverSessionId = 'driver-1'; // Seed driver Rahim Uddin

    const riderCaller = appRouter.createCaller({ db, sessionId: riderSessionId });
    const driverCaller = appRouter.createCaller({ db, sessionId: driverSessionId });

    // Step 1: Rider searches for destination using AI / Natural language search fallback
    const resolvedLocation = await resolveNaturalLanguageLocation('3 buildings after Dhanmondi 27 school');
    expect(resolvedLocation.displayName).toContain('Dhanmondi 27');
    expect(resolvedLocation.lat).toBeGreaterThan(23);
    expect(resolvedLocation.lng).toBeGreaterThan(90);

    // Step 2: Rider requests a CNG ride from Gulshan 2 to Dhanmondi 27
    const requestedRide = await riderCaller.ride.request({
      vehicleType: 'CNG',
      pickupLat: 23.7938,
      pickupLng: 90.4143,
      pickupAddress: 'Gulshan 2 Circle, Dhaka',
      dropoffLat: resolvedLocation.lat,
      dropoffLng: resolvedLocation.lng,
      dropoffAddress: resolvedLocation.displayName,
      riderSessionId,
    });

    expect(requestedRide).toBeDefined();
    expect(requestedRide.id).toBeDefined();
    expect(requestedRide.status).toBe('SEARCHING');
    expect(requestedRide.vehicleType).toBe('CNG');
    expect(requestedRide.fareEstimate).toBeGreaterThan(60); // CNG min fare is 60

    // Step 3: Driver inspects density & incoming rides
    const densityCells = await driverCaller.driver.getDensity();
    expect(Array.isArray(densityCells)).toBe(true);

    // Step 4: Driver accepts the ride
    const acceptedRide = await driverCaller.ride.accept({
      rideId: requestedRide.id,
      driverSessionId,
    });

    expect(acceptedRide.status).toBe('DRIVER_ASSIGNED');
    expect(acceptedRide.driverName).toBe('Rahim Uddin');
    expect(acceptedRide.driverVehicle).toBe('Honda CB Shine');
    expect(acceptedRide.driverPlate).toBe('DHA-1234');

    // Step 5: Rider & Driver exchange in-app chat messages
    const riderMsg = await riderCaller.chat.sendMessage({
      rideId: requestedRide.id,
      senderRole: 'RIDER',
      text: 'I am waiting in front of Pink City gate.',
    });
    expect(riderMsg.text).toBe('I am waiting in front of Pink City gate.');
    expect(riderMsg.senderRole).toBe('RIDER');

    const driverMsg = await driverCaller.chat.sendMessage({
      rideId: requestedRide.id,
      senderRole: 'DRIVER',
      text: 'Got it, reaching in 3 minutes.',
    });
    expect(driverMsg.text).toBe('Got it, reaching in 3 minutes.');
    expect(driverMsg.senderRole).toBe('DRIVER');

    const chatHistory = await riderCaller.chat.getMessages({ rideId: requestedRide.id });
    expect(chatHistory.length).toBe(2);
    expect(chatHistory[0].text).toBe('I am waiting in front of Pink City gate.');
    expect(chatHistory[1].text).toBe('Got it, reaching in 3 minutes.');

    // Step 6: Driver starts navigation to pickup -> DRIVER_EN_ROUTE
    const enRouteRide = await driverCaller.ride.startNavigation({
      rideId: requestedRide.id,
    });
    expect(enRouteRide.status).toBe('DRIVER_EN_ROUTE');

    // Step 7: Driver arrives at pickup -> ARRIVED_AT_PICKUP
    const arrivedRide = await driverCaller.ride.arrivedAtPickup({
      rideId: requestedRide.id,
    });
    expect(arrivedRide.status).toBe('ARRIVED_AT_PICKUP');

    // Step 8: Rider boards vehicle and trip starts -> IN_PROGRESS
    const tripStarted = await driverCaller.ride.startTrip({
      rideId: requestedRide.id,
    });
    expect(tripStarted.status).toBe('IN_PROGRESS');

    // Step 9: Driver completes trip with final fare in BDT
    const finalFareAmount = Math.round(requestedRide.fareEstimate * 1.05);
    const completedRide = await driverCaller.ride.completeTrip({
      rideId: requestedRide.id,
      fareFinal: finalFareAmount,
    });
    expect(completedRide.status).toBe('COMPLETED');
    expect(completedRide.fareFinal).toBe(finalFareAmount);

    // Stop simulation timer cleanly
    stopDriverSimulation(requestedRide.id);

    // Step 10: Rider rates the driver (1-5 stars) -> RATED
    const ratedRide = await riderCaller.ride.submitRating({
      rideId: requestedRide.id,
      rating: 5,
      feedback: 'Safe driver, courteous and avoided traffic!',
    });
    expect(ratedRide.status).toBe('RATED');
    expect(ratedRide.driverRatingByRider).toBe(5);

    // Step 11: Verify state machine protection - illegal transitions are rejected
    await expect(
      driverCaller.ride.startTrip({ rideId: requestedRide.id })
    ).rejects.toThrow();

    await expect(
      riderCaller.ride.cancel({ rideId: requestedRide.id })
    ).rejects.toThrow();

    // Verify final state in database
    const finalDbRide = await db.ride.findUnique({ where: { id: requestedRide.id } });
    expect(finalDbRide?.status).toBe('RATED');
    expect(finalDbRide?.driverRatingByRider).toBe(5);
  });
});
