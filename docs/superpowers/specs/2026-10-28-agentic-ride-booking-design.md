# Agentic Ride Booking Design

**Date:** 2026-10-28  
**Status:** Approved with Revisions  
**Author:** Antigravity Team  

---

## 1. Intent & The "Why"
Riders often know their high-level intent (e.g. *"I need a ride to Banani 11 with 3 friends"*, or *"Take me to Dhanmondi Star Kabab"*), but traditional rideshare apps require multiple manual screens: finding the search bar, entering addresses, selecting vehicle categories, reviewing fares, and confirming dispatch. 

This feature introduces an **Agentic Ride Booking experience**: 
The rider enters a natural-language prompt into an instant typing input field located at the top of the Rider Home Screen. When submitted, the app navigates to a dedicated agentic booking page. An AI-driven agent interprets the rider's request, resolves Dhaka coordinates, identifies any missing parameters (e.g., vehicle type, specific landmark/branch), and interacts with the rider via an executive step-by-step timeline and an interactive question carousel. As questions are answered, each resolved item is displayed as a dedicated card. Once all clarifications are satisfied, the agent computes fares and routes, presents a **Final Confirmation** card for the rider to review and tap confirm, and then dispatches the ride, transitioning the rider directly to the live driver radar/tracking screen.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Top Instant-Typing Input on Home Screen**: A dedicated input field with a submit button at the top of the Rider Home Screen for instant agentic booking prompts.
- **Dedicated Agentic Booking Page**: Navigates to a full-screen agentic experience showing an executive execution timeline.
- **Clarification Question Carousel**: When information is missing (including vehicle type when omitted from the prompt, or ambiguous destination/landmark branches), present follow-up questions one by one in a carousel card format.
- **Answered Questions History**: Render each answered question as a completed card showing what the rider picked/entered for complete transparency.
- **Final Confirmation Step**: After all details are resolved and fare/distance is computed, present a Final Confirmation card with complete trip summary and a "Confirm & Book Ride" button for user sign-off before dispatching.
- **Unavailable State Handling**: If the AI model or service is unavailable, show a clean "Unavailable" message with an option to use manual booking or retry.

### Non-Goals
- Replacing the existing manual location search and fare selector (riders can still use the traditional flow).
- Multi-stop ride scheduling or carpooling negotiation.
- Voice/audio input parsing (text input only for this phase).

### Anti-Goals
- **Chat bubble interface**: Avoid generic messaging/chat bubbles (e.g., WhatsApp or ChatGPT style bubbles). The UI must feel like an autonomous flight-control / dispatching dashboard.
- **Silent booking without final user review**: Avoid dispatching payments/drivers without the rider explicitly reviewing and tapping the final confirmation button.

---

## 3. Constraints
- **Tech Stack**: Next.js App Router, React 18, TypeScript, Tailwind CSS, tRPC 11, Prisma, Lucide React icons.
- **Geographic Scope**: Metropolitan Dhaka, Bangladesh (coordinates bounded within Dhaka bounds, using existing landmarks from `gemini.ts` and `dhakaRoutes.ts`).
- **State Continuity**: Map instances and rider sessions must not be unmounted or lost during transitions.
- **Service Availability**: If the AI agent is offline or fails, explicitly display an "Unavailable" notice.

---

## 4. Architecture & User Flow

```
[Rider Home Screen]
       │  (Top Instant-Typing Agentic Input Field + Submit Button)
       ▼ (User enters prompt & clicks button)
[AGENTIC_BOOKING Page View / AgenticBookingScreen]
       │
       ├─ Step 1: Parse Intent & Identify Parameters
       ├─ Step 2: Resolve Coordinates (Pickup & Dropoff)
       │
       ├─ (If vehicle or details missing) ──► [Question Carousel]
       │                                             │
       │                                             ▼ (Answer question)
       │                                      [Answered Question Card added]
       │                                             │
       │   ◄─────── (All questions answered) ────────┘
       │
       ├─ Step 3: Fare & Route Calculation
       │
       ├─ Step 4: Final Confirmation Card ──► [Rider taps "Confirm & Book Ride"]
       │                                                 │
       ├─ Step 5: Dispatch Booking (ride.request) ◄──────┘
       │
       ▼ (Automatic Transition)
[SEARCHING / Driver Radar Screen]
```

---

## 5. Component & API Specifications

### 5.1 Home Screen UI Update (`HomeScreen.tsx`)
- At the top of the Home Screen (above or integrated into the main header area), add a dedicated **Instant Agentic Ride Booking** section:
  - Text input with placeholder: e.g. *"✨ Ask GariKoi Agent: e.g., Take me to Banani 11 by car..."*
  - Submit action button (e.g., "Book with Agent" or Sparkles arrow icon).
  - On Enter key or button click, invokes `onStartAgenticBooking(prompt)`.

### 5.2 Server Architecture: Tool Registry & Agent Engine
An explicit **Agent Tool Registry** (`src/server/ai/toolRegistry.ts`) defines the tools available to the model. The model iteratively calls tools to solve the booking:

#### Tool Registry Definition
1. **`resolve_location`**:
   - Parameters: `{ query: string, context?: 'pickup' | 'dropoff' }`
   - Description: Resolves place names/landmarks to Dhaka latitude, longitude, and formatted address.
