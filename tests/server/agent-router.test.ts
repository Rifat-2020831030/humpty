import { describe, it, expect } from 'vitest';
import { appRouter } from '../../src/server/routers/_app';
import { db } from '../../src/server/db';

describe('tRPC agent router', () => {
  const caller = appRouter.createCaller({ db, req: {} as any });

  it('exposes processBooking procedure and returns NEED_CLARIFICATION when vehicle is omitted', async () => {
    const result = await caller.agent.processBooking({
      prompt: 'Take me to Banani 11',
      riderLat: 23.7788,
      riderLng: 90.4172,
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('NEED_CLARIFICATION');
    expect(result.questions).toBeDefined();
    expect(result.questions?.length).toBeGreaterThan(0);
  });

  it('returns READY_FOR_CONFIRMATION when all details are provided', async () => {
    const result = await caller.agent.processBooking({
      prompt: 'Take me to Dhanmondi 27 by car',
      riderLat: 23.7788,
      riderLng: 90.4172,
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('READY_FOR_CONFIRMATION');
    expect(result.extracted?.vehicleType).toBe('CAR');
    expect(result.extracted?.estimatedFare).toBeGreaterThan(0);
  });

  it('returns UNAVAILABLE when destination is out of bounds', async () => {
    const result = await caller.agent.processBooking({
      prompt: 'Take me to Sylhet by car',
      riderLat: 23.7788,
      riderLng: 90.4172,
    });

    expect(result.status).toBe('UNAVAILABLE');
    expect(result.errorMessage).toBeDefined();
  });

  it('rejects empty prompt with validation error', async () => {
    await expect(
      caller.agent.processBooking({
        prompt: '',
        riderLat: 23.7788,
        riderLng: 90.4172,
      })
    ).rejects.toThrow();
  });
});
