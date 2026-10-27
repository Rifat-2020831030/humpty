import { describe, it, expect } from 'vitest';
import http from 'http';
import { appRouter } from '../../src/server/routers/_app';
import { GET, POST } from '../../src/app/api/trpc/[trpc]/route';
import { trpc, getBaseUrl, getWsUrl, createTRPCClient } from '../../src/trpc/client';
import { TRPCProvider } from '../../src/trpc/Provider';
import { createWSS } from '../../server';

describe('tRPC App Router Definition & Procedures', () => {
  it('exposes all required procedure subrouters', () => {
    expect(appRouter._def.procedures).toHaveProperty('ride.request');
    expect(appRouter._def.procedures).toHaveProperty('ride.accept');
    expect(appRouter._def.procedures).toHaveProperty('ride.onStatusChange');
    expect(appRouter._def.procedures).toHaveProperty('ride.onDriverLocation');
    expect(appRouter._def.procedures).toHaveProperty('location.aiSearch');
    expect(appRouter._def.procedures).toHaveProperty('chat.sendMessage');
    expect(appRouter._def.procedures).toHaveProperty('chat.onMessage');
    expect(appRouter._def.procedures).toHaveProperty('driver.onDensityUpdate');
  });
});

describe('Next.js App Router tRPC Route Handler', () => {
  it('exports GET and POST fetch handlers', () => {
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });

  it('handles GET requests via fetchRequestHandler', async () => {
    const req = new Request('http://localhost:3000/api/trpc/unknownProcedure', {
      method: 'GET',
    });
    const res = await GET(req);
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(404);
  });

  it('handles POST requests via fetchRequestHandler', async () => {
    const req = new Request('http://localhost:3000/api/trpc/unknownProcedure', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(404);
  });
});

describe('tRPC Client and URL Configuration', () => {
  it('creates tRPC react proxy and helpers', () => {
    expect(trpc).toBeDefined();
    expect(typeof trpc.useUtils).toBe('function');
  });

  it('resolves base and websocket urls correctly', () => {
    const baseUrl = getBaseUrl();
    expect(typeof baseUrl).toBe('string');

    const wsUrl = getWsUrl();
    expect(wsUrl).toMatch(/^wss?:\/\//);
  });

  it('creates configured TRPC client with splitLink', () => {
    const client = createTRPCClient();
    expect(client).toBeDefined();
    expect(client.ride).toBeDefined();
    expect(client.chat).toBeDefined();
    expect(client.driver).toBeDefined();
    expect(client.location).toBeDefined();
  });
});

describe('tRPC Provider', () => {
  it('exports TRPCProvider component', () => {
    expect(typeof TRPCProvider).toBe('function');
  });
});

describe('WebSocket Server Handler', () => {
  it('creates and attaches WebSocket handler for subscriptions', () => {
    const server = http.createServer();
    const { wss, handler } = createWSS(server);
    expect(wss).toBeDefined();
    expect(typeof handler.broadcastReconnectNotification).toBe('function');
    wss.close();
  });
});