2. **`check_service_boundary`**:
   - Parameters: `{ lat: number, lng: number }`
   - Description: Validates whether coordinates fall within the Dhaka operational bounding box.
3. **`request_clarification`**:
   - Parameters: `{ questions: Array<{ id: string, field: 'vehicleType' | 'dropoff' | 'pickup', question: string, options: Array<{ label: string, value: string, badge?: string }>, placeholder?: string }> }`
   - Description: Emits clarification questions for the rider to answer in the carousel.
4. **`calculate_route_fare`**:
   - Parameters: `{ pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number, vehicleType: 'BIKE' | 'CNG' | 'CAR' }`
   - Description: Computes distance in km and calculates tiered fare breakdown.
5. **`prepare_booking_summary`**:
   - Parameters: `{ pickup: object, dropoff: object, vehicleType: string, distanceKm: number, fare: number }`
   - Description: Packages the trip summary for the rider's final confirmation.

#### Agent Loop & Tool Calling Execution
- The agent passes the user prompt, current state, and the Tool Declarations to the model (Gemini Function Calling or deterministic rule runner).
- The model outputs `functionCall` actions.
- The server executes the corresponding tool from the Tool Registry.
- Each tool execution updates the **Agent Timeline Steps**:
  - `resolve_location` &rarr; updates step `geo`
  - `request_clarification` &rarr; updates step `clarify` and injects questions into the Carousel
  - `calculate_route_fare` &rarr; updates step `pricing`
  - `prepare_booking_summary` &rarr; updates step `confirm` with trip data.
- If a tool fails (e.g. out of boundary), the agent returns `status: 'UNAVAILABLE'` with an error message.

### 5.3 Server Architecture: `agent` tRPC Router (`src/server/routers/agent.ts`)
- **Procedure**: `agent.processBooking`
  - **Input**:
    - `prompt`: string (rider's original prompt)
    - `riderLat`: number (rider's current latitude)
    - `riderLng`: number (rider's current longitude)
    - `answeredQuestions`?: Array of `{ id: string; field: string; question: string; answer: string }`
  - **Output**:
    - `status`: `'NEED_CLARIFICATION' | 'READY_FOR_CONFIRMATION' | 'UNAVAILABLE'`
    - `errorMessage`?: string (e.g., "Agentic booking service is currently unavailable. Please use manual booking.")
    - `steps`: Array of timeline steps:
      - `{ id: 'parse', title: 'Parse Intent', status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING', detail?: string }`
      - `{ id: 'geo', title: 'Resolve Coordinates', status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING', detail?: string }`
      - `{ id: 'clarify', title: 'Clarify Details', status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING', detail?: string }`
      - `{ id: 'pricing', title: 'Calculate Fare & Route', status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING', detail?: string }`
      - `{ id: 'confirm', title: 'Final Confirmation', status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING', detail?: string }`
    - `extracted`:
      - `pickup`: `{ name: string; lat: number; lng: number }`
      - `dropoff`?: `{ name: string; lat: number; lng: number }`
      - `vehicleType`?: `'BIKE' | 'CNG' | 'CAR'`
      - `estimatedDistanceKm`?: number
      - `estimatedFare`?: number
    - `questions`: Array of unfulfilled clarification questions:
      - `{ id: string; field: 'vehicleType' | 'dropoff' | 'pickup'; question: string; options: { label: string; value: string; badge?: string }[]; placeholder?: string }`

### 5.3 Dedicated Screen UI (`AgenticBookingScreen.tsx`)
- **Header**: Back to Home button, "GariKoi AI Agent" title, Status badge.
- **Rider Prompt Card**: Highlighting the rider's request.
- **Execution Timeline**: Vertical stepper reflecting real-time agent progression (*Parse* &rarr; *Resolve Coordinates* &rarr; *Clarifications* &rarr; *Pricing* &rarr; *Final Confirmation*).
- **Question Carousel**:
  - Displays questions one at a time with indicator dots ("Question 1 of N").
  - Quick option chips (e.g. 🏍️ Bike, 🛺 CNG, 🚗 Car) and custom text input with Next/Submit button.
  - Mandatory vehicle question if vehicle type was omitted in the prompt.
- **Answered Cards Section**:
  - Each answered question appears as an individual card with the question label and rider's answer.
- **Final Confirmation Card**:
  - Displayed once all clarifications are resolved and fare/distance are calculated.
  - Summarizes: Pickup Address (with "See on map" button/action), Dropoff Address (with "See on map" button/action), Selected Vehicle, Estimated Distance, and Total Fare (BDT).
  - Also in the timeline steps: whenever pickup or dropoff address is resolved/displayed, a "See on map" button is available.
  - Primary Action Button: **"Confirm & Book Ride"** &rarr; triggers `ride.request` mutation and transitions directly to `SEARCHING` dispatch radar.
- **Unavailable Banner**:
  - Displayed if the AI service fails or returns `UNAVAILABLE`.
  - Shows "Agentic Booking Unavailable" message and a button to switch to manual search or return home.

---

## 6. What is Left to the Builder
- Detailed styling of the top input bar on the Home Screen.
- Animation timing for timeline progression and carousel card slide transitions.
- Unit and integration tests for `agent.processBooking` and `AgenticBookingScreen`.
