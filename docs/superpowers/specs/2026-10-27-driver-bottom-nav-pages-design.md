# Design Doc: Dedicated Driver Bottom Navigation Bar & Subroute Pages

## 1. Intent and Why
Currently, the driver interface at `/driver` is focused exclusively on the map viewport, online/offline toggle, and active ride execution states. However, driver apps (e.g., Pathao Captain, Uber Driver) require dedicated pages for tracking earnings, reviewing completed trip logs, and managing driver profile/vehicle credentials.
The goal is to introduce a persistent, modular `DriverBottomNav` and three dedicated Next.js App Router subroutes:
- `/driver` (Drive / Map / Dispatch)
- `/driver/earnings` (Earnings, Daily Quest Incentives, bKash Cashout)
- `/driver/trips` (Driver Completed Trips History & Passenger Ratings)
- `/driver/profile` (Driver Performance, Vehicle Specs, Document Verification, Switch to Rider)

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Create a reusable `DriverBottomNav` component that automatically detects current pathname (`/driver`, `/driver/earnings`, `/driver/trips`, `/driver/profile`) and renders active tab highlights.
- Create 3 dedicated, fully styled subroute pages with realistic hardcoded Dhaka driver data.
- Gracefully preserve driver map states: keep `DriverBottomNav` visible when offline or in standby mode on `/driver`, while auto-hiding during active navigation states (`EN_ROUTE_PICKUP`, `ARRIVED_PICKUP`, `TRIP_IN_PROGRESS`).
- Ensure consistent dark theme styling (`bg-black`, `bg-neutral-900`, `text-emerald-400`, `border-neutral-800`).

### Non-Goals
- Modifying backend tRPC driver mutation APIs or Prisma schema.
- Disrupting existing ride acceptance or navigation flow in `/driver`.

### Anti-Goals
- Blocking the driver HUD or map controls during active ride fulfillment.

---

## 3. Specifications

### A. `DriverBottomNav` (`src/components/driver/DriverBottomNav.tsx`)
- Tabs:
  - **Drive** (`/driver`) with `Navigation` or `Compass` icon
  - **Earnings** (`/driver/earnings`) with `Wallet` or `CircleDollarSign` icon
  - **Trips** (`/driver/trips`) with `Clock` or `ClipboardList` icon
  - **Profile** (`/driver/profile`) with `User` or `ShieldCheck` icon
- Next.js `Link` elements for client-side routing.
- Sticky bottom mobile layout with backdrop blur.

### B. Integration in `/driver` (`src/app/driver/page.tsx`)
- Render `<DriverBottomNav activeTab="drive" />` when in `OFFLINE` or `ONLINE_STANDBY` flow states.

### C. Earnings Page (`src/app/driver/earnings/page.tsx`)
- Top metrics: Today's Total Earnings (৳2,850), Trips Completed (14 trips), Online Hours (6.5 hrs).
- Cash vs. Digital Breakdown:
  - Cash Collected in Hand: ৳1,650
  - Digital (bKash/Nagad) Wallet Balance: ৳1,200
  - Platform Commission Deducted: ৳320 (10%)
- Dhaka Rush Hour Incentives & Daily Quests:
  - Peak Surge Bonus (Gulshan & Banani): +৳300 earned
  - Complete 15 Trips Quest: 14/15 completed (Reward: ৳250 bonus)
- Action: "Instant Cashout to bKash" button with modal / confirmation feedback.

### D. Trips Page (`src/app/driver/trips/page.tsx`)
- Today / Recent trip cards:
  - Route: Gulshan 2 to Dhanmondi 27 (Car, ৳380, Passenger: Tanvir A., 5.0★)
  - Route: Banani 11 to Airport (Car, ৳540, Passenger: Sadia K., 5.0★)
  - Route: Farmgate to Motijheel (Car, ৳260, Passenger: Rakib H., 4.9★)
  - Route: Mohakhali to Uttara (Car, ৳410, Passenger: Farzana M., 5.0★)
- Net driver earnings per trip after platform deduction.
- Distance, trip duration, and passenger tip indicator.

### E. Profile Page (`src/app/driver/profile/page.tsx`)
- Driver Header: "Rafiqul Islam" (Verified Dhaka Captain, Rating: 4.92★, 1,420 Lifetime Trips).
- Performance KPIs: Acceptance Rate: 96%, Cancellation Rate: 1.8%, On-Time Rate: 98%.
- Vehicle & Documentation:
  - Vehicle: Toyota Axio 2018 (White)
  - Plate: Dhaka Metro Ga 28-9412
  - Registration Certificate: Verified
  - Tax Token: Valid until Dec 2026
  - Driving License: Verified BRTA Smart Card
- Switch to Rider Mode (`/rider`) button and Session Reset.

---

## 4. Verification Plan
- `tsc --noEmit` check.
- `next build` validation of `/driver`, `/driver/earnings`, `/driver/trips`, and `/driver/profile`.
- Vitest component tests in `tests/components/driver-bottom-nav-pages.test.ts`.
