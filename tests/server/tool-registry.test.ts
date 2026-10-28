import { describe, it, expect } from 'vitest';
import { toolRegistry } from '../../src/server/ai/toolRegistry';

describe('Agent Tool Registry', () => {
  it('registers all required agent tools', () => {
    const requiredTools = [
      'resolve_location',
      'check_service_boundary',
      'request_clarification',
      'calculate_route_fare',
      'prepare_booking_summary',
    ];

    for (const toolName of requiredTools) {
      const tool = toolRegistry.getTool(toolName);
      expect(tool).toBeDefined();
      expect(tool?.name).toBe(toolName);
      expect(tool?.description).toBeTypeOf('string');
      expect(tool?.parameters).toBeDefined();
    }
  });

  describe('resolve_location tool', () => {
    it('resolves Dhaka landmarks to name, lat, and lng', async () => {
      const result = await toolRegistry.execute('resolve_location', {
        query: 'Banani 11',
      });

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.name).toContain('Banani');
      expect(result.location?.lat).toBeCloseTo(23.79, 1);
      expect(result.location?.lng).toBeCloseTo(90.40, 1);
    });

    it('resolves Dhanmondi 27 landmark correctly', async () => {
      const result = await toolRegistry.execute('resolve_location', {
        query: 'Dhanmondi 27',
      });

      expect(result.success).toBe(true);
      expect(result.location?.name).toContain('Dhanmondi 27');
      expect(result.location?.lat).toBeCloseTo(23.746, 2);
      expect(result.location?.lng).toBeCloseTo(90.374, 2);
    });

    it('identifies known out-of-Dhaka cities or gibberish', async () => {
      const outOfBounds = await toolRegistry.execute('resolve_location', {
        query: 'Chittagong GEC Circle',
      });

      // Chittagong coordinates or explicit out of bounds indicator
      if (outOfBounds.success && outOfBounds.location) {
        expect(outOfBounds.location.lat).toBeLessThan(23.4);
      } else {
        expect(outOfBounds.success).toBe(false);
      }

      const gibberish = await toolRegistry.execute('resolve_location', {
        query: 'qwertyuiopasdfghjkl12345',
      });
      expect(gibberish.success).toBe(false);
    });
  });

  describe('check_service_boundary tool', () => {
    it('returns inBounds: true for points within Dhaka operational boundary', async () => {
      // Central Dhaka
      const res1 = await toolRegistry.execute('check_service_boundary', {
        lat: 23.78,
        lng: 90.40,
      });
      expect(res1.inBounds).toBe(true);

      // Boundary edges: lat 23.4 to 24.2, lng 90.1 to 90.7
      const res2 = await toolRegistry.execute('check_service_boundary', {
        lat: 23.5,
        lng: 90.3,
      });
      expect(res2.inBounds).toBe(true);
    });

    it('returns inBounds: false for coordinates outside Dhaka operational boundary', async () => {
      // Chittagong (~22.35, 91.78)
      const res1 = await toolRegistry.execute('check_service_boundary', {
        lat: 22.3569,
        lng: 91.7832,
      });
      expect(res1.inBounds).toBe(false);

      // Sylhet (~24.89, 91.86)
      const res2 = await toolRegistry.execute('check_service_boundary', {
        lat: 24.8949,
        lng: 91.8687,
      });
      expect(res2.inBounds).toBe(false);

      // Latitude too low
      const res3 = await toolRegistry.execute('check_service_boundary', {
        lat: 23.2,
        lng: 90.4,
      });
      expect(res3.inBounds).toBe(false);
    });
  });

  describe('request_clarification tool', () => {
    it('emits clarification questions properly structured', async () => {
      const questions = [
        {
          id: 'vehicleType',
          field: 'vehicleType' as const,
          question: 'What kind of ride would you prefer?',
          options: [
            { label: 'Bike', value: 'BIKE', badge: 'Fastest' },
            { label: 'CNG Auto', value: 'CNG', badge: 'Popular' },
            { label: 'Car', value: 'CAR', badge: 'Comfort' },
          ],
        },
      ];

      const result = await toolRegistry.execute('request_clarification', {
        questions,
      });

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].id).toBe('vehicleType');
      expect(result.questions[0].options).toHaveLength(3);
    });
  });

  describe('calculate_route_fare tool', () => {
    it('calculates distance and fare breakdown using geo and fare modules', async () => {
      // Banani (23.7901, 90.4062) to Dhanmondi 27 (23.7461, 90.3742)
      const result = await toolRegistry.execute('calculate_route_fare', {
        pickupLat: 23.7901,
        pickupLng: 90.4062,
        dropoffLat: 23.7461,
        dropoffLng: 90.3742,
        vehicleType: 'BIKE',
      });

      expect(result.distanceKm).toBeGreaterThan(4);
      expect(result.distanceKm).toBeLessThan(10);
      expect(result.baseFare).toBe(30);
      expect(result.totalFare).toBeGreaterThan(50);
      expect(result.totalFare).toBe(result.baseFare + result.distanceFare);
    });
  });

  describe('prepare_booking_summary tool', () => {
    it('packages trip summary for final confirmation', async () => {
      const summaryInput = {
        pickup: { name: 'Gulshan 1', lat: 23.7788, lng: 90.4172 },
        dropoff: { name: 'Banani 11', lat: 23.7901, lng: 90.4062 },
        vehicleType: 'CAR',
        distanceKm: 2.5,
        fare: 152,
      };

      const result = await toolRegistry.execute('prepare_booking_summary', summaryInput);

      expect(result.ready).toBe(true);
      expect(result.summary.pickup.name).toBe('Gulshan 1');
      expect(result.summary.dropoff.name).toBe('Banani 11');
      expect(result.summary.vehicleType).toBe('CAR');
      expect(result.summary.fare).toBe(152);
    });
  });
});
