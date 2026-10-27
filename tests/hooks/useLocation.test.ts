import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import {
  useLocation,
  LOCATION_BADGES,
  type LocationMode,
} from '../../src/hooks/useLocation';
import { useSession } from '../../src/hooks/useSession';
import { Role } from '../../src/types';

// In-memory MockStorage for testing browser localStorage in Node environment
class MockLocalStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Lightweight standard hook runner harness adhering to React dispatcher internals
function renderHook<T>(hookFn: () => T) {
  const stateSlots: any[] = [];
  let stateIndex = 0;
  const effectSlots: { deps?: any[]; cleanup?: (() => void) | void }[] = [];
  let effectIndex = 0;
  const pendingEffects: (() => void)[] = [];
  let isRendering = false;
  const result = { current: null as unknown as T };

  const dispatcher = {
    useState(initial: any) {
      const idx = stateIndex++;
      if (stateSlots.length <= idx) {
        stateSlots[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (newVal: any) => {
        const next = typeof newVal === 'function' ? newVal(stateSlots[idx]) : newVal;
        if (Object.is(stateSlots[idx], next)) return;
        stateSlots[idx] = next;
        if (!isRendering) {
          rerender();
        }
      };
      return [stateSlots[idx], setState];
    },
    useCallback(fn: any) {
      return fn;
    },
    useMemo(fn: any) {
      return fn();
    },
    useRef(initial: any) {
      const idx = stateIndex++;
      if (stateSlots.length <= idx) {
        stateSlots[idx] = { current: initial };
      }
      return stateSlots[idx];
    },
    useEffect(effect: any, deps?: any[]) {
      const idx = effectIndex++;
      const prev = effectSlots[idx];
      let hasChanged = true;
      if (prev && deps) {
        hasChanged = deps.some((d: any, i: number) => !Object.is(d, prev.deps?.[i]));
      }
      if (hasChanged) {
        pendingEffects.push(() => {
          if (prev && typeof prev.cleanup === 'function') {
            prev.cleanup();
          }
          const cleanup = effect();
          effectSlots[idx] = { deps, cleanup };
        });
      }
    },
  };

  function rerender() {
    isRendering = true;
    stateIndex = 0;
    effectIndex = 0;
    const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    const origDispatcher = internals.ReactCurrentDispatcher.current;
    internals.ReactCurrentDispatcher.current = dispatcher;
    try {
      result.current = hookFn();
    } finally {
      internals.ReactCurrentDispatcher.current = origDispatcher;
      isRendering = false;
    }

    while (pendingEffects.length > 0) {
      const runEffect = pendingEffects.shift()!;
      runEffect();
    }
  }

  rerender();

  return {
    result,
    rerender,
    unmount() {
      for (const slot of effectSlots) {
        if (slot && typeof slot.cleanup === 'function') {
          slot.cleanup();
        }
      }
    },
  };
}

async function act(callback: () => void | Promise<void>) {
  await callback();
}

describe('Location Logic & useLocation Hook', () => {
  let mockStorage: MockLocalStorage;
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>;
    watchPosition: ReturnType<typeof vi.fn>;
    clearWatch: ReturnType<typeof vi.fn>;
  };
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();

    mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        geolocation: mockGeolocation,
      },
      configurable: true,
      writable: true,
    });

    (globalThis as any).localStorage = mockStorage;
    (globalThis as any).window = {
      localStorage: mockStorage,
      navigator: (globalThis as any).navigator,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('initializes in search mode without forcing GPS', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current.mode).toBe('search');
    expect(result.current.location).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.badgeText).toBeNull();
  });

  it('switches to manual mode when setManualPin is called with coordinates', () => {
    const { result } = renderHook(() => useLocation());

    act(() => {
      result.current.setManualPin(23.7808, 90.4152);
    });

    expect(result.current.mode).toBe('manual');
    expect(result.current.location).toEqual({
      lat: 23.7808,
      lng: 90.4152,
      displayName: 'Manual Pin',
      address: 'Manual Pin',
    });
    expect(result.current.badgeText).toBe(LOCATION_BADGES.manual);
    expect(result.current.error).toBeNull();
  });

  it('updates location via text search with setAddressLocation in search mode', () => {
    const { result } = renderHook(() => useLocation());

    act(() => {
      result.current.setAddressLocation(23.8103, 90.4125, 'Gulshan 2 Circle, Dhaka');
    });

    expect(result.current.mode).toBe('search');
    expect(result.current.location).toEqual({
      lat: 23.8103,
      lng: 90.4125,
      displayName: 'Gulshan 2 Circle, Dhaka',
      address: 'Gulshan 2 Circle, Dhaka',
    });
    expect(result.current.badgeText).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('switches to gps mode with Live GPS badge on granted geolocation', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 23.7937,
          longitude: 90.4066,
          accuracy: 15,
        },
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestGPS();
    });

    expect(result.current.mode).toBe('gps');
    expect(result.current.location).toEqual({
      lat: 23.7937,
      lng: 90.4066,
      displayName: 'Current Location',
      address: 'Current Location',
      confidence: 1,
    });
    expect(result.current.badgeText).toBe(LOCATION_BADGES.gps);
    expect(result.current.error).toBeNull();
  });

  describe('Review Focus 1: Graceful GPS Error Handling & Non-blocking Search Fallback', () => {
    it('sets informative error and safely remains in search mode when GPS permission is denied', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
        error({
          code: 1, // GeolocationPositionError.PERMISSION_DENIED
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { result } = renderHook(() => useLocation());

      // Pre-condition: mode is search
      expect(result.current.mode).toBe('search');

      // Request GPS must NOT throw or reject
      await expect(
        act(async () => {
          await result.current.requestGPS();
        })
      ).resolves.not.toThrow();

      // Post-condition: error is informative, mode safely remains search
      expect(result.current.mode).toBe('search');
      expect(result.current.error).toMatch(/permission denied/i);
      expect(result.current.badgeText).toBeNull();

      // Flow is not blocked: rider can still set address or manual pin
      act(() => {
        result.current.setAddressLocation(23.79, 90.40, 'Banani 11');
      });
      expect(result.current.location?.displayName).toBe('Banani 11');
      expect(result.current.mode).toBe('search');
    });

    it('sets informative error and safely remains in search mode when GPS request times out', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
        error({
          code: 3, // GeolocationPositionError.TIMEOUT
          message: 'Geolocation timed out',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { result } = renderHook(() => useLocation());

      await expect(
        act(async () => {
          await result.current.requestGPS();
        })
      ).resolves.not.toThrow();

      expect(result.current.mode).toBe('search');
      expect(result.current.error).toMatch(/timed out/i);
      expect(result.current.badgeText).toBeNull();
    });

    it('sets informative error when geolocation is unavailable in browser', async () => {
      const emptyNav = {};
      Object.defineProperty(globalThis, 'navigator', {
        value: emptyNav,
        configurable: true,
        writable: true,
      });
      (globalThis as any).window = {
        localStorage: mockStorage,
        navigator: emptyNav,
      };

      const { result } = renderHook(() => useLocation());

      await expect(
        act(async () => {
          await result.current.requestGPS();
        })
      ).resolves.not.toThrow();

      expect(result.current.mode).toBe('search');
      expect(result.current.error).toMatch(/not supported/i);
    });
  });
});

