import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatBDT,
  calculateCountdownProgress,
  calculateMeterFare,
  getDriverFlowState,
  canCompleteTrip,
  canStartTrip,
  canMarkArrived,
  calculateSessionEarnings,
  DriverFlowState,
} from '../../src/components/driver/driverUtils';
import {
  OnlineToggle,
  IncomingRideAlert,
  NavigateToPickup,
  TripActiveDriver,
  TripCompletedDriver,
} from '../../src/components/driver';
import DriverPage from '../../src/app/driver/page';
import { RideStatus, VehicleType } from '../../src/types';

describe('Driver Flow Utilities & State Logic', () => {
  describe('formatBDT Currency Formatter', () => {
    it('formats amounts correctly with Bengali Taka symbol ৳', () => {
      expect(formatBDT(0)).toBe('৳0');
      expect(formatBDT(150)).toBe('৳150');
      expect(formatBDT(320.5)).toBe('৳321');
      expect(formatBDT(1250)).toBe('৳1,250');
    });

    it('handles negative or nullish values gracefully', () => {
      expect(formatBDT(null as any)).toBe('৳0');
      expect(formatBDT(undefined as any)).toBe('৳0');
      expect(formatBDT(NaN as any)).toBe('৳0');
      expect(formatBDT(-50)).toBe('৳0');
    });
  });

  describe('calculateCountdownProgress', () => {
    it('calculates countdown percentage and stroke dashoffset correctly', () => {
      const total = 15;
      const circumference = 2 * Math.PI * 40; // radius 40

      // At start (15s remaining): 100% full ring
      const start = calculateCountdownProgress(15, total, circumference);
      expect(start.percentage).toBe(100);
      expect(start.dashoffset).toBeCloseTo(0, 1);

      // At half time (7.5s remaining): 50%
      const half = calculateCountdownProgress(7.5, total, circumference);
      expect(half.percentage).toBe(50);
      expect(half.dashoffset).toBeCloseTo(circumference * 0.5, 1);

      // At 0s remaining: 0% ring
      const end = calculateCountdownProgress(0, total, circumference);
      expect(end.percentage).toBe(0);
      expect(end.dashoffset).toBeCloseTo(circumference, 1);
    });

    it('clamps values below 0 or above total seconds', () => {
      const circumference = 100;
      const under = calculateCountdownProgress(-2, 15, circumference);
      expect(under.percentage).toBe(0);
      expect(under.dashoffset).toBe(100);

      const over = calculateCountdownProgress(20, 15, circumference);
      expect(over.percentage).toBe(100);
      expect(over.dashoffset).toBe(0);
    });

    it('handles zero or negative totalTime gracefully', () => {
      const result = calculateCountdownProgress(5, 0, 100);
      expect(result.percentage).toBe(0);
      expect(result.dashoffset).toBe(100);
    });
  });

  describe('calculateMeterFare', () => {
    it('calculates live meter fare respecting vehicle minimums and distance rates', () => {
      // BIKE: base 30, per km 12, min 40
      const bikeShort = calculateMeterFare('BIKE', 0.5);
      expect(bikeShort).toBe(40); // hits minimum

      const bikeLong = calculateMeterFare('BIKE', 5.0);
      expect(bikeLong).toBe(90); // 30 + (5 * 12) = 90

      // CNG: base 50, per km 18, min 60
      const cngFare = calculateMeterFare('CNG', 10);
      expect(cngFare).toBe(230); // 50 + (10 * 18) = 230

      // CAR: base 100, per km 25, min 120
      const carFare = calculateMeterFare('CAR', 10);
      expect(carFare).toBe(350); // 100 + (10 * 25) = 350
    });

    it('handles zero or negative distance gracefully', () => {
      expect(calculateMeterFare('BIKE', 0)).toBe(40);
      expect(calculateMeterFare('BIKE', -5)).toBe(40);
    });
  });

  describe('Driver State Machine Helpers', () => {
    it('determines OFFLINE state when driver is not online', () => {
      const state = getDriverFlowState({
        isOnline: false,
        hasIncomingAlert: false,
        activeRide: null,
      });
      expect(state).toBe('OFFLINE');
    });

    it('determines ONLINE_STANDBY state when online with no alert or active ride', () => {
      const state = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: null,
      });
      expect(state).toBe('ONLINE_STANDBY');
    });

    it('determines INCOMING_DISPATCH state when alert is present and not on active trip', () => {
      const state = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: true,
        activeRide: null,
      });
      expect(state).toBe('INCOMING_DISPATCH');
    });

    it('determines EN_ROUTE_PICKUP when ride is DRIVER_ASSIGNED or DRIVER_EN_ROUTE', () => {
      const state1 = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: { status: 'DRIVER_ASSIGNED' } as any,
      });
      expect(state1).toBe('EN_ROUTE_PICKUP');

      const state2 = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: { status: 'DRIVER_EN_ROUTE' } as any,
      });
      expect(state2).toBe('EN_ROUTE_PICKUP');
    });

    it('determines ARRIVED_PICKUP when status is ARRIVED_AT_PICKUP', () => {
      const state = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: { status: 'ARRIVED_AT_PICKUP' } as any,
      });
      expect(state).toBe('ARRIVED_PICKUP');
    });

    it('determines TRIP_IN_PROGRESS when status is IN_PROGRESS', () => {
      const state = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: { status: 'IN_PROGRESS' } as any,
      });
      expect(state).toBe('TRIP_IN_PROGRESS');
    });

    it('determines TRIP_COMPLETED when status is COMPLETED or RATED', () => {
      const stateCompleted = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: { status: 'COMPLETED' } as any,
      });
      expect(stateCompleted).toBe('TRIP_COMPLETED');

      const stateRated = getDriverFlowState({
        isOnline: true,
        hasIncomingAlert: false,
        activeRide: { status: 'RATED' } as any,
      });
      expect(stateRated).toBe('TRIP_COMPLETED');
    });

    it('evaluates transition guard predicates accurately', () => {
      expect(canMarkArrived('DRIVER_EN_ROUTE')).toBe(true);
      expect(canMarkArrived('DRIVER_ASSIGNED')).toBe(false);
      expect(canMarkArrived('IN_PROGRESS')).toBe(false);
      expect(canMarkArrived('COMPLETED')).toBe(false);

      expect(canStartTrip('ARRIVED_AT_PICKUP')).toBe(true);
      expect(canStartTrip('DRIVER_EN_ROUTE')).toBe(false);
      expect(canStartTrip('IN_PROGRESS')).toBe(false);

      expect(canCompleteTrip('IN_PROGRESS')).toBe(true);
      expect(canCompleteTrip('ARRIVED_AT_PICKUP')).toBe(false);
      expect(canCompleteTrip('COMPLETED')).toBe(false);
    });
  });

  describe('calculateSessionEarnings', () => {
    it('aggregates completed trip fares into session total', () => {
      const trips = [
        { fareFinal: 120, fareEstimate: 110, status: 'COMPLETED' },
        { fareFinal: null, fareEstimate: 200, status: 'COMPLETED' },
        { fareFinal: 350, fareEstimate: 350, status: 'RATED' },
        { fareFinal: 90, fareEstimate: 90, status: 'CANCELLED' }, // excluded
      ];

      const earnings = calculateSessionEarnings(trips as any);
      expect(earnings.totalBDT).toBe(670); // 120 + 200 + 350
      expect(earnings.completedCount).toBe(3);
    });

    it('handles empty session history', () => {
      const earnings = calculateSessionEarnings([]);
      expect(earnings.totalBDT).toBe(0);
      expect(earnings.completedCount).toBe(0);
    });
  });
});

describe('Driver Component Exports & Interface Contract', () => {
  it('exports all 5 core driver UI components as valid React components', () => {
    expect(typeof OnlineToggle).toBe('function');
    expect(typeof IncomingRideAlert).toBe('function');
    expect(typeof NavigateToPickup).toBe('function');
    expect(typeof TripActiveDriver).toBe('function');
    expect(typeof TripCompletedDriver).toBe('function');
  });

  it('exports DriverPage as valid React page component', () => {
    expect(typeof DriverPage).toBe('function');
  });
});
