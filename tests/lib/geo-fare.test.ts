import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateBearing, interpolatePath } from '../../src/lib/geo';
import { calculateFare, getVehicleEta, VEHICLE_RATES } from '../../src/lib/fare';
import { DHAKA_CENTER, SEED_DRIVERS, MAP_STYLE_URL } from '../../src/lib/constants';
import { db } from '../../src/server/db';

describe('Geo & Fare Utilities', () => {
  it('calculates accurate Haversine distance between Dhaka landmarks', () => {
    // Gulshan 2 (23.7938, 90.4143) to Mohakhali (23.7831, 90.3977) is ~2 km
    const dist = calculateDistance(23.7938, 90.4143, 23.7831, 90.3977);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(2.5);
  });

  it('calculates bearing angle between 0 and 360', () => {
    const bearing = calculateBearing(23.7938, 90.4143, 23.7831, 90.3977);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThanOrEqual(360);
  });

  it('calculates fares respecting min fares and rates', () => {
    // Bike: base 30, rate 12, min 50
    const shortRide = calculateFare('BIKE', 0.5);
    expect(shortRide.totalFare).toBe(50); // hits min fare

    const longRide = calculateFare('BIKE', 10);
    // 30 + 10 * 1.3 * 12 = 30 + 156 = 186
    expect(longRide.totalFare).toBe(186);

    // CNG: base 40, rate 15, min 70
    const cngShort = calculateFare('CNG', 0.5);
    expect(cngShort.totalFare).toBe(70); // min fare
    const cngLong = calculateFare('CNG', 10);
    // 40 + 10 * 1.3 * 15 = 40 + 195 = 235
    expect(cngLong.totalFare).toBe(235);

    // CAR: base 80, rate 22, min 120
    const carShort = calculateFare('CAR', 0.5);
    expect(carShort.totalFare).toBe(120); // min fare
    const carLong = calculateFare('CAR', 10);
    // 80 + 10 * 1.3 * 22 = 80 + 286 = 366
    expect(carLong.totalFare).toBe(366);
  });

  it('interpolates intermediate coordinates along waypoints', () => {
    const path: [number, number][] = [[23.79, 90.41], [23.80, 90.42]];
    const interpolated = interpolatePath(path, 4);
    expect(interpolated.length).toBe(5);
    expect(interpolated[0]).toEqual(path[0]);
    expect(interpolated[4]).toEqual(path[1]);
  });

  it('handles interpolatePath edge cases gracefully', () => {
    // Single point
    const singlePoint: [number, number][] = [[23.79, 90.41]];
    expect(interpolatePath(singlePoint, 4)).toEqual(singlePoint);

    // Zero steps
    const twoPoints: [number, number][] = [[23.79, 90.41], [23.80, 90.42]];
    expect(interpolatePath(twoPoints, 0)).toEqual(twoPoints);

    // Multi-segment interpolation
    const multiSegment: [number, number][] = [[23.79, 90.41], [23.80, 90.42], [23.81, 90.43]];
    const multiInterpolated = interpolatePath(multiSegment, 2);
    // 2 segments * 2 steps + 1 final point = 5 points
    expect(multiInterpolated.length).toBe(5);
    expect(multiInterpolated[0]).toEqual(multiSegment[0]);
    expect(multiInterpolated[2]).toEqual(multiSegment[1]);
    expect(multiInterpolated[4]).toEqual(multiSegment[2]);
  });

  it('calculates vehicle ETA estimates correctly', () => {
    const bikeEta = getVehicleEta('BIKE', 5);
    const cngEta = getVehicleEta('CNG', 5);
    const carEta = getVehicleEta('CAR', 5);
    expect(bikeEta).toBeLessThan(carEta);
    expect(bikeEta).toBeLessThan(cngEta);
    expect(cngEta).toBeLessThan(carEta);
    expect(bikeEta).toBeGreaterThan(0);
  });

  it('exports Dhaka default center, map style, and seed drivers', () => {
    expect(DHAKA_CENTER).toEqual([23.8103, 90.4125]);
    expect(MAP_STYLE_URL).toContain('openfreemap');
    expect(SEED_DRIVERS.length).toBe(5);
    expect(SEED_DRIVERS[0].name).toBe('Rahim Uddin');
    expect(SEED_DRIVERS[0].vehicleType).toBe('BIKE');
    expect(SEED_DRIVERS[1].name).toBe('Karim Mia');
    expect(SEED_DRIVERS[1].vehicleType).toBe('CNG');
  });

  it('provides a functioning Prisma db client singleton with Ride and ChatMessage models', () => {
    expect(db).toBeDefined();
    expect(db.ride).toBeDefined();
    expect(typeof db.ride.findMany).toBe('function');
    expect(db.chatMessage).toBeDefined();
    expect(typeof db.chatMessage.findMany).toBe('function');
  });
});
