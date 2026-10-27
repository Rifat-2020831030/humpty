# Design Doc: Dedicated URLs for Rider Bottom Navigation Bar

## 1. Intent and Why
Currently, the rider experience has a bottom navigation bar in `HomeScreen.tsx` with four tabs: **Home**, **Activity**, **Offers**, and **Profile**. However, clicking these tabs does not switch screens, and all content remains the Home booking screen.
The goal is to provide a dedicated, navigable URL page for each bottom navigation bar menu item using Next.js App Router, populated with realistic Dhaka-tailored hardcoded data where backend APIs do not exist.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Create dedicated Next.js routes:
  - `/rider` — **Home**: Main rideshare dashboard & booking flow.
  - `/rider/activity` — **Activity**: Past trips, routes, driver info, fare in BDT, status badges, and re-book button.
  - `/rider/offers` — **Offers**: Promotional codes, discount vouchers, copy code actions, and direct apply to ride.
  - `/rider/profile` — **Profile**: User profile, rating, saved addresses, payment methods (bKash/Nagad/Cash), safety tools, and role switch to Driver.
- Extract a clean, reusable `RiderBottomNav` component shared across all rider pages that highlights the active tab based on `usePathname()`.
- Ensure mobile-responsive Pathao/Uber-style dark theme consistent with the rest of GariKoi.

### Non-Goals
- Modifying the underlying WebSockets/tRPC active ride state machine in `/rider` (this remains strictly on the Home booking flow).
- Backend database schema migrations for promotions or user profiles (realistic mock data used per user request).

### Anti-Goals
- Breaking the existing full-screen map, driver selection, and live trip views on `/rider`.
- Slow full-page reloads (Next.js client-side navigation using `<Link>` is used).

---

## 3. Constraints
- Next.js App Router (`src/app/rider/*`).
- Tailwind CSS dark UI consistent with existing styling (`bg-neutral-900`, `text-emerald-400`, `border-neutral-800`).
- Lucide React icons.

---

## 4. Approaches Considered
1. **Approach 1: Dedicated Subroutes with Reusable `RiderBottomNav` (Selected)**
   - Create `src/components/rider/RiderBottomNav.tsx`.
   - Update `HomeScreen.tsx` to use `RiderBottomNav`.
   - Create `src/app/rider/activity/page.tsx`, `src/app/rider/offers/page.tsx`, and `src/app/rider/profile/page.tsx`.
   - Provides clean separation, preserves existing complex `/rider` state machine, supports direct browser routing and bookmarks.
2. **Approach 2: Global Rider Layout (`src/app/rider/layout.tsx`)**
   - Wrapping `/rider` in a layout causes conflicts with full-screen map modal overlays, radar overlays, and active in-ride screens. Rejected in favor of Approach 1.

---

## 5. Detailed Component & Page Specifications

### A. Reusable Component: `RiderBottomNav` (`src/components/rider/RiderBottomNav.tsx`)
- Navigation items:
  - Home: `/rider` (`HomeIcon`)
  - Activity: `/rider/activity` (`Clock`)
  - Offers: `/rider/offers` (`Tag`)
  - Profile: `/rider/profile` (`User`)
- Uses `usePathname()` to determine active state.
- Sticky bottom mobile layout with blur effect matching current design.

### B. Activity Page (`src/app/rider/activity/page.tsx`)
- Top header: "Your Activity" with live driver counter or Dhaka status.
- Filter chips: All, Completed, Cancelled.
- Realistic Dhaka ride history cards:
  - Gulshan 2 to Dhanmondi 27 (Car, Completed, ৳380, Driver: Rafiqul Islam, 4.9★, bKash)
  - Banani 11 to Hazrat Shahjalal Airport (Car, Completed, ৳520, Driver: Kamal Hossain, 4.8★, Cash)
  - Dhanmondi 27 to Motijheel (CNG, Completed, ৳210, Driver: Abdul Karim, 4.7★, Nagad)
  - Uttara Sector 3 to Mirpur 10 (Bike, Cancelled, ৳0, Driver Cancelled)
- Card actions: "Rebook" button (navigates to `/rider` with dropoff query) and "View Receipt".

### C. Offers Page (`src/app/rider/offers/page.tsx`)
- Top header: "Offers & Discounts".
- Promo input bar with "Apply" button.
- Featured Promo Hero banner ("Dhaka Mega Savings - 50% Off").
- Offer cards:
  - `DHAKA50`: 50% off next Car ride (max ৳100).
  - `CNG25`: 25% discount on all CNG auto-rickshaw trips.
  - `AIRPORT150`: Flat ৳150 off Hazrat Shahjalal Airport drops.
  - `EIDMUBARAK`: Special festival bonus ৳80 off.
- Interactivity: One-tap "Copy Code" with visual checkmark indicator and "Use in Ride" button redirecting to `/rider`.

### D. Profile Page (`src/app/rider/profile/page.tsx`)
- Top header: "My Account".
- User Profile Card:
  - Avatar badge, Name: "Tanvir Ahmed", Phone: "+880 1712-345678", Member tier: "Gold Rider", Rating: "★ 4.92 (128 trips)".
- Saved Places:
  - Home: House 14, Road 27, Dhanmondi.
  - Work: Gulshan Center Point, Gulshan 2.
- Payment Methods:
  - bKash (017***5678) [Default], Nagad, Cash in BDT, Visa (ending in 4021).
- Safety & Emergency:
  - Dhaka Helpline 999 integration indicator, 24/7 GariKoi Support.
- Role & Account Actions:
  - Switch to Driver Mode (`/driver`).
  - Clear Session / Reset.

---

## 6. Verification Plan
- Build check: `pnpm run build` or `pnpm exec tsc --noEmit` to verify TypeScript typing and imports.
- Test check: run tests to ensure no regressions.
- Navigation verification: verify all 4 links navigate to their respective paths (`/rider`, `/rider/activity`, `/rider/offers`, `/rider/profile`) with appropriate active highlighting.