describe('Session Logic & useSession Hook', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    (globalThis as any).localStorage = mockStorage;
    (globalThis as any).window = { localStorage: mockStorage };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates and persists an ephemeral UUID sessionId when none exists', () => {
    const { result } = renderHook(() => useSession());

    expect(result.current.sessionId).toBeDefined();
    expect(typeof result.current.sessionId).toBe('string');
    expect(result.current.sessionId.length).toBeGreaterThan(8);

    // Stored in localStorage
    expect(mockStorage.getItem('garikoi_session_id')).toBe(result.current.sessionId);
  });

  it('reuses existing sessionId from localStorage across mounts', () => {
    mockStorage.setItem('garikoi_session_id', 'existing-uuid-1234');

    const { result } = renderHook(() => useSession());

    expect(result.current.sessionId).toBe('existing-uuid-1234');
  });

  it('initializes role as null if not stored in localStorage', () => {
    const { result } = renderHook(() => useSession());

    expect(result.current.role).toBeNull();
  });

  it('updates role to RIDER and persists in localStorage', () => {
    const { result } = renderHook(() => useSession());

    act(() => {
      result.current.setRole('RIDER');
    });

    expect(result.current.role).toBe('RIDER');
    expect(mockStorage.getItem('garikoi_role')).toBe('RIDER');
  });

  it('updates role to DRIVER and persists in localStorage', () => {
    const { result } = renderHook(() => useSession());

    act(() => {
      result.current.setRole('DRIVER');
    });

    expect(result.current.role).toBe('DRIVER');
    expect(mockStorage.getItem('garikoi_role')).toBe('DRIVER');
  });

  it('clears role when clearRole is called', () => {
    mockStorage.setItem('garikoi_role', 'RIDER');

    const { result } = renderHook(() => useSession());
    expect(result.current.role).toBe('RIDER');

    act(() => {
      result.current.clearRole();
    });

    expect(result.current.role).toBeNull();
    expect(mockStorage.getItem('garikoi_role')).toBeNull();
  });

  it('clears active ride state when clearActiveRide is called', () => {
    mockStorage.setItem('garikoi_active_ride_id', 'ride-abc-123');

    const { result } = renderHook(() => useSession());

    act(() => {
      result.current.clearActiveRide();
    });

    expect(mockStorage.getItem('garikoi_active_ride_id')).toBeNull();
  });
});
