// apps/server/src/app.ts
// Normies Alpha — Express + Socket.io server

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { redis } from './lib/redis';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import alertsRouter from './routes/alerts';
import whalesRouter from './routes/whales';
import reputationRouter from './routes/reputation';
import marketRouter from './routes/market';
import historyRouter from './routes/history';
import aiRouter from './routes/ai';
import normiesRouter from './routes/normies';
import authMiddleware from './middleware/auth';
import { startAlertScheduler } from './jobs/alertScheduler';
import { startWhaleScoreScheduler } from './jobs/whaleScoreScheduler';

const app = express();
const httpServer = createServer(app);

// Socket.io
export const io = new SocketServer(httpServer, {
  cors: { origin: process.env.WEB_ORIGIN ?? '*', credentials: true },
});

// Bridge Redis pub/sub -> socket.io
const subscriber = redis.duplicate();
subscriber.connect().then(() => {
  subscriber.subscribe('alerts:new', (message) => {
    const payload = typeof message === 'string' ? JSON.parse(message) : message;
    io.emit('alert:new', payload);
  });
  subscriber.subscribe('whale:move', (message) => {
    const payload = typeof message === 'string' ? JSON.parse(message) : message;
    io.emit('whale:move', payload);
  });
});

// Middleware
app.use(cors({ origin: process.env.WEB_ORIGIN ?? '*', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

const frontendRoot = path.join(__dirname, '../../web/.next');
const frontendPublicRoot = path.join(__dirname, '../../web/public');
const frontendIndexPath = path.join(frontendRoot, 'server', 'app', 'index.html');

if (existsSync(frontendPublicRoot)) {
  app.use(express.static(frontendPublicRoot));
}
app.use('/_next', express.static(frontendRoot));

// Routes
app.use('/api/auth',       authRouter);
app.use('/api/dashboard',  dashboardRouter);
app.use('/api/alerts',     alertsRouter);
app.use('/api/whales',     whalesRouter);
app.use('/api/reputation', reputationRouter);
app.use('/api/market',     marketRouter);
app.use('/api/history',    historyRouter);
app.use('/api/ai',         aiRouter);
app.use('/api/normies',    normiesRouter);

// Root route and fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/_next')) {
    return res.status(404).json({ status: 'Not found' });
  }

  if (existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }

  res.json({ status: 'Normies-World API is live', timestamp: Date.now() });
});

// Start background jobs
startAlertScheduler().catch(console.error);
startWhaleScoreScheduler().catch(console.error);

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on :${PORT}`);
});
