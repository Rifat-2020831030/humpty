# Agentic Ride Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an agentic ride booking feature where riders can type prompts directly into a top instant-typing bar on the Home Screen, navigate to a dedicated executive agentic dashboard with a progress timeline and a clarification carousel, review answered question cards, and give final confirmation before dispatching the ride directly to the live driver radar screen.

**Architecture:** A backend agent reasoning engine (`agentEngine.ts` and `routers/agent.ts`) parses rider intent with Gemini (and resilient local Dhaka heuristics), detects missing parameters (including mandatory vehicle selection when omitted), and drives a timeline state machine. The frontend features an instant input bar in `HomeScreen.tsx`, a dedicated `AgenticBookingScreen.tsx` component integrated into `rider/page.tsx`'s step machine (`AGENTIC_BOOKING`), a `QuestionCarousel`, `AnsweredCards`, and a `FinalConfirmationCard`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, tRPC 11, Vitest, React Testing Library, Lucide React.

**Spec:** [docs/superpowers/specs/2026-10-28-agentic-ride-booking-design.md](file:///d:/humpty/docs/superpowers/specs/2026-10-28-agentic-ride-booking-design.md)

## Global Constraints

- Tech Stack: Next.js App Router, React 18, TypeScript, Tailwind CSS, tRPC 11, Prisma, Lucide React icons.
- Geographic Scope: Metropolitan Dhaka, Bangladesh (coordinates bounded within Dhaka bounds, using existing landmarks from `gemini.ts` and `dhakaRoutes.ts`).
- State Continuity: Map instances and rider sessions must not be unmounted or lost during transitions.
- Service Availability: If the AI agent is offline or fails, explicitly display an "Unavailable" notice.
- Mandatory Vehicle Clarification: If the prompt does not state a vehicle type, the agent must ask via the carousel.
- User Final Confirmation: Before dispatching the ride, the rider must review trip details and explicitly click "Confirm & Book Ride".

## Review Focus

1. **Unresolvable or Out-of-Bounds Destination**: If prompt mentions a place outside Dhaka (e.g., "Chittagong", "Sylhet") or gibberish, `status` must be `'UNAVAILABLE'` with an informative message and a recovery button.
2. **Missing Vehicle Specification**: If a prompt like "Take me to Dhanmondi 27" is provided without a vehicle, the agent must produce a vehicle clarification question in the carousel before booking.
3. **Carousel State Synchronization**: Answering a question in the carousel must immediately produce an individual completed card in the Answered Cards section and slide to the next question.
4. **Final Confirmation Integrity**: The "Confirm & Book Ride" action must pass exact pickup, dropoff, and vehicle coordinates to `ride.request` and navigate directly to the `SEARCHING` dispatch radar screen.
5. **Home Screen Top Input Execution**: Typing in the top instant input bar on `HomeScreen.tsx` and clicking the submit button (or pressing Enter) must transfer the prompt to the `AGENTIC_BOOKING` step without clearing active GPS/session state.

---

### Task 1: Agent Tool Registry & Tool Calling Engine (`toolRegistry.ts` & `agentEngine.ts`)

**Files:**
- Create: `src/server/ai/toolRegistry.ts`
- Create: `src/server/ai/agentEngine.ts`
- Modify: `src/server/ai/gemini.ts`
- Test: `tests/server/agent-engine.test.ts`
- Test: `tests/server/tool-registry.test.ts`

- [ ] **Step 1: Write failing tests for Tool Registry & Agent Tool Calling**
  Create `tests/server/tool-registry.test.ts` and `tests/server/agent-engine.test.ts`:
  - Tool Registry registers tools: `resolve_location`, `check_service_boundary`, `request_clarification`, `calculate_route_fare`, `prepare_booking_summary`.
  - Tools execute with valid schemas and return expected payloads.
  - Model / Agent Loop invokes tool calls sequentially and maps tool invocations to execution timeline steps.
  - Missing vehicle triggers `request_clarification` tool call with question choices.
  - Out of bounds triggers `check_service_boundary` returning false and yielding `UNAVAILABLE` status.

- [ ] **Step 2: Run tests to confirm failure**
  Run `pnpm vitest run tests/server/tool-registry.test.ts tests/server/agent-engine.test.ts`.

- [ ] **Step 3: Implement `toolRegistry.ts` and `agentEngine.ts`**
  - Implement `toolRegistry.ts` with tool definitions, function declarations for Gemini, and execution handlers.
  - Implement `agentEngine.ts` running the agent loop:
    - Feeds prompt + tool declarations to LLM (or deterministic tool planner if offline/fallback).
    - Dispatches function calls through `toolRegistry.execute(toolName, args)`.
    - Updates timeline progress steps based on executed tools.
    - Yields `status: 'NEED_CLARIFICATION' | 'READY_FOR_CONFIRMATION' | 'UNAVAILABLE'`.

- [ ] **Step 4: Run tests to confirm passing**
  Run `pnpm vitest run tests/server/tool-registry.test.ts tests/server/agent-engine.test.ts`.

- [ ] **Step 5: Git commit**
  Commit with message `feat(agent): implement agent tool registry and tool calling engine`.

---

### Task 2: tRPC `agent` Router & Registration

**Files:**
- Create: `src/server/routers/agent.ts`
- Modify: `src/server/routers/_app.ts`
- Test: `tests/server/agent-router.test.ts`

- [ ] **Step 1: Write failing integration test for `agent.processBooking` tRPC procedure**
  Create `tests/server/agent-router.test.ts` testing the tRPC procedure caller directly with various inputs (missing vehicle, complete prompt, out-of-Dhaka prompt).

- [ ] **Step 2: Run test to confirm failure**
  Run `pnpm vitest run tests/server/agent-router.test.ts`.

- [ ] **Step 3: Implement `src/server/routers/agent.ts` and mount in `_app.ts`**
  - Define Zod schema for `agent.processBooking` input:
    ```ts
    z.object({
      prompt: z.string().min(1),
      riderLat: z.number(),
      riderLng: z.number(),
      answeredQuestions: z.array(z.object({
        id: z.string(),
        field: z.string(),
        question: z.string(),
        answer: z.string(),
      })).optional(),
    })
    ```
  - Call `processAgentBooking` from `src/server/ai/agentEngine.ts`.
  - Register `agent: agentRouter` in `src/server/routers/_app.ts`.

- [ ] **Step 4: Run test to confirm passing**
  Run `pnpm vitest run tests/server/agent-router.test.ts` to ensure tRPC router resolves cleanly.

- [ ] **Step 5: Git commit**
  Commit the agent router with message `feat(agent): add agent tRPC router and register in appRouter`.

---

### Task 3: Question Carousel & Answered Cards Components

**Files:**
- Create: `src/components/rider/agentic/QuestionCarousel.tsx`
- Create: `src/components/rider/agentic/AnsweredCards.tsx`
- Create: `src/components/rider/agentic/index.ts`
- Test: `tests/components/agentic-components.test.tsx`

- [ ] **Step 1: Write tests for `QuestionCarousel` and `AnsweredCards`**
  Create `tests/components/agentic-components.test.tsx`:
  - Renders question carousel with active question, options pills, and custom input.
  - Clicking an option chip invokes `onAnswer(questionId, answerValue)`.
  - Submitting text input invokes `onAnswer`.
  - Multiple questions allow next/prev navigation indicators.
  - `AnsweredCards` renders individual card per answered question with question label and checkmarked answer.

- [ ] **Step 2: Run test to confirm failure**
  Run `pnpm vitest run tests/components/agentic-components.test.tsx`.

- [ ] **Step 3: Implement `QuestionCarousel` and `AnsweredCards`**
  - Build `QuestionCarousel.tsx`:
    - Responsive card with indicator dots ("Question X of Y").
    - Quick option buttons with badges (e.g. "Recommended").
    - Custom text input and submit arrow button.
  - Build `AnsweredCards.tsx`:
    - Clean individual card per answered question showing field/question and selected answer with emerald badge.

- [ ] **Step 4: Run test to confirm passing**
  Run `pnpm vitest run tests/components/agentic-components.test.tsx`.

- [ ] **Step 5: Git commit**
  Commit components with message `feat(agentic-ui): implement QuestionCarousel and AnsweredCards components`.

---

### Task 4: `AgenticBookingScreen` Executive Dashboard

**Files:**
- Create: `src/components/rider/AgenticBookingScreen.tsx`
- Modify: `src/components/rider/index.ts`
- Test: `tests/components/agentic-booking-screen.test.tsx`

- [ ] **Step 1: Write failing component test for `AgenticBookingScreen`**
  Create `tests/components/agentic-booking-screen.test.tsx`:
  - Renders initial prompt card and vertical timeline steps.
  - Shows carousel when questions are pending.
  - Appends card to Answered Questions as carousel is answered.
  - Shows Final Confirmation Card when status is `READY_FOR_CONFIRMATION` with Pickup (with "See on map"), Dropoff (with "See on map"), Vehicle, Distance, Fare, and "Confirm & Book Ride" button.
  - Clicking "See on map" beside an address previews the coordinate pin on the map.
  - Clicking "Confirm & Book Ride" calls `onConfirmBooking({ pickup, dropoff, vehicleType })`.
  - Displays "Unavailable" banner and manual search button when status is `UNAVAILABLE`.

- [ ] **Step 2: Run test to confirm failure**
  Run `pnpm vitest run tests/components/agentic-booking-screen.test.tsx`.

- [ ] **Step 3: Implement `AgenticBookingScreen.tsx`**
  - Executive dashboard layout with dark theme, emerald/blue accents (no chatbox).
  - Vertical timeline stepper with pulse animations.
  - Question carousel integration.
  - Answered cards stack.
  - Final Confirmation Card with complete price & route breakdown.
  - Unavailable error state fallback.

- [ ] **Step 4: Run test to confirm passing**
  Run `pnpm vitest run tests/components/agentic-booking-screen.test.tsx`.

- [ ] **Step 5: Git commit**
  Commit screen with message `feat(rider): implement AgenticBookingScreen executive dashboard`.

---

### Task 5: Home Screen Top Instant Input & Rider Flow Integration

**Files:**
- Modify: `src/components/rider/HomeScreen.tsx`
- Modify: `src/app/rider/page.tsx`
- Test: `tests/components/agentic-flow.test.tsx`

- [ ] **Step 1: Write integration tests for Home Top Input & Flow Transition**
  Create `tests/components/agentic-flow.test.tsx`:
  - Verify top instant typing bar renders on `HomeScreen` with placeholder and submit button.
  - Submitting prompt navigates to `AGENTIC_BOOKING` step.
  - Final confirmation in `AgenticBookingScreen` calls `ride.request` mutation and transitions to `SEARCHING` dispatch radar.

- [ ] **Step 2: Run test to confirm failure**
  Run `pnpm vitest run tests/components/agentic-flow.test.tsx`.

- [ ] **Step 3: Update `HomeScreen.tsx` and `rider/page.tsx`**
  - Add top instant-typing input bar in `HomeScreen.tsx` with Sparkles/GariKoi AI badge and submit button.
  - Add `AGENTIC_BOOKING` to `RiderFlowStep` in `src/app/rider/page.tsx`.
  - Store `agenticPrompt` state and render `AgenticBookingScreen` when step is `AGENTIC_BOOKING`.
  - When `onConfirmBooking` is triggered:
    - Set `pickupCoord`, `dropoffCoord`, `selectedVehicle`.
    - Invoke `requestMutation.mutateAsync`.
    - Set `rideStatus = 'SEARCHING'` and `currentStep = 'SEARCHING'`.

- [ ] **Step 4: Run full test suite**
  Run `pnpm vitest run` to ensure all tests (existing and new) pass without regressions.

- [ ] **Step 5: Verify build**
  Run `pnpm build` or `npx next build` to ensure type safety and build validity.

- [ ] **Step 6: Git commit**
  Commit integration with message `feat(rider): connect instant typing bar and agentic booking flow`.
