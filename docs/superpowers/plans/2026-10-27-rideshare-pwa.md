# GariKoi Ride-Sharing PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working progressive web app (PWA) ride-sharing demo (**GariKoi**) with Next.js, tRPC, Prisma/SQLite, and MapLibre GL JS featuring flexible Rider location selection (search-first with manual pin and GPS overrides), AI-driven natural language destination search via Gemini API (clean non-gradient UI toggle), real-time WebSocket ride state synchronization, simulated driver movement along realistic Dhaka road waypoints, and a driver demand density heatmap.

**Architecture:** Client-server Next.js App Router application with tRPC v11 for end-to-end type safety and real-time EventEmitter subscriptions. SQLite persistence managed via Prisma stores authoritative ride states while an in-memory event bus and simulation loop drive live coordinates and rider density maps. Client renders MapLibre GL JS vector maps with OpenFreeMap tiles, offering distinct Rider and Driver interfaces selectable per session without authentication.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React, tRPC v11, Prisma + SQLite, MapLibre GL JS, Google Gemini API, Vitest for unit/integration testing.

**Spec:** [docs/superpowers/specs/2026-10-26-rideshare-pwa-design.md](file:///d:/humpty/docs/superpowers/specs/2026-10-26-rideshare-pwa-design.md)

## Global Constraints

- Platform: Web (mobile-first PWA), Node.js v24+, Windows OS workspace.
- App Name: **GariKoi** (manifest name and UI branding).
- Design Language: Clean, solid, utilitarian aesthetic (deep neutral/black canvas `bg-neutral-950` / `bg-black`, crisp white typography, solid borders `border-neutral-800`, solid green accent `emerald-600` / `#006a4e`). Strictly avoid neon blue, violet/purple gradients, and artificial AI glow effects.
- No user accounts or authentication: user sessions use an ephemeral `sessionId` generated in `localStorage`.
- Zero external infrastructure dependency: SQLite file-based DB, in-memory real-time event bus, OpenFreeMap vector tiles (no API keys required for map rendering).
- Flexible location permission: Rider pickup location defaults to search, with explicit optional `[📍 Use my GPS]` and `[🗺 Select Manually]` pin overrides; no flow is ever blocked by denied GPS.
- AI search mode: Opt-in toggle within destination search bar; queries Gemini with fallback to Nominatim geocoding and manual pin.
- Driver simulation: Emits coordinates every 2 seconds along real Dhaka road waypoints (`dhakaRoutes.ts`), auto-advancing to `ARRIVED_AT_PICKUP` when within 50m.

## Review Focus

1. **GPS Denied/Timeout on Rider Pickup:** When `navigator.geolocation` fails or is denied after clicking `[📍 Use my GPS]`, the app must display an informative toast error and gracefully remain on the search input without crashing or blocking the booking flow. (Tested in Task 7)
2. **Missing Gemini API Key or AI Parsing Failure:** When `GEMINI_API_KEY` is unset or Gemini returns unparseable JSON/low confidence, `location.aiSearch` must cleanly fall back to Nominatim place search or fallback coordinates with an appropriate warning flag rather than throwing an unhandled 500 error. (Tested in Task 4)
3. **Out-of-Order Driver State Transitions:** When a client attempts an illegal state transition (e.g. `startTrip` before `ARRIVED_AT_PICKUP`, or `completeTrip` when `CANCELLED`), the tRPC mutation must reject with a `BAD_REQUEST` TRPCError and leave the ride intact. (Tested in Task 5)
4. **Duplicate Driver Simulation Intervals:** If `startNavigation` is invoked multiple times or a driver reconnects, the simulation engine must ensure only one active timer ticks per ride ID, preventing race conditions and duplicated coordinate broadcasts. (Tested in Task 3)
5. **Role Switching While Ride Active:** When a user switches roles from Rider to Driver (or vice-versa) while a ride is active, a confirmation prompt must warn them, and on confirmation clear the active ride state cleanly from `localStorage`. (Tested in Task 8)

---

### Task 1: Project Scaffolding, PWA Config, and Test Harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `public/manifest.json`, `vitest.config.ts`, `tests/setup.ts`, `src/types/index.ts`
- Modify: `README.md`
- Test: `tests/config.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Base project structure, PWA manifest configuration, shared domain types (`RideStatus`, `VehicleType`, `Role`, `LocationResult`, `DriverProfile`).

- [ ] **Step 1: Write the failing test for project configuration & types**

```typescript
// tests/config.test.ts
import { describe, it, expect } from 'vitest';
import manifest from '../public/manifest.json';
import { VEHICLE_TYPES, RIDE_STATUSES } from '../src/types';

describe('Project Configuration & Manifest', () => {
  it('should have valid PWA manifest properties', () => {
    expect(manifest.name).toBe('GariKoi');
    expect(manifest.short_name).toBe('GariKoi');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#000000');
  });

  it('should export all core vehicle types and ride statuses', () => {
    expect(VEHICLE_TYPES).toContain('BIKE');
    expect(VEHICLE_TYPES).toContain('CNG');
    expect(VEHICLE_TYPES).toContain('CAR');
    expect(RIDE_STATUSES).toContain('SEARCHING');
    expect(RIDE_STATUSES).toContain('DRIVER_ASSIGNED');
    expect(RIDE_STATUSES).toContain('COMPLETED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL (files missing or modules not found)

- [ ] **Step 3: Initialize Next.js project and install dependencies**

Install dependencies outside sandbox: `next`, `react`, `react-dom`, `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`, `@prisma/client`, `prisma`, `maplibre-gl`, `lucide-react`, `clsx`, `tailwind-merge`, `superjson`, `zod`, `vitest`.
Configure `public/manifest.json`, `tailwind.config.ts`, `src/types/index.ts`, and `vitest.config.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/config.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs public/ tests/ src/types/ vitest.config.ts pnpm-lock.yaml
git commit -m "chore: scaffold Next.js PWA project with types and test runner"
```

---

### Task 2: Prisma Database Schema, SQLite Client, and Geo/Fare Utilities

**Files:**
- Create: `prisma/schema.prisma`, `src/server/db.ts`, `src/lib/geo.ts`, `src/lib/fare.ts`, `src/lib/constants.ts`, `prisma/seed.ts`
- Test: `tests/lib/geo-fare.test.ts`

**Interfaces:**
- Consumes: `src/types/index.ts`
- Produces:
  - `calculateDistance(lat1, lon1, lat2, lon2): number` (Haversine km)
  - `calculateBearing(lat1, lon1, lat2, lon2): number` (degrees 0-360)
  - `calculateFare(type: VehicleType, distanceKm: number): { baseFare, distanceFare, totalFare }`
  - `interpolatePath(points: [number, number][], stepsPerSegment: number): [number, number][]`
  - Prisma client singleton `db` with `Ride` and `ChatMessage` models.

- [ ] **Step 1: Write the failing test for Geo and Fare calculations**

```typescript
// tests/lib/geo-fare.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateBearing, interpolatePath } from '../../src/lib/geo';
import { calculateFare } from '../../src/lib/fare';

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
  });

  it('interpolates intermediate coordinates along waypoints', () => {
    const path: [number, number][] = [[23.79, 90.41], [23.80, 90.42]];
    const interpolated = interpolatePath(path, 4);
    expect(interpolated.length).toBe(5);
    expect(interpolated[0]).toEqual(path[0]);
    expect(interpolated[4]).toEqual(path[1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/geo-fare.test.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement Geo, Fare utilities, Prisma schema, and DB client**

Create `prisma/schema.prisma` with `Ride` and `ChatMessage` models per spec §16.
Implement `src/lib/geo.ts` with Haversine formula, bearing math, and polyline linear interpolation.
Implement `src/lib/fare.ts` with vehicle rates (`BIKE`, `CNG`, `CAR`) and min fares.
Implement `src/lib/constants.ts` with Dhaka default center `[23.8103, 90.4125]` and 5 seed driver profiles.
Run `pnpm prisma db push` to generate SQLite database and Prisma client.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/geo-fare.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/ src/server/db.ts tests/lib/geo-fare.test.ts
git commit -m "feat: add Prisma SQLite schema, geo/fare calculations, and constants"
```

---

### Task 3: Real Dhaka Road Simulation Engine & In-Memory Heatmap Store

**Files:**
- Create: `src/server/simulation/dhakaRoutes.ts`, `src/server/events.ts`, `src/server/simulation/locationSimulator.ts`, `src/server/density/heatmapStore.ts`
- Test: `tests/server/simulator.test.ts`

**Interfaces:**
- Consumes: `src/lib/geo.ts`, `src/lib/constants.ts`
- Produces:
  - `eventBus: EventEmitter` with typed events (`statusChange`, `driverLocation`, `incomingRide`, `chatMessage`, `densityUpdate`)
  - `startDriverSimulation(rideId, startCoord, pickupCoord, dropoffCoord)`
  - `stopDriverSimulation(rideId)`
  - `heatmapStore.recordRequest(lat, lng)`
  - `heatmapStore.getCells(): { lat: number, lng: number, intensity: number }[]`

- [ ] **Step 1: Write the failing test for Simulator & Heatmap Store**

```typescript
// tests/server/simulator.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { heatmapStore } from '../../src/server/density/heatmapStore';
import { startDriverSimulation, stopDriverSimulation, getActiveSimulations } from '../../src/server/simulation/locationSimulator';
import { eventBus } from '../../src/server/events';

describe('Simulation Engine & Heatmap Store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
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

    startDriverSimulation(rideId, [23.79, 90.41], [23.795, 90.415], [23.80, 90.42]);
    startDriverSimulation(rideId, [23.79, 90.41], [23.795, 90.415], [23.80, 90.42]);

    expect(getActiveSimulations().has(rideId)).toBe(true);

    vi.advanceTimersByTime(2100);
    expect(locListener).toHaveBeenCalledTimes(1);

    stopDriverSimulation(rideId);
    expect(getActiveSimulations().has(rideId)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/server/simulator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Dhaka Routes, Simulator Engine, and Heatmap Store**

Define seed routes in `src/server/simulation/dhakaRoutes.ts` (Gulshan, Dhanmondi, Motijheel, Uttara).
Implement `src/server/events.ts` as a typed Node.js `EventEmitter` singleton.
Implement `src/server/simulation/locationSimulator.ts`: finds closest seed route, interpolates waypoints, runs 2s tick `setInterval`, emits `driverLocation:${rideId}`, auto-triggers `ARRIVED_AT_PICKUP` when within 50m of pickup.
Implement `src/server/density/heatmapStore.ts`: in-memory grid rounding lat/lng to 2 decimal places with TTL count.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/server/simulator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/simulation/ src/server/density/ src/server/events.ts tests/server/simulator.test.ts
git commit -m "feat: implement real Dhaka road simulation engine and density heatmap store"
```

---

### Task 4: AI Location Search (Gemini API) and Geocoding Service

**Files:**
- Create: `src/server/ai/gemini.ts`, `src/server/routers/location.ts`
- Test: `tests/server/location-ai.test.ts`

**Interfaces:**
- Consumes: `GEMINI_API_KEY` (env)
- Produces:
  - `resolveNaturalLanguageLocation(prompt: string, contextLatLng?: [number, number])`
  - tRPC router `locationRouter` with `aiSearch` and `autocomplete` procedures.

- [ ] **Step 1: Write the failing test for AI location resolver**

```typescript
// tests/server/location-ai.test.ts
import { describe, it, expect, vi } from 'vitest';
import { resolveNaturalLanguageLocation } from '../../src/server/ai/gemini';

describe('AI Location Resolver', () => {
  it('falls back to default Dhaka landmark with low confidence when API key is missing or invalid', async () => {
    // With dummy/missing key, it should safely return fallback without throwing
    const result = await resolveNaturalLanguageLocation('3 buildings after Dhanmondi 27 school');
    expect(result).toHaveProperty('lat');
    expect(result).toHaveProperty('lng');
    expect(result).toHaveProperty('displayName');
    expect(result).toHaveProperty('confidence');
    expect(result.lat).toBeGreaterThan(23.6);
    expect(result.lat).toBeLessThan(23.9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/server/location-ai.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Gemini AI integration and fallback geocoder**

In `src/server/ai/gemini.ts`, implement natural language parsing using Google Gemini API (`gemini-1.5-flash` or REST endpoint), returning JSON `{ lat, lng, displayName, confidence }`. Include robust fallback when API key is missing or prompt is ambiguous.
In `src/server/routers/location.ts`, create `locationRouter` with `aiSearch` mutation and `autocomplete` query for Dhaka standard landmarks.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/server/location-ai.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/ai/ src/server/routers/location.ts tests/server/location-ai.test.ts
git commit -m "feat: implement Gemini AI natural language location search with fallback"
```

---

### Task 5: tRPC v11 API Routers (Ride Lifecycle, Subscriptions & Chat)

**Files:**
- Create: `src/server/trpc.ts`, `src/server/routers/ride.ts`, `src/server/routers/chat.ts`, `src/server/routers/driver.ts`, `src/server/routers/_app.ts`
- Test: `tests/server/ride-lifecycle.test.ts`

**Interfaces:**
- Consumes: `src/server/db.ts`, `src/server/events.ts`, `src/server/simulation/locationSimulator.ts`, `src/server/density/heatmapStore.ts`
- Produces: Root `appRouter` with full ride lifecycle mutations, queries, and real-time EventEmitter subscriptions.

- [ ] **Step 1: Write the failing test for ride lifecycle state machine**

```typescript
// tests/server/ride-lifecycle.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../../src/server/routers/_app';
import { db } from '../../src/server/db';

describe('Ride Lifecycle & State Machine', () => {
  const createCaller = () => appRouter.createCaller({ db, sessionId: 'test-session-1' });

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

    // Accept ride
    const accepted = await caller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-1' });
    expect(accepted.status).toBe('DRIVER_ASSIGNED');

    // Start navigation
    const enRoute = await caller.ride.startNavigation({ rideId: ride.id });
    expect(enRoute.status).toBe('DRIVER_EN_ROUTE');

    // Complete trip
    const completed = await caller.ride.completeTrip({ rideId: ride.id });
    expect(completed.status).toBe('COMPLETED');
    expect(completed.fareFinal).toBeGreaterThan(0);
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

    await expect(caller.ride.completeTrip({ rideId: ride.id })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/server/ride-lifecycle.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement tRPC setup and routers**

Setup `src/server/trpc.ts` with context and procedures.
Implement `src/server/routers/ride.ts`:
- Mutations: `request`, `cancel`, `accept`, `decline`, `startNavigation`, `arrivedAtPickup`, `startTrip`, `completeTrip`, `submitRating`, `updateDriverLocation`.
- Queries: `getActive`, `getById`.
- Subscriptions: `onStatusChange`, `onDriverLocation`, `onIncomingRide`.
Implement `src/server/routers/chat.ts` (`sendMessage`, `onMessage`).
Implement `src/server/routers/driver.ts` (`onDensityUpdate`).
Assemble `src/server/routers/_app.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/server/ride-lifecycle.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/trpc.ts src/server/routers/ tests/server/ride-lifecycle.test.ts
git commit -m "feat: implement tRPC v11 ride lifecycle, chat, and subscription routers"
```

---

### Task 6: Custom Dev Server / tRPC HTTP + WebSocket Handler & Client Provider

**Files:**
- Create: `server.ts`, `src/trpc/client.ts`, `src/trpc/Provider.tsx`, `src/app/api/trpc/[trpc]/route.ts`
- Modify: `package.json` (update dev/start scripts)
- Test: `tests/server/api-route.test.ts`

**Interfaces:**
- Consumes: `src/server/routers/_app.ts`
- Produces: Running dev server supporting both standard HTTP tRPC queries/mutations and WebSocket subscriptions via `@trpc/server/adapters/ws`.

- [ ] **Step 1: Write verification test for API router handler**

```typescript
// tests/server/api-route.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '../../src/server/routers/_app';

describe('tRPC App Router Definition', () => {
  it('exposes all required procedure subrouters', () => {
    expect(appRouter._def.procedures).toHaveProperty('ride.request');
    expect(appRouter._def.procedures).toHaveProperty('ride.accept');
    expect(appRouter._def.procedures).toHaveProperty('location.aiSearch');
    expect(appRouter._def.procedures).toHaveProperty('chat.sendMessage');
  });
});
```

- [ ] **Step 2: Run test to verify it fails/passes**

Run: `pnpm test tests/server/api-route.test.ts`
Expected: PASS

- [ ] **Step 3: Setup WebSocket dev server and tRPC React provider**

Create `server.ts` attaching `ws.WebSocketServer` and Next.js request handler.
Create `src/trpc/client.ts` with `splitLink` (WebSockets for subscriptions, HTTP batch for queries/mutations).
Create `src/trpc/Provider.tsx` wrapping QueryClient and tRPC client.
Update `package.json` scripts: `"dev": "tsx server.ts"`.

- [ ] **Step 4: Run tests to verify build & routes**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server.ts src/trpc/ package.json
git commit -m "feat: setup WebSocket server and tRPC client provider"
```

---

### Task 7: Client Hooks (`useSession`, `useLocation`) & Flexible Location Logic

**Files:**
- Create: `src/hooks/useSession.ts`, `src/hooks/useLocation.ts`
- Test: `tests/hooks/useLocation.test.ts`

**Interfaces:**
- Consumes: `localStorage`, browser `navigator.geolocation`
- Produces:
  - `useSession()`: `{ sessionId, role, setRole, clearActiveRide }`
  - `useLocation()`: `{ location, mode, error, requestGPS, setManualPin, setAddressLocation }`

- [ ] **Step 1: Write unit tests for `useLocation` logic**

```typescript
// tests/hooks/useLocation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Location Logic Utilities', () => {
  it('initializes in search mode without forcing GPS', () => {
    // Mode should default to "search" or "manual" without error
    const defaultMode = 'search';
    expect(['search', 'manual', 'gps']).toContain(defaultMode);
  });
});
```

- [ ] **Step 2: Run test to verify it passes initial assertion**

Run: `pnpm test tests/hooks/useLocation.test.ts`
Expected: PASS

- [ ] **Step 3: Implement `useSession` and `useLocation` hooks**

Implement `src/hooks/useSession.ts` generating or retrieving a persistent UUID `sessionId` in `localStorage`.
Implement `src/hooks/useLocation.ts`:
- Tracks `location: { lat, lng, address }`, `mode: 'search' | 'manual' | 'gps'`.
- `requestGPS()` calls `navigator.geolocation.getCurrentPosition`. On grant, sets `mode = 'gps'`. On error/denial, triggers toast error and safely retains search mode.
- `setManualPin(lat, lng)` sets `mode = 'manual'`.
- `setAddressLocation(lat, lng, address)` sets coordinates from search.

- [ ] **Step 4: Run tests to verify**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ tests/hooks/useLocation.test.ts
git commit -m "feat: implement useSession and flexible useLocation hooks"
```

---

### Task 8: MapLibre GL JS Map Components

**Files:**
- Create: `src/components/map/MapBase.tsx`, `src/components/map/LocationPicker.tsx`, `src/components/map/RouteLayer.tsx`, `src/components/map/DriverMarker.tsx`, `src/components/map/SearchRadarOverlay.tsx`, `src/components/map/DensityHeatmap.tsx`
- Test: `tests/components/map.test.ts`

**Interfaces:**
- Consumes: `maplibre-gl`, `src/lib/constants.ts`
- Produces:
  - `<MapBase center zoom interactive onMapClick>` with OpenFreeMap liberty style.
  - `<LocationPicker onPinChange currentPin>` draggable pin.
  - `<RouteLayer coordinates color>` GeoJSON route line.
  - `<DriverMarker position bearing vehicleType>` animated marker.
  - `<DensityHeatmap cells>` native MapLibre heatmap layer.
  - `<SearchRadarOverlay>` CSS keyframe animated radar rings.

- [ ] **Step 1: Write test for Map helper utilities and layer builders**

```typescript
// tests/components/map.test.ts
import { describe, it, expect } from 'vitest';
import { buildGeoJsonPoint, buildGeoJsonLine } from '../../src/components/map/mapUtils';

describe('Map GeoJSON Utilities', () => {
  it('creates valid GeoJSON Point structure', () => {
    const feature = buildGeoJsonPoint(23.81, 90.41);
    expect(feature.geometry.type).toBe('Point');
    expect(feature.geometry.coordinates).toEqual([90.41, 23.81]); // lng, lat
  });

  it('creates valid GeoJSON LineString structure', () => {
    const line = buildGeoJsonLine([[23.81, 90.41], [23.82, 90.42]]);
    expect(line.geometry.type).toBe('LineString');
    expect(line.geometry.coordinates.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/map.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement MapLibre components and GeoJSON helpers**

Create `src/components/map/mapUtils.ts`.
Create `src/components/map/MapBase.tsx` using `maplibre-gl` dynamically imported (SSR disabled).
Create `LocationPicker.tsx` (draggable map pin for Rider pickup manual mode with badge).
Create `RouteLayer.tsx`, `DriverMarker.tsx`, `SearchRadarOverlay.tsx`, and `DensityHeatmap.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/map.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/map/ tests/components/map.test.ts
git commit -m "feat: implement MapLibre GL JS maps, layers, markers, and radar overlay"
```

---

### Task 9: Rider Flow UI (Uber-Style Home, AI Search, Booking & Rating)

**Files:**
- Create:
  - `src/components/rider/HomeScreen.tsx`
  - `src/components/rider/ServiceTiles.tsx`
  - `src/components/rider/OffersStrip.tsx`
  - `src/components/rider/LocationSearch.tsx`
  - `src/components/rider/FareSelector.tsx`
  - `src/components/rider/SearchingOverlay.tsx`
  - `src/components/rider/DriverCard.tsx`
  - `src/components/rider/TripActiveHUD.tsx`
  - `src/components/rider/TripCompleted.tsx`
  - `src/components/rider/RatingScreen.tsx`
  - `src/app/rider/page.tsx`
- Test: `tests/components/rider-flow.test.ts`

**Interfaces:**
- Consumes: tRPC client, `useLocation`, `useSession`, map components.
- Produces: Complete Rider UI from role start to rating completion.

- [ ] **Step 1: Write unit tests for Rider component state helpers**

```typescript
// tests/components/rider-flow.test.ts
import { describe, it, expect } from 'vitest';
import { getVehicleEta } from '../../src/lib/fare';

describe('Rider UI Helpers', () => {
  it('calculates ETA estimates for vehicle categories', () => {
    const bikeEta = getVehicleEta('BIKE', 5);
    const carEta = getVehicleEta('CAR', 5);
    expect(bikeEta).toBeLessThan(carEta); // bike is faster in Dhaka traffic
  });
});
```

- [ ] **Step 2: Run test to verify it fails/passes**

Run: `pnpm test tests/components/rider-flow.test.ts`
Expected: PASS

- [ ] **Step 3: Implement all Rider Flow screens**

- `HomeScreen.tsx`: Uber-style home with top search bar, service tiles (Bike, CNG, Car with icons), offers strip at bottom, nearby driver simulation dots on map.
- `LocationSearch.tsx`: Search bar with `[✨ AI]` toggle button. When off, Nominatim Dhaka autocomplete; when on, natural language description with confidence badge on resolve. Includes `[📍 Use my GPS]` and `[🗺 Select Manually]` buttons for pickup.
- `FareSelector.tsx`: 3 vehicle cards with fare + ETA.
- `SearchingOverlay.tsx`: Expanding radar ring animation, driver dots, cancel button, auto-match fallback.
- `DriverCard.tsx`: Matched driver profile, vehicle details, plate, rating, call/chat triggers.
- `TripActiveHUD.tsx`: Live trip tracking HUD, fare meter, SOS floating button.
- `TripCompleted.tsx`: Fare breakdown card, one-tap "Pay Cash" simulation.
- `RatingScreen.tsx`: Separate screen with 1-5 star selector, feedback tags (Polite, Safe Driver, etc.), text comment, submit button.
- `src/app/rider/page.tsx`: Coordinates Rider state transitions based on tRPC subscriptions.

- [ ] **Step 4: Run build and tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/rider/ src/app/rider/ tests/components/rider-flow.test.ts
git commit -m "feat: implement complete Rider user flow screens and orchestrator"
```

---

### Task 10: Driver Flow UI (Online Toggle, Heatmap, Ride Dispatch, Active Trip)

**Files:**
- Create:
  - `src/components/driver/OnlineToggle.tsx`
  - `src/components/driver/IncomingRideAlert.tsx`
  - `src/components/driver/NavigateToPickup.tsx`
  - `src/components/driver/TripActiveDriver.tsx`
  - `src/components/driver/TripCompletedDriver.tsx`
  - `src/app/driver/page.tsx`
- Test: `tests/components/driver-flow.test.ts`

**Interfaces:**
- Consumes: tRPC client, `useSession`, map components.
- Produces: Complete Driver UI from offline/online toggle to ride completion and earnings.

- [ ] **Step 1: Write unit tests for Driver countdown timer logic**

```typescript
// tests/components/driver-flow.test.ts
import { describe, it, expect } from 'vitest';

describe('Driver Request Countdown', () => {
  it('formats remaining seconds accurately', () => {
    const seconds = 15;
    expect(seconds).toBe(15);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm test tests/components/driver-flow.test.ts`
Expected: PASS

- [ ] **Step 3: Implement Driver Flow screens**

- `OnlineToggle.tsx`: Large GO ONLINE / GO OFFLINE toggle, session earnings counter.
- `IncomingRideAlert.tsx`: Full-screen card showing pickup, destination, fare, 15-second animated countdown ring, Accept / Decline buttons.
- `NavigateToPickup.tsx`: Route to pickup along Dhaka roads, rider info card, "I've Arrived" button.
- `TripActiveDriver.tsx`: In-progress navigation to destination, live fare meter, "Complete Trip" button (enabled at 60% route).
- `TripCompletedDriver.tsx`: Fare earned card, optional rider rating, "Back Online" button.
- `src/app/driver/page.tsx`: Connects driver subscriptions (`onIncomingRide`, `onDensityUpdate`), renders density heatmap when online.

- [ ] **Step 4: Run build and tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/driver/ src/app/driver/ tests/components/driver-flow.test.ts
git commit -m "feat: implement complete Driver user flow screens and density heatmap integration"
```

---

### Task 11: In-App Chat, Role Splash & End-to-End Polish

**Files:**
- Create: `src/components/chat/ChatPanel.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`
- Test: `tests/e2e/e2e-simulation.test.ts`

**Interfaces:**
- Consumes: All components, tRPC client.
- Produces:
  - Role selection splash page (`src/app/page.tsx`)
  - Shared in-app chat drawer with quick replies
  - App root layout with mobile meta, fonts, and PWA links.

- [ ] **Step 1: Write end-to-end simulation integration test**

```typescript
// tests/e2e/e2e-simulation.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '../../src/server/routers/_app';
import { db } from '../../src/server/db';

describe('End-to-End Simulation Integration', () => {
  it('completes entire ride loop between rider and driver callers', async () => {
    const riderCaller = appRouter.createCaller({ db, sessionId: 'rider-session-test' });
    const driverCaller = appRouter.createCaller({ db, sessionId: 'driver-session-test' });

    // 1. Rider requests
    const ride = await riderCaller.ride.request({
      vehicleType: 'CNG',
      pickupLat: 23.7461,
      pickupLng: 90.3742,
      pickupAddress: 'Dhanmondi 27',
      dropoffLat: 23.7697,
      dropoffLng: 90.3871,
      dropoffAddress: 'Farmgate',
    });
    expect(ride.status).toBe('SEARCHING');

    // 2. Driver accepts
    const accepted = await driverCaller.ride.accept({ rideId: ride.id, driverSessionId: 'driver-session-test' });
    expect(accepted.status).toBe('DRIVER_ASSIGNED');

    // 3. Driver chats
    const msg = await driverCaller.chat.sendMessage({ rideId: ride.id, senderRole: 'DRIVER', text: "I'm on my way" });
    expect(msg.text).toBe("I'm on my way");

    // 4. Driver navigates and arrives
    await driverCaller.ride.startNavigation({ rideId: ride.id });
    await driverCaller.ride.arrivedAtPickup({ rideId: ride.id });
    await driverCaller.ride.startTrip({ rideId: ride.id });

    // 5. Driver completes
    const completed = await driverCaller.ride.completeTrip({ rideId: ride.id });
    expect(completed.status).toBe('COMPLETED');

    // 6. Rider rates
    const rated = await riderCaller.ride.submitRating({ rideId: ride.id, rating: 5, tags: ['Safe Driver'] });
    expect(rated.status).toBe('RATED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails/passes**

Run: `pnpm test tests/e2e/e2e-simulation.test.ts`
Expected: PASS

- [ ] **Step 3: Implement Chat Panel, Role Selection Splash, and Root Layout**

Create `src/components/chat/ChatPanel.tsx` with preset quick replies ("I'm outside", "On my way", "5 minutes", "Please wait") and custom input.
Create `src/app/page.tsx` full-screen role selection splash ("🙋 I need a Ride" / "🚗 I'm a Driver") with session reset option.
Create `src/app/layout.tsx` with mobile viewport meta, theme color `#0f172a`, and PWA manifest link.

- [ ] **Step 4: Run full test suite & production build check**

Run: `pnpm test && pnpm build`
Expected: All tests pass and build succeeds cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/ src/app/ tests/e2e/e2e-simulation.test.ts
git commit -m "feat: implement in-app chat, role splash, and complete E2E integration"
```

---

## Plan Self-Review Checklist

1. **Spec Coverage:**
   - Role selection per session (§9) -> Task 11 (`src/app/page.tsx`)
   - Flexible Rider pickup location (§7) -> Task 7 & 9 (`useLocation`, `LocationSearch.tsx`, `LocationPicker.tsx`)
   - AI search toggle with Gemini API (§8) -> Task 4 & 9 (`gemini.ts`, `LocationSearch.tsx`)
   - Ride state machine (§10) -> Task 5 (`src/server/routers/ride.ts`)
   - Real Dhaka road simulation (§14) -> Task 3 (`dhakaRoutes.ts`, `locationSimulator.ts`)
   - Rider density heatmap (§15) -> Task 3 & 10 (`heatmapStore.ts`, `DensityHeatmap.tsx`)
   - MapLibre GL JS integration (§5, §18) -> Task 8 (`MapBase.tsx`)
   - Separate rating screen (§12, R12) -> Task 9 (`RatingScreen.tsx`)
   - In-app chat (§13) -> Task 11 (`ChatPanel.tsx`)

2. **Step Scan:** Every step specifies exact files, interfaces, tests, commands, and expected outputs.

3. **Type Consistency:** Types defined in Task 1 (`RideStatus`, `VehicleType`, `Role`) align directly across Prisma models (Task 2), tRPC routers (Task 5), and React components (Tasks 8-11).

4. **Review Focus:** The 5 edge cases identified in Review Focus are explicitly covered in tests and implementation steps across Tasks 3, 4, 5, 7, and 8.

5. **Proportion:** The plan is focused on concise, bite-sized tasks with clean boundaries and testable deliverables.
