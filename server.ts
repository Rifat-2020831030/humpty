import http from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, type WebSocket } from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from './src/server/routers/_app';
import { createTRPCContext } from './src/server/trpc';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

export function createWSS(server: http.Server) {
  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: () => createTRPCContext(),
  });

  return { wss, handler };
}

export async function startServer() {
  await app.prepare();
  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const { wss, handler } = createWSS(server);

  wss.on('connection', (socket: WebSocket) => {
    console.log(`+ WebSocket connection established (${wss.clients.size} total)`);
    socket.once('close', () => {
      console.log(`- WebSocket connection closed (${wss.clients.size} total)`);
    });
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    handler.broadcastReconnectNotification();
    wss.close();
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> WebSocket server listening for subscriptions on port ${port}`);
  });

  return { server, wss, handler };
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
