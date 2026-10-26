import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { heatmapStore } from '../../src/server/density/heatmapStore';
import {
  startDriverSimulation,
  stopDriverSimulation,
  getActiveSimulations,
} from '../../src/server/simulation/locationSimulator';
import { eventBus } from '../../src/server/events';
import { DHAKA_ROUTES, findNearestRoute } from '../../src/server/simulation/dhakaRoutes';

describe('Simulation Engine & Heatmap Store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    heatmapStore.clear?.();
    // Clear any active simulations
    if (typeof getActiveSimulations === 'function') {
      for (const [rideId] of getActiveSimulations()) {
        stopDriverSimulation(rideId);
      }
    }
  });

  afterEach(() => {
    if (typeof getActiveSimulations === 'function') {
      for (const [rideId] of getActiveSimulations()) {
        stopDriverSimulation(rideId);
      }
    }
    vi.useRealTimers();
  });

  it('increments density count on ride request and returns cells', () => {
    heatmapStore.recordRequest(23.7938, 90.4143);
    heatmapStore.recordRequest(23.7938, 90.4143);
    const cells = heatmapStore.getCells();
    expect(cells.length).toBeGreaterThan(0);
    const cell = cells.find(c => Math.abs(c.lat - 23.7938) < 0.05);
    expect(cell?.intensity).toBeGreaterThanOrEqual(2);
  });

  it('prevents duplicate simulation intervals for the same rideId', () => {
    const rideId = 'test-ride-dup';
    const locListener = vi.fn();
    eventBus.on(`driverLocation:${rideId}`, locListener);

    startDriverSimulation(rideId, [23.79, 90.41], [23.795, 90.415], [23.8, 90.42]);
    startDriverSimulation(rideId, [23.79, 90.41], [23.795, 90.415], [23.8, 90.42]);

    expect(getActiveSimulations().has(rideId)).toBe(true);

    vi.advanceTimersByTime(2100);
    expect(locListener).toHaveBeenCalledTimes(1);

    stopDriverSimulation(rideId);
    expect(getActiveSimulations().has(rideId)).toBe(false);
  });

  it('emits ARRIVED_AT_PICKUP when driver is within 50m of pickup coordinates', () => {
    const rideId = 'test-ride-arrived';
    const statusListener = vi.fn();
    eventBus.on(`statusChange:${rideId}`, statusListener);

    // Start 30 meters away from pickup
    // In Dhaka (~lat 23.8), 0.0002 deg lat is ~22 meters
    const pickupLat = 23.7938;
    const pickupLng = 90.4143;
    const startLat = 23.7938 + 0.0002;
    const startLng = 90.4143;

    startDriverSimulation(
      rideId,
      [startLat, startLng],
      [pickupLat, pickupLng],
      [23.7831, 90.3977]
    );

    // Advance 1 tick
    vi.advanceTimersByTime(2100);

    // Driver should have arrived at pickup
    expect(statusListener).toHaveBeenCalledWith(
      expect.objectContaining({
        rideId,
        status: 'ARRIVED_AT_PICKUP',
      })
    );

    stopDriverSimulation(rideId);
  });

  it('exposes Dhaka seed routes with valid coordinates', () => {
    expect(DHAKA_ROUTES.length).toBeGreaterThanOrEqual(4);
    for (const route of DHAKA_ROUTES) {
      expect(route.waypoints.length).toBeGreaterThanOrEqual(4);
      for (const [lat, lng] of route.waypoints) {
        expect(lat).toBeGreaterThan(23.6);
        expect(lat).toBeLessThan(23.95);
        expect(lng).toBeGreaterThan(90.3);
        expect(lng).toBeLessThan(90.5);
      }
    }

    const nearest = findNearestRoute([23.7938, 90.4143]);
    expect(nearest).toBeDefined();
    expect(nearest.id).toBe('route-a');
  });

  it('expires old heatmap requests based on TTL', () => {
    heatmapStore.recordRequest(23.7938, 90.4143);
    expect(heatmapStore.getCells().length).toBe(1);

    // Advance beyond 5 min TTL (e.g. 6 mins = 360_000ms)
    vi.advanceTimersByTime(360_000);

    const cells = heatmapStore.getCells();
    expect(cells.length).toBe(0);
  });
});
