import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DHAKA_CENTER } from '../../src/lib/constants';
import {
  resolveNaturalLanguageLocation,
  getDhakaLandmarksAutocomplete,
  getDhakaLandmarksOptions,
  clearAiMemoryCache,
  DHAKA_LANDMARKS,
} from '../../src/server/ai/gemini';
import { locationRouter } from '../../src/server/routers/location';
import { createCallerFactory } from '../../src/server/trpc';
import { startDriverSimulation, stopDriverSimulation } from '../../src/server/simulation/locationSimulator';
import { db } from '../../src/server/db';

describe('AI Location Resolver and Location Router', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    clearAiMemoryCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  describe('resolveNaturalLanguageLocation (Fallback Mode)', () => {
    it('falls back to default Dhaka landmark with fallback confidence when API key is missing or invalid', async () => {
      // With missing key, it should safely return fallback without throwing
      const result = await resolveNaturalLanguageLocation('3 buildings after Dhanmondi 27 school');
      expect(result).toHaveProperty('lat');
      expect(result).toHaveProperty('lng');
      expect(result).toHaveProperty('displayName');
      expect(result).toHaveProperty('confidence');
      expect(result.lat).toBeGreaterThan(23.6);
      expect(result.lat).toBeLessThan(23.9);
      expect(result.displayName).toContain('Dhanmondi 27');
      expect(result.confidence).toBe(0.4);
      expect(result.isFallback).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it('matches known Dhaka landmarks by keyword in prompt', async () => {
      const gulshanResult = await resolveNaturalLanguageLocation('Near pink city mall in Gulshan 2');
      expect(gulshanResult.displayName).toContain('Gulshan 2');
      expect(gulshanResult.lat).toBeCloseTo(23.7938, 2);
      expect(gulshanResult.lng).toBeCloseTo(90.4143, 2);
      expect(gulshanResult.isFallback).toBe(true);

      const bananiResult = await resolveNaturalLanguageLocation('Drop me at Banani 11');
      expect(bananiResult.displayName).toContain('Banani');
      expect(bananiResult.isFallback).toBe(true);
    });

    it('falls back to context coordinates if no landmark matches', async () => {
      const contextCoords: [number, number] = [23.75, 90.39];
      const result = await resolveNaturalLanguageLocation('some obscure blue wall house', contextCoords);
      expect(result.lat).toBe(23.75);
      expect(result.lng).toBe(90.39);
      expect(result.displayName).toContain('Near Pickup Location');
      expect(result.confidence).toBe(0.3);
      expect(result.isFallback).toBe(true);
    });

    it('falls back to Dhaka city center if no landmark and no context provided', async () => {
      const result = await resolveNaturalLanguageLocation('unrecognized place nowhere in records');
      expect(result.lat).toBeCloseTo(DHAKA_CENTER[0], 2);
      expect(result.lng).toBeCloseTo(DHAKA_CENTER[1], 2);
      expect(result.displayName).toContain('Dhaka City Center');
      expect(result.confidence).toBe(0.2);
      expect(result.isFallback).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('resolveNaturalLanguageLocation (Gemini API Integration)', () => {
    it('successfully resolves coordinates via Gemini API when GEMINI_API_KEY is present', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    lat: 23.7461,
                    lng: 90.3742,
                    displayName: 'Dhanmondi 27 vicinity',
                    confidence: 0.85,
                  }),
                },
              ],
            },
          },
        ],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await resolveNaturalLanguageLocation('3 buildings after Dhanmondi 27 school');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(String(url)).toContain('key=test-gemini-key');
      expect(options?.method).toBe('POST');

      expect(result.lat).toBe(23.7461);
      expect(result.lng).toBe(90.3742);
      expect(result.displayName).toBe('Dhanmondi 27 vicinity');
      expect(result.confidence).toBe(0.85);
      expect(result.isFallback).toBeFalsy();
    });

    it('parses Gemini responses wrapped in markdown json fences', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '```json\n{"lat": 23.7938, "lng": 90.4143, "displayName": "Gulshan 2 Circle", "confidence": 0.92}\n```',
                },
              ],
            },
          },
        ],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await resolveNaturalLanguageLocation('Gulshan 2 Circle');
      expect(result.lat).toBe(23.7938);
      expect(result.lng).toBe(90.4143);
      expect(result.displayName).toBe('Gulshan 2 Circle');
      expect(result.confidence).toBe(0.92);
    });

    it('flags low confidence results (< 0.5) with warning when returned by Gemini', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    lat: 23.75,
                    lng: 90.38,
                    displayName: 'Uncertain Location',
                    confidence: 0.35,
                  }),
                },
              ],
            },
          },
        ],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await resolveNaturalLanguageLocation('Somewhere obscure');
      expect(result.confidence).toBe(0.35);
      expect(result.warning).toBeDefined();
      expect(result.warning?.toLowerCase()).toContain('low confidence');
    });

    it('gracefully falls back when Gemini API returns an HTTP error status without throwing', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'server error' }),
      } as Response);

      const result = await resolveNaturalLanguageLocation('Near Dhanmondi 27');
      expect(result.displayName).toContain('Dhanmondi 27');
      expect(result.isFallback).toBe(true);
      expect(result.confidence).toBe(0.4);
      expect(result.warning).toBeDefined();
    });

    it('gracefully falls back when network fetch throws an error without throwing', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'));

      const result = await resolveNaturalLanguageLocation('Near Farmgate bus stand');
      expect(result.displayName).toContain('Farmgate');
      expect(result.isFallback).toBe(true);
      expect(result.confidence).toBe(0.4);
      expect(result.warning).toBeDefined();
    });

    it('gracefully falls back when Gemini API returns malformed non-JSON text', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Sorry, I am an AI and cannot find this location.',
                },
              ],
            },
          },
        ],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await resolveNaturalLanguageLocation('Motijheel office');
      expect(result.displayName).toContain('Motijheel');
      expect(result.isFallback).toBe(true);
      expect(result.confidence).toBe(0.4);
      expect(result.warning).toBeDefined();
    });
  });

  describe('Local Memory Caching for Gemini AI Responses', () => {
    it('caches natural language resolution responses so subsequent identical calls do not invoke fetch', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    lat: 23.7938,
                    lng: 90.4143,
                    displayName: 'Gulshan 2 Circle',
                    confidence: 0.95,
                  }),
                },
              ],
            },
          },
        ],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // First call: calls fetch
      const result1 = await resolveNaturalLanguageLocation('Gulshan 2 Pink City');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result1.displayName).toBe('Gulshan 2 Circle');

      // Second call with same input: served from memory cache!
      const result2 = await resolveNaturalLanguageLocation('Gulshan 2 Pink City');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result2.displayName).toBe('Gulshan 2 Circle');
    });

    it('caches multi-option place suggestions in local memory', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify([
                    {
                      displayName: 'Dhanmondi 27 Hub',
                      lat: 23.7461,
                      lng: 90.3742,
                      category: 'Residential',
                    },
                  ]),
                },
              ],
            },
          },
        ],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // First call: calls fetch
      const options1 = await getDhakaLandmarksOptions('Dhanmondi 27');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(options1[0].displayName).toBe('Dhanmondi 27 Hub');

      // Second call: served from memory cache without invoking fetch!
      const options2 = await getDhakaLandmarksOptions('Dhanmondi 27');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(options2[0].displayName).toBe('Dhanmondi 27 Hub');
    });
  });

  describe('locationRouter and autocomplete', () => {
    it('exposes aiSearch mutation and autocomplete query on locationRouter', () => {
      expect(locationRouter._def.procedures).toHaveProperty('aiSearch');
      expect(locationRouter._def.procedures).toHaveProperty('autocomplete');
    });

    it('handles autocomplete query with filtering for Dhaka landmarks', async () => {
      const createCaller = createCallerFactory(locationRouter);
      const caller = createCaller({});

      // Case-insensitive search for Gulshan
      const gulshanResults = await caller.autocomplete({ query: 'gulshan' });
      expect(gulshanResults.length).toBeGreaterThan(0);
      for (const item of gulshanResults) {
        expect(item).toHaveProperty('displayName');
        expect(item).toHaveProperty('lat');
        expect(item).toHaveProperty('lng');
        expect(item.displayName.toLowerCase()).toContain('gulshan');
      }

      // Banani query
      const bananiResults = await caller.autocomplete({ query: 'banani' });
      expect(bananiResults.length).toBeGreaterThan(0);
      expect(bananiResults.some(r => r.displayName.toLowerCase().includes('banani'))).toBe(true);

      // Empty query returns list of landmarks
      const allResults = await caller.autocomplete({ query: '' });
      expect(allResults.length).toBeGreaterThanOrEqual(5);
    });

    it('executes aiSearch mutation through caller', async () => {
      const createCaller = createCallerFactory(locationRouter);
      const caller = createCaller({});

      const result = await caller.aiSearch({
        query: '3 buildings after Dhanmondi 27 school',
        contextLat: 23.75,
        contextLng: 90.38,
      });

      expect(result).toHaveProperty('lat');
      expect(result).toHaveProperty('lng');
      expect(result).toHaveProperty('displayName');
      expect(result).toHaveProperty('confidence');
      expect(result.displayName).toContain('Dhanmondi 27');
    });
  });

  describe('locationSimulator ARRIVED_AT_PICKUP guard check', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('only updates DB status to ARRIVED_AT_PICKUP if current status is DRIVER_EN_ROUTE', async () => {
      const rideIdEnRoute = 'test-ride-en-route';
      const findUniqueSpy = vi.fn().mockResolvedValue({ id: rideIdEnRoute, status: 'DRIVER_EN_ROUTE' });
      const updateSpy = vi.fn().mockResolvedValue({ id: rideIdEnRoute, status: 'ARRIVED_AT_PICKUP' });

      // @ts-expect-error Mocking db.ride
      db.ride = {
        findUnique: findUniqueSpy,
        update: updateSpy,
      };

      const pickupLat = 23.7938;
      const pickupLng = 90.4143;
      const startLat = 23.7938 + 0.0002;
      const startLng = 90.4143;

      startDriverSimulation(
        rideIdEnRoute,
        [startLat, startLng],
        [pickupLat, pickupLng],
        [23.7831, 90.3977]
      );

      vi.advanceTimersByTime(2100);
      // Wait microtasks
      await Promise.resolve();

      expect(findUniqueSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: rideIdEnRoute },
        })
      );
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: rideIdEnRoute },
          data: { status: 'ARRIVED_AT_PICKUP' },
        })
      );

      stopDriverSimulation(rideIdEnRoute);
    });

    it('does NOT update DB status to ARRIVED_AT_PICKUP if current status is not DRIVER_EN_ROUTE', async () => {
      const rideIdCancelled = 'test-ride-cancelled';
      const findUniqueSpy = vi.fn().mockResolvedValue({ id: rideIdCancelled, status: 'CANCELLED' });
      const updateSpy = vi.fn().mockResolvedValue({ id: rideIdCancelled });

      // @ts-expect-error Mocking db.ride
      db.ride = {
        findUnique: findUniqueSpy,
        update: updateSpy,
      };

      const pickupLat = 23.7938;
      const pickupLng = 90.4143;
      const startLat = 23.7938 + 0.0002;
      const startLng = 90.4143;

      startDriverSimulation(
        rideIdCancelled,
        [startLat, startLng],
        [pickupLat, pickupLng],
        [23.7831, 90.3977]
      );

      vi.advanceTimersByTime(2100);
      await Promise.resolve();

      expect(findUniqueSpy).toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();

      stopDriverSimulation(rideIdCancelled);
    });
  });

  describe('getDhakaLandmarksAutocomplete (Real Dhaka places)', () => {
    it('returns Mohakhali locations for mohakhali query with default coordinates', () => {
      const results = getDhakaLandmarksAutocomplete('mohakhali');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.displayName.includes('Mohakhali'))).toBe(true);
      const mohakhali = results.find((r) => r.displayName === 'Mohakhali, Dhaka');
      expect(mohakhali).toBeDefined();
      expect(mohakhali?.lat).toBeCloseTo(23.77836, 3);
      expect(mohakhali?.lng).toBeCloseTo(90.39804, 3);
    });

    it('matches real places like Banani 11, Gulshan 1, and Dhanmondi 27', () => {
      const banani = getDhakaLandmarksAutocomplete('banani 11');
      expect(banani.some((r) => r.displayName.includes('Banani'))).toBe(true);

      const gulshan = getDhakaLandmarksAutocomplete('gulshan 1');
      expect(gulshan.some((r) => r.displayName.includes('Gulshan 1'))).toBe(true);
    });
  });
});
