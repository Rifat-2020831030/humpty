import { describe, it, expect } from 'vitest';
import { processAgentBooking } from '../../src/server/ai/agentEngine';

describe('Agent Booking Engine', () => {
  const riderLat = 23.7788; // Gulshan 1
  const riderLng = 90.4172;

  it('asks for vehicle clarification if vehicleType is missing from prompt and not answered', async () => {
    const result = await processAgentBooking({
      prompt: 'Take me to Banani 11',
      riderLat,
      riderLng,
    });

    expect(result.status).toBe('NEED_CLARIFICATION');
    expect(result.questions).toBeDefined();
    expect(result.questions?.length).toBeGreaterThan(0);
    const vehicleQuestion = result.questions?.find((q) => q.field === 'vehicleType');
    expect(vehicleQuestion).toBeDefined();
    expect(vehicleQuestion?.options.some((o) => o.value === 'BIKE')).toBe(true);
    expect(vehicleQuestion?.options.some((o) => o.value === 'CNG')).toBe(true);
    expect(vehicleQuestion?.options.some((o) => o.value === 'CAR')).toBe(true);

    // Verify timeline steps
    expect(result.steps).toBeDefined();
    const parseStep = result.steps.find((s) => s.id === 'parse');
    const geoStep = result.steps.find((s) => s.id === 'geo');
    const clarifyStep = result.steps.find((s) => s.id === 'clarify');
    const pricingStep = result.steps.find((s) => s.id === 'pricing');
    const confirmStep = result.steps.find((s) => s.id === 'confirm');

    expect(parseStep?.status).toBe('COMPLETED');
    expect(geoStep?.status).toBe('COMPLETED');
    expect(clarifyStep?.status).toBe('IN_PROGRESS');
    expect(pricingStep?.status).toBe('PENDING');
    expect(confirmStep?.status).toBe('PENDING');

    expect(result.extracted?.dropoff?.name).toContain('Banani');
  });

  it('completes booking directly when vehicleType and destination are explicitly stated', async () => {
    const result = await processAgentBooking({
      prompt: 'Take me to Dhanmondi 27 by car',
      riderLat,
      riderLng,
    });

    expect(result.status).toBe('READY_FOR_CONFIRMATION');
    expect(result.questions).toHaveLength(0);
    expect(result.extracted?.vehicleType).toBe('CAR');
    expect(result.extracted?.dropoff?.name).toContain('Dhanmondi 27');
    expect(result.extracted?.estimatedDistanceKm).toBeGreaterThan(0);
    expect(result.extracted?.estimatedFare).toBeGreaterThan(0);

    for (const step of result.steps) {
      expect(step.status).toBe('COMPLETED');
    }
  });

  it('resolves booking when vehicle question is answered in answeredQuestions', async () => {
    const result = await processAgentBooking({
      prompt: 'Take me to Banani 11',
      riderLat,
      riderLng,
      answeredQuestions: [
        {
          id: 'vehicleType',
          field: 'vehicleType',
          question: 'What kind of ride would you prefer?',
          answer: 'BIKE',
        },
      ],
    });

    expect(result.status).toBe('READY_FOR_CONFIRMATION');
    expect(result.extracted?.vehicleType).toBe('BIKE');
    expect(result.extracted?.dropoff?.name).toContain('Banani');
    expect(result.extracted?.estimatedFare).toBeGreaterThan(0);
    expect(result.questions).toHaveLength(0);

    for (const step of result.steps) {
      expect(step.status).toBe('COMPLETED');
    }
  });

  it('returns UNAVAILABLE when destination is outside Dhaka', async () => {
    const result = await processAgentBooking({
      prompt: 'Take me to Chittagong GEC circle by car',
      riderLat,
      riderLng,
    });

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.errorMessage).toBeDefined();
    expect(result.errorMessage).toMatch(/Dhaka|outside|service area/i);
  });

  it('returns UNAVAILABLE when destination cannot be resolved / gibberish', async () => {
    const result = await processAgentBooking({
      prompt: 'I want to travel to asdkfjhasdkjfhqweryzxcvbnm',
      riderLat,
      riderLng,
    });

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.errorMessage).toBeDefined();
  });

  it('correctly parses custom pickup and dropoff if specified in prompt', async () => {
    const result = await processAgentBooking({
      prompt: 'From Mohakhali to Gulshan 2 by cng',
      riderLat,
      riderLng,
    });

    expect(result.status).toBe('READY_FOR_CONFIRMATION');
    expect(result.extracted?.pickup.name).toContain('Mohakhali');
    expect(result.extracted?.dropoff?.name).toContain('Gulshan 2');
    expect(result.extracted?.vehicleType).toBe('CNG');
  });
});
